"""
Cart service - Business logic for shopping cart operations
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import joinedload
from fastapi import HTTPException
from typing import List

from app.db.schemas import CartItem, Product
from app.schemas.cart import CartItemCreate, CartResponse, CartItemResponse


async def get_cart(user_id: int, db: AsyncSession) -> CartResponse:
    """
    Get user's cart with all items and product details
    """
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id)
        .options(joinedload(CartItem.product))
    )
    cart_items = result.scalars().all()
    
    # Calculate total
    total = sum(item.quantity * item.product.price for item in cart_items)
    
    return CartResponse(
        items=[CartItemResponse.model_validate(item) for item in cart_items],
        total=total
    )


async def add_to_cart(
    user_id: int, 
    product_id: int, 
    quantity: int, 
    db: AsyncSession
) -> CartItemResponse:
    """
    Add item to cart or increment quantity if already exists
    """
    # Check if product exists
    product_result = await db.execute(
        select(Product).where(Product.id == product_id)
    )
    product = product_result.scalar_one_or_none()
    
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    # Check if item already in cart
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id, CartItem.product_id == product_id)
        .options(joinedload(CartItem.product))
    )
    existing_item = result.scalar_one_or_none()
    
    if existing_item:
        # Increment quantity
        existing_item.quantity += quantity
        await db.commit()
        await db.refresh(existing_item)
        return CartItemResponse.model_validate(existing_item)
    
    # Create new cart item
    new_item = CartItem(
        user_id=user_id,
        product_id=product_id,
        quantity=quantity
    )
    db.add(new_item)
    await db.commit()
    await db.refresh(new_item)
    
    # Load product relationship
    result = await db.execute(
        select(CartItem)
        .where(CartItem.id == new_item.id)
        .options(joinedload(CartItem.product))
    )
    new_item = result.scalar_one()
    
    return CartItemResponse.model_validate(new_item)


async def update_cart_item(
    user_id: int,
    product_id: int,
    quantity: int,
    db: AsyncSession
) -> CartItemResponse:
    """
    Update quantity of a cart item
    """
    result = await db.execute(
        select(CartItem)
        .where(CartItem.user_id == user_id, CartItem.product_id == product_id)
        .options(joinedload(CartItem.product))
    )
    cart_item = result.scalar_one_or_none()
    
    if not cart_item:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    cart_item.quantity = quantity
    await db.commit()
    await db.refresh(cart_item)
    
    return CartItemResponse.model_validate(cart_item)


async def remove_from_cart(
    user_id: int,
    product_id: int,
    db: AsyncSession
) -> None:
    """
    Remove item from cart
    """
    result = await db.execute(
        delete(CartItem)
        .where(CartItem.user_id == user_id, CartItem.product_id == product_id)
    )
    
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Item not found in cart")
    
    await db.commit()


async def clear_cart(user_id: int, db: AsyncSession) -> None:
    """
    Clear all items from user's cart
    """
    await db.execute(
        delete(CartItem).where(CartItem.user_id == user_id)
    )
    await db.commit()


async def merge_cart_items(
    user_id: int,
    local_items: List[CartItemCreate],
    db: AsyncSession
) -> CartResponse:
    """
    Merge local cart items with server cart (on login)
    - If product exists on server: add quantities
    - If product is new: add to server cart
    """
    for item in local_items:
        # Check if product exists
        product_result = await db.execute(
            select(Product).where(Product.id == item.product_id)
        )
        product = product_result.scalar_one_or_none()
        
        if not product:
            # Skip invalid products from local cart
            continue
        
        # Check if item already in server cart
        result = await db.execute(
            select(CartItem).where(
                CartItem.user_id == user_id,
                CartItem.product_id == item.product_id
            )
        )
        existing_item = result.scalar_one_or_none()
        
        if existing_item:
            # Add quantities
            existing_item.quantity += item.quantity
        else:
            # Create new item
            new_item = CartItem(
                user_id=user_id,
                product_id=item.product_id,
                quantity=item.quantity
            )
            db.add(new_item)
    
    await db.commit()
    
    # Return merged cart
    return await get_cart(user_id, db)
