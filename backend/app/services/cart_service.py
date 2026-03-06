"""
Cart service - Business logic for shopping cart operations
"""

import logging
from typing import List

from fastapi import HTTPException
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.db.schemas import CartItem, OrderItem, Product
from app.schemas.cart import CartItemCreate, CartItemResponse, CartResponse

logger = logging.getLogger(__name__)


async def _get_available_stock(db: AsyncSession, product: Product) -> int:
    """Calculate available stock by subtracting reserved stock from pending orders."""
    from app.db.schemas import Order

    result = await db.execute(
        select(func.coalesce(func.sum(OrderItem.quantity), 0)).where(
            OrderItem.product_id == product.id,
            OrderItem.order_id == Order.id,
            Order.status.in_(["unpaid", "processing", "shipped"]),
        )
    )
    reserved = result.scalar()
    return max(0, product.stock - reserved)


async def get_cart(user_id: int, db: AsyncSession) -> CartResponse:
    """
    Get user's cart with all items and product details
    """
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(joinedload(CartItem.product).selectinload(Product.dietary_tags))
    )
    cart_items = result.scalars().all()

    # Calculate total
    total = sum(item.quantity * item.product.price for item in cart_items)

    return CartResponse(
        items=[CartItemResponse.model_validate(item) for item in cart_items], total=total
    )


async def add_to_cart(
    user_id: int, product_id: int, quantity: int, db: AsyncSession
) -> CartItemResponse:
    """
    Add item to cart or increment quantity if already exists
    """
    # Check if product exists
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    available_stock = await _get_available_stock(db, product)
    if quantity > available_stock:
        raise HTTPException(status_code=400, detail="Insufficient stock")

    # Check if item already in cart
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id, CartItem.product_id == product_id)
        .options(joinedload(CartItem.product).selectinload(Product.dietary_tags))
    )
    existing_item = result.scalar_one_or_none()

    if existing_item:
        # Increment quantity
        new_quantity = existing_item.quantity + quantity
        if new_quantity > available_stock:
            raise HTTPException(
                status_code=400,
                detail=f"Stock insuficiente. Solo quedan {available_stock} unidades disponibles.",
            )

        existing_item.quantity = new_quantity
        await db.commit()
        # Re-load with dietary_tags after commit
        result = await db.execute(
            select(CartItem)
            .where(CartItem.id == existing_item.id)
            .options(joinedload(CartItem.product).selectinload(Product.dietary_tags))
        )
        existing_item = result.scalar_one()
        return CartItemResponse.model_validate(existing_item)

    # Create new cart item
    new_item = CartItem(user_id=user_id, product_id=product_id, quantity=quantity)
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)

    # Load product relationship with dietary_tags
    result = await db.execute(
        select(CartItem)
        .where(CartItem.id == new_item.id)
        .options(joinedload(CartItem.product).selectinload(Product.dietary_tags))
    )
    new_item = result.scalar_one()

    return CartItemResponse.model_validate(new_item)


async def update_cart_item(
    user_id: int, product_id: int, quantity: int, db: AsyncSession
) -> CartItemResponse:
    """
    Update quantity of a cart item
    """
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id, CartItem.product_id == product_id)
        .options(joinedload(CartItem.product).selectinload(Product.dietary_tags))
    )
    cart_item = result.scalar_one_or_none()

    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")

    # Validar stock solo si estamos aumentando la cantidad o manteniéndola
    # Si el usuario reduce la cantidad (aunque siga por encima del stock), permitimos la operación
    available_stock = await _get_available_stock(db, cart_item.product)
    if quantity > available_stock and quantity >= cart_item.quantity:
        raise HTTPException(
            status_code=400,
            detail=(f"Stock insuficiente. Solo quedan " f"{available_stock} unidades disponibles."),
        )

    cart_item.quantity = quantity
    await db.commit()
    # Re-load with dietary_tags after commit
    result = await db.execute(
        select(CartItem)
        .where(CartItem.id == cart_item.id)
        .options(joinedload(CartItem.product).selectinload(Product.dietary_tags))
    )
    cart_item = result.scalar_one()

    return CartItemResponse.model_validate(cart_item)


async def remove_from_cart(user_id: int, product_id: int, db: AsyncSession) -> None:
    """
    Remove item from cart
    """
    await db.execute(
        delete(CartItem).where(CartItem.user_id == user_id, CartItem.product_id == product_id)
    )

    # Don't raise error if item not found - it's already removed
    await db.commit()


async def clear_cart(user_id: int, db: AsyncSession) -> None:
    """
    Clear all items from user's cart
    """
    await db.execute(delete(CartItem).where(CartItem.user_id == user_id))
    await db.commit()


async def merge_cart_items(
    user_id: int, local_items: List[CartItemCreate], db: AsyncSession
) -> CartResponse:
    """
    Merge local cart items with server cart (on login)
    - If product exists on server: use local quantity (current session takes priority)
    - If product is new: add to server cart
    """
    for item in local_items:
        # Check if product exists
        product_result = await db.execute(select(Product).where(Product.id == item.product_id))
        product = product_result.scalar_one_or_none()

        if not product:
            # Skip invalid products from local cart
            continue

        # Check if item already in server cart
        result = await db.execute(
            select(CartItem).where(
                CartItem.user_id == user_id, CartItem.product_id == item.product_id
            )
        )
        existing_item = result.scalar_one_or_none()

        if existing_item:
            # Use local quantity (user's current session takes priority over old server data)
            existing_item.quantity = min(item.quantity, product.stock)
        else:
            # Create new item, but don't exceed stock
            final_quantity = min(item.quantity, product.stock)

            # Only add if quantity is valid (> 0)
            if final_quantity > 0:
                new_item = CartItem(
                    user_id=user_id, product_id=item.product_id, quantity=final_quantity
                )
                db.add(new_item)

    await db.commit()

    # Return merged cart
    return await get_cart(user_id, db)
