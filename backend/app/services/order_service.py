"""Order service - Order management and validation logic."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from typing import List, Optional

from app.db.schemas import Order, OrderItem, Product, User
from app.schemas.order import OrderCreate


async def create_order(
    db: AsyncSession,
    user_id: str,
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
    # Validate all products exist and calculate total
    total = 0.0
    validated_items = []
    
    for item in order_in.items:
        # Get product from database
        result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = result.scalar_one_or_none()
        
        if not product:
            raise ValueError(f"Product {item.product_id} not found")
        
        # Validate stock
        if product.stock < item.quantity:
            raise ValueError(
                f"Insufficient stock for {product.name}. "
                f"Available: {product.stock}, requested: {item.quantity}"
            )
        
        # Calculate price from database (NEVER trust client)
        item_total = product.price * item.quantity
        total += item_total
        
        validated_items.append({
            'product_id': item.product_id,
            'quantity': item.quantity,
            'price': product.price  # Database price
        })
    
    # Create order in transaction
    async with db.begin_nested():
        # Create order
        db_order = Order(
            user_id=user_id,
            total=total,
            status='pending'
        )
        db.add(db_order)
        await db.flush()  # Get order ID
        
        # Create order items
        for item_data in validated_items:
            order_item = OrderItem(
                order_id=db_order.id,
                **item_data
            )
            db.add(order_item)
        
        # Reduce stock
        for item in order_in.items:
            result = await db.execute(
                select(Product).where(Product.id == item.product_id)
            )
            product = result.scalar_one_or_none()
            if product:
                product.stock -= item.quantity
                db.add(product)
    
    await db.commit()
    
    # Reload order with items
    result = await db.execute(
        select(Order)
        .where(Order.id == db_order.id)
        .options(selectinload(Order.items))
    )
    return result.scalar_one()


async def get_user_orders(
    db: AsyncSession,
    user_id: str,
    skip: int = 0,
    limit: int = 10
) -> List[Order]:
    """
    Get orders for a specific user with pagination.
    
    Args:
        db: Database session
        user_id: User ID
        skip: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        List of Order objects with items
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
    order_id: str,
    user_id: str
) -> Optional[Order]:
    """
    Get order and verify ownership.
    
    Args:
        db: Database session
        order_id: Order ID
        user_id: User ID to verify ownership
        
    Returns:
        Order object or None if not found or not owned by user
    """
    result = await db.execute(
        select(Order)
        .where(Order.id == order_id, Order.user_id == user_id)
        .options(selectinload(Order.items))
    )
    return result.scalar_one_or_none()


async def update_order_status(
    db: AsyncSession,
    order_id: str,
    status: str
) -> Optional[Order]:
    """
    Update order status.
    
    Valid status transitions:
    - pending → processing
    - processing → shipped
    - processing → cancelled
    
    Args:
        db: Database session
        order_id: Order ID
        status: New status
        
    Returns:
        Updated Order object or None if not found
        
    Raises:
        ValueError: If status transition is invalid
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
