"""
Stock Service
Business logic for inventory management with race condition prevention
"""

from enum import Enum
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schemas import Product


class StockStatus(str, Enum):
    """Stock availability status"""

    IN_STOCK = "in_stock"
    LOW_STOCK = "low_stock"
    OUT_OF_STOCK = "out_of_stock"


class StockService:
    """Service for managing product stock with race condition protection"""

    DEFAULT_LOW_STOCK_THRESHOLD = 5

    @staticmethod
    async def check_availability(
        db: AsyncSession, product_id: int, quantity: int
    ) -> Dict[str, Any]:
        """
        Check if product has sufficient stock

        Returns dict with availability info
        Does NOT lock the row (read-only check)
        """
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Product {product_id} not found"},
            )

        is_available = product.stock >= quantity
        stock_status = StockService._calculate_stock_status(product.stock)

        return {
            "product_id": product_id,
            "product_name": product.name,
            "current_stock": product.stock,
            "requested_quantity": quantity,
            "is_available": is_available,
            "stock_status": stock_status,
            "low_stock_threshold": StockService.DEFAULT_LOW_STOCK_THRESHOLD,
        }

    @staticmethod
    async def reserve_stock_atomic(
        db: AsyncSession, product_id: int, quantity: int, order_id: Optional[int] = None
    ) -> Product:
        """
        Reserve stock with pessimistic locking to prevent race conditions

        Uses SELECT ... FOR UPDATE to lock the row during transaction.
        This ensures no other transaction can read/modify stock until we commit.

        Args:
            db: Database session (must be in transaction)
            product_id: Product to reserve stock from
            quantity: Amount to reserve
            order_id: Optional order ID for logging

        Returns:
            Updated Product object

        Raises:
            HTTPException: If product not found or insufficient stock
        """
        # SELECT FOR UPDATE locks the row until transaction commits
        result = await db.execute(
            select(Product)
            .where(Product.id == product_id)
            .with_for_update()  # 🔒 CRITICAL: Pessimistic lock
        )
        product = result.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Product {product_id} not found"},
            )

        # Check stock availability
        if product.stock < quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "message": f"Insufficient stock for {product.name}",
                    "available": product.stock,
                    "requested": quantity,
                },
            )

        # Reserve stock (reduce)
        product.stock -= quantity

        # NOTE: Changes will be committed by the calling transaction
        # Do NOT commit here - let the order creation handle it

        return product

    @staticmethod
    async def release_stock(
        db: AsyncSession, product_id: int, quantity: int, reason: str = "Order cancelled"
    ) -> Product:
        """
        Release reserved stock back to inventory

        Used when:
        - Order is cancelled
        - Payment fails
        - Order is refunded

        Args:
            db: Database session
            product_id: Product to release stock to
            quantity: Amount to release
            reason: Reason for release (for logging)

        Returns:
            Updated Product object
        """
        result = await db.execute(select(Product).where(Product.id == product_id).with_for_update())
        product = result.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Product {product_id} not found"},
            )

        # Return stock
        product.stock += quantity

        await db.commit()
        await db.refresh(product)

        return product

    @staticmethod
    async def update_stock(
        db: AsyncSession, product_id: int, new_stock: int, admin_user_id: str
    ) -> Product:
        """
        Manually update stock (admin only)

        Args:
            db: Database session
            product_id: Product to update
            new_stock: New stock value
            admin_user_id: Admin user making the change

        Returns:
            Updated Product object
        """
        if new_stock < 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={"message": "Stock cannot be negative"},
            )

        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Product {product_id} not found"},
            )

        product.stock = new_stock

        await db.commit()
        await db.refresh(product)

        # TODO: Log stock change for audit trail
        # logger.info(f"Stock updated by admin {admin_user_id}: "
        #            f"Product {product_id} from {old_stock} to {new_stock}")

        return product

    @staticmethod
    async def get_stock_info(db: AsyncSession, product_id: int) -> Dict[str, Any]:
        """
        Get detailed stock information for a product

        Returns:
            Dict with stock details and status
        """
        result = await db.execute(select(Product).where(Product.id == product_id))
        product = result.scalar_one_or_none()

        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Product {product_id} not found"},
            )

        stock_status = StockService._calculate_stock_status(product.stock)

        return {
            "product_id": product.id,
            "product_name": product.name,
            "stock": product.stock,
            "stock_status": stock_status,
            "is_available": product.stock > 0,
            "is_low_stock": stock_status == StockStatus.LOW_STOCK,
            "threshold": StockService.DEFAULT_LOW_STOCK_THRESHOLD,
        }

    @staticmethod
    def _calculate_stock_status(stock: int) -> StockStatus:
        """
        Calculate stock status based on current stock level

        Args:
            stock: Current stock level

        Returns:
            StockStatus enum value
        """
        if stock == 0:
            return StockStatus.OUT_OF_STOCK
        elif stock < StockService.DEFAULT_LOW_STOCK_THRESHOLD:
            return StockStatus.LOW_STOCK
        else:
            return StockStatus.IN_STOCK

    @staticmethod
    async def bulk_check_availability(
        db: AsyncSession, items: list[tuple[int, int]]  # [(product_id, quantity), ...]
    ) -> Dict[int, Dict[str, Any]]:
        """
        Check availability for multiple products at once

        Useful for cart validation before checkout

        Args:
            db: Database session
            items: List of (product_id, quantity) tuples

        Returns:
            Dict mapping product_id to availability info
        """
        product_ids = [item[0] for item in items]

        result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
        products = {p.id: p for p in result.scalars().all()}

        availability_map = {}

        for product_id, quantity in items:
            product = products.get(product_id)

            if not product:
                availability_map[product_id] = {
                    "product_id": product_id,
                    "error": "Product not found",
                    "is_available": False,
                }
                continue

            is_available = product.stock >= quantity

            availability_map[product_id] = {
                "product_id": product_id,
                "product_name": product.name,
                "current_stock": product.stock,
                "requested_quantity": quantity,
                "is_available": is_available,
                "stock_status": StockService._calculate_stock_status(product.stock),
            }

        return availability_map
