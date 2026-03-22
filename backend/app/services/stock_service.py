"""
Stock Service
Business logic for inventory management with race condition prevention
"""

import logging
from enum import Enum
from typing import Any, Dict, Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schemas import Product

logger = logging.getLogger(__name__)


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
        old_stock = product.stock
        product.stock -= quantity

        logger.info(
            "AUDIT | op=stock_reserve | product=%s | qty=%s | old_stock=%s | new_stock=%s | order=%s",
            product_id,
            quantity,
            old_stock,
            product.stock,
            order_id,
        )

        # NOTE: Changes will be committed by the calling transaction
        # Do NOT commit here - let the order creation handle it

        return product

    @staticmethod
    async def reserve_stock_batch(
        db: AsyncSession, items: list[tuple[int, int]]  # [(product_id, quantity), ...]
    ) -> list[Product]:
        """
        Reserve stock for multiple products in a single atomic transaction.

        Args:
            db: Database session (must be in transaction)
            items: List of (product_id, quantity) tuples

        Returns:
            List of updated Product objects

        Raises:
            HTTPException: If any product is not found or has insufficient stock
        """
        if not items:
            return []

        # Sort items by product_id to prevent deadlocks (canonical ordering)
        sorted_items = sorted(items, key=lambda x: x[0])
        product_ids = [item[0] for item in sorted_items]

        # Fetch all products with pessimistic lock in deterministic order
        result = await db.execute(
            select(Product)
            .where(Product.id.in_(product_ids))
            .order_by(Product.id)
            .with_for_update()
        )
        products = result.scalars().all()
        products_map = {p.id: p for p in products}

        # Validate all products exist
        missing_ids = set(product_ids) - set(products_map.keys())
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Products with IDs {list(missing_ids)} not found"},
            )

        # Pass 1: validate all quantities before mutating anything
        for pid, qty in sorted_items:
            product = products_map[pid]
            if product.stock < qty:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail={
                        "message": f"Insufficient stock for {product.name}",
                        "available": product.stock,
                        "requested": qty,
                        "product_id": pid,
                    },
                )

        # Pass 2: apply all decrements only after full validation succeeds
        updated_products = []
        for pid, qty in sorted_items:
            old_stock = products_map[pid].stock
            products_map[pid].stock -= qty
            updated_products.append(products_map[pid])

            logger.info(
                "AUDIT | op=stock_reserve_batch | product=%s | qty=%s | old_stock=%s | new_stock=%s",
                pid,
                qty,
                old_stock,
                products_map[pid].stock,
            )

        # Changes are committed by the caller
        return updated_products

    @staticmethod
    async def release_stock_batch(
        db: AsyncSession, items: list[tuple[int, int]], reason: str = "Order cancelled"
    ) -> list[Product]:
        """
        Release reserved stock back to inventory for multiple products in a single atomic transaction.

        Used when:
        - Order is cancelled
        - Payment fails
        - Order is refunded

        Args:
            db: Database session (must be in transaction)
            items: List of (product_id, quantity) tuples
            reason: Reason for release (for logging)

        Returns:
            List of updated Product objects

        Raises:
            HTTPException: If any product is not found
        """
        if not items:
            return []

        # Sort items by product_id to prevent deadlocks (canonical ordering)
        sorted_items = sorted(items, key=lambda x: x[0])
        product_ids = [item[0] for item in sorted_items]

        # Fetch all products with pessimistic lock in deterministic order
        result = await db.execute(
            select(Product)
            .where(Product.id.in_(product_ids))
            .order_by(Product.id)
            .with_for_update()
        )
        products = result.scalars().all()
        products_map = {p.id: p for p in products}

        # Validate all products exist
        missing_ids = set(product_ids) - set(products_map.keys())
        if missing_ids:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={"message": f"Products with IDs {list(missing_ids)} not found"},
            )

        updated_products = []
        for pid, qty in sorted_items:
            product = products_map[pid]
            old_stock = product.stock
            product.stock += qty
            updated_products.append(product)

            logger.info(
                "AUDIT | op=stock_release_batch | product=%s | qty=%s | old_stock=%s | new_stock=%s | reason=%s",
                pid,
                qty,
                old_stock,
                product.stock,
                reason,
            )

        # Changes are committed by the caller
        return updated_products

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
        old_stock = product.stock
        product.stock += quantity

        logger.info(
            "AUDIT | op=stock_release | product=%s | qty=%s | old_stock=%s | new_stock=%s | reason=%s",
            product_id,
            quantity,
            old_stock,
            product.stock,
            reason,
        )

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

        old_stock = product.stock
        product.stock = new_stock

        logger.info(
            "AUDIT | op=stock_admin_update | user=%s | product=%s | old_stock=%s | new_stock=%s",
            admin_user_id,
            product_id,
            old_stock,
            new_stock,
        )

        await db.commit()
        await db.refresh(product)

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
