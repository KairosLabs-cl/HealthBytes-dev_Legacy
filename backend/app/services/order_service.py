"""Order service - Order management and validation logic."""

import logging
from decimal import Decimal
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.schemas import Order, OrderItem, Product
from app.schemas.order import OrderCreate
from app.services.stock_service import StockService

logger = logging.getLogger(__name__)


async def create_order(db: AsyncSession, user_id: int, order_in: OrderCreate) -> Order:
    """
    Create order with validation and price verification.

    This function ensures:
    - All products exist
    - Prices come from database (not client)
    - Stock is sufficient
    - Order and items are created in a transaction

    Args:
        db: Database session
        user_id: User ID creating the order
        order_in: Order data from client

    Returns:
        Created Order object with items

    Raises:
        ValueError: If validation fails (product not found, insufficient stock, etc.)
    """

    # 1. Collect all product IDs
    product_ids = {item.product_id for item in order_in.items}

    if not product_ids:
        raise ValueError("Order must have at least one item")

    # 2. Fetch all products in one query
    result = await db.execute(select(Product).where(Product.id.in_(product_ids)))
    products = result.scalars().all()
    products_map = {p.id: p for p in products}

    # 3. Validate items and calculate total
    total = Decimal("0.0")
    validated_items = []

    # Check if all requested products exist
    found_ids = set(products_map.keys())
    missing_ids = product_ids - found_ids
    if missing_ids:
        raise ValueError(f"Producto(s) con ID {list(missing_ids)} no encontrado(s)")

    # Aggregate quantities per product to check stock properly
    requested_quantities = {}
    for item in order_in.items:
        requested_quantities[item.product_id] = (
            requested_quantities.get(item.product_id, 0) + item.quantity
        )

    # Reserve stock with atomic locking (prevents race conditions)
    # This uses SELECT FOR UPDATE to lock rows during transaction
    # Use batch reservation to reduce N+1 queries
    stock_items = list(requested_quantities.items())
    await StockService.reserve_stock_batch(db=db, items=stock_items)

    # 4. Calculate total and prepare items
    for item in order_in.items:
        product = products_map[item.product_id]
        item_total = product.price * item.quantity
        total += item_total

        validated_items.append(
            {"product_id": item.product_id, "quantity": item.quantity, "price": product.price}
        )

    # 5. Create order and items
    new_order = Order(
        user_id=user_id,
        total=total,
        address_id=order_in.address_id,
        payment_method=order_in.payment_method or "mercado_pago",
    )

    db.add(new_order)
    await db.flush()  # Get ID

    for item_data in validated_items:
        order_item = OrderItem(order_id=new_order.id, **item_data)
        db.add(order_item)

    # No manual commit here, we rely on caller or middleware?
    # Usually service methods might flush but caller commits.
    # But for a transaction script like this, it's safer to commit to encapsulate the unit of work.
    # The API router called `await db.commit()`.
    # I will commit here to ensure transaction integrity within the service method.

    await db.commit()

    logger.info(
        "AUDIT | op=order_create | user=%s | order=%s | total=%s | items=%s",
        user_id,
        new_order.id,
        total,
        len(validated_items),
    )

    # Fetch order with items, user, and products in a single efficient query
    # Eager load user and products so email_service avoids additional DB round-trips
    result = await db.execute(
        select(Order)
        .where(Order.id == new_order.id)
        .options(
            selectinload(Order.items).selectinload(OrderItem.product),
            selectinload(Order.user),
        )
    )
    created_order = result.scalar_one()

    # Send order confirmation email (fire-and-forget)
    try:
        from app.config import settings
        from app.services.email_service import EmailService, build_order_email_data

        email_svc = EmailService(settings)
        email_data = await build_order_email_data(db, created_order)
        if email_data:
            await email_svc.send_order_confirmation(email_data)
    except Exception:
        logger.exception("Failed to send order confirmation email for order %s", created_order.id)

    return created_order


async def get_user_orders(
    db: AsyncSession, user_id: int, skip: int = 0, limit: int = 10
) -> List[Order]:
    """
    Get orders for a specific user with pagination.
    """
    result = await db.execute(
        select(Order)
        .where(Order.user_id == user_id)
        .options(selectinload(Order.items))
        .offset(skip)
        .limit(limit)
        .order_by(Order.created_at.desc())
    )
    return result.scalars().all()


async def get_order(db: AsyncSession, order_id: int, user_id: int) -> Optional[Order]:
    """
    Get order and verify ownership.
    """
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == user_id)
        .options(selectinload(Order.items))
    )
    return result.scalar_one_or_none()


async def update_order_status(db: AsyncSession, order_id: int, status: str) -> Optional[Order]:
    """
    Update order status.
    """
    valid_statuses = ["unpaid", "processing", "shipped", "delivered", "returns", "cancelled"]
    if status not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")

    result = await db.execute(
        select(Order).where(Order.id == order_id).options(selectinload(Order.items))
    )
    db_order = result.scalar_one_or_none()

    if not db_order:
        return None

    # Validate status transition
    current_status = db_order.status
    valid_transitions = {
        "unpaid": ["processing", "cancelled"],
        "processing": ["shipped", "cancelled"],
        "shipped": ["delivered", "cancelled"],
        "delivered": ["returns"],
        "returns": ["delivered", "cancelled"],
        "cancelled": [],
    }

    if status not in valid_transitions.get(current_status, []):
        raise ValueError(f"Invalid status transition from {current_status} to {status}")

    # Release stock when order is cancelled
    if status == "cancelled" and current_status != "cancelled":
        items_to_release = [(item.product_id, item.quantity) for item in db_order.items]
        await StockService.release_stock_batch(
            db=db,
            items=items_to_release,
            reason=f"Order {order_id} cancelled",
        )

    db_order.status = status

    logger.info(
        "AUDIT | op=order_status_change | order=%s | from=%s | to=%s",
        order_id,
        current_status,
        status,
    )

    await db.commit()
    await db.refresh(db_order)
    return db_order
