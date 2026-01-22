"""Order service - Order management and validation logic."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.schemas import Order, OrderItem, Product
from app.schemas.order import OrderCreate


async def create_order(
    db: AsyncSession,
    user_id: int,
    order_in: OrderCreate
) -> Order:
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
    product_ids = {item.productId for item in order_in.items}

    if not product_ids:
        raise ValueError("Order must have at least one item")

    # 2. Fetch all products in one query
    result = await db.execute(
        select(Product).where(Product.id.in_(product_ids))
    )
    products = result.scalars().all()
    products_map = {p.id: p for p in products}

    # 3. Validate items and calculate total
    total = 0.0
    validated_items = []
    
    # Check if all requested products exist
    found_ids = set(products_map.keys())
    missing_ids = product_ids - found_ids
    if missing_ids:
        raise ValueError(f"Producto(s) con ID {list(missing_ids)} no encontrado(s)")
        
    # Aggregate quantities per product to check stock properly
    requested_quantities = {}
    for item in order_in.items:
        requested_quantities[item.productId] = requested_quantities.get(item.productId, 0) + item.quantity
        
    for pid, qty in requested_quantities.items():
        product = products_map[pid]
        if product.stock < qty:
            raise ValueError(
                f"Insufficient stock for {product.name}. "
                f"Available: {product.stock}, requested: {qty}"
            )
        
        # Reduce stock (in memory, will be flushed on commit)
        product.stock -= qty
        db.add(product)

    # 4. Calculate total and prepare items
    for item in order_in.items:
        product = products_map[item.productId]
        item_total = product.price * item.quantity
        total += item_total
        
        validated_items.append({
            'product_id': item.productId,
            'quantity': item.quantity,
            'price': product.price
        })
    
    # 5. Create order and items
    stripe_payment_intent_id = order_in.order.get("stripePaymentIntentId")

    new_order = Order(
        user_id=user_id,
        total=total,
        stripe_payment_intent_id=stripe_payment_intent_id
    )

    db.add(new_order)
    await db.flush() # Get ID

    for item_data in validated_items:
        order_item = OrderItem(
            order_id=new_order.id,
            **item_data
        )
        db.add(order_item)
        
    # No manual commit here, we rely on caller or middleware?
    # Usually service methods might flush but caller commits.
    # But for a transaction script like this, it's safer to commit if it encapsulates the unit of work.
    # The API router called `await db.commit()`.
    # I will commit here to ensure transaction integrity within the service method.
    
    await db.commit()
    await db.refresh(new_order)
    
    # Refresh items efficienty
    result = await db.execute(
        select(Order)
        .where(Order.id == new_order.id)
        .options(selectinload(Order.items))
    )
    return result.scalar_one()


async def get_user_orders(
    db: AsyncSession,
    user_id: int,
    skip: int = 0,
    limit: int = 10
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


async def get_order(
    db: AsyncSession,
    order_id: int,
    user_id: int
) -> Optional[Order]:
    """
    Get order and verify ownership.
    """
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == user_id)
        .options(selectinload(Order.items))
    )
    return result.scalar_one_or_none()


async def update_order_status(
    db: AsyncSession,
    order_id: int,
    status: str
) -> Optional[Order]:
    """
    Update order status.
    """
    valid_statuses = ['pending', 'processing', 'shipped', 'cancelled']
    if status not in valid_statuses:
        raise ValueError(f"Invalid status. Must be one of: {valid_statuses}")
    
    result = await db.execute(
        select(Order).where(Order.id == order_id)
    )
    db_order = result.scalar_one_or_none()
    
    if not db_order:
        return None
    
    # Validate status transition
    current_status = db_order.status
    valid_transitions = {
        'pending': ['processing', 'cancelled'],
        'processing': ['shipped', 'cancelled'],
        'shipped': [],  # Cannot change once shipped
        'cancelled': []  # Cannot change once cancelled
    }
    
    if status not in valid_transitions.get(current_status, []):
        raise ValueError(
            f"Invalid status transition from {current_status} to {status}"
        )
    
    db_order.status = status
    await db.commit()
    await db.refresh(db_order)
    return db_order
