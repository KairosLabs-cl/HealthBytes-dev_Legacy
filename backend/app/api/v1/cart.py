"""
Cart API endpoints
"""

from app.db.database import get_db
from app.db.schemas import User
from app.middleware.auth import get_current_user
from app.schemas.cart import (
    CartItemCreate,
    CartItemResponse,
    CartItemUpdate,
    CartMergeRequest,
    CartResponse,
)
from app.services import cart_service
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(tags=["cart"])


@router.get("", response_model=CartResponse)
async def get_cart(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    GET /cart
    Get current user's shopping cart with all items and total
    """
    return await cart_service.get_cart(current_user.id, db)


@router.post("/items", response_model=CartItemResponse, status_code=status.HTTP_201_CREATED)
async def add_to_cart(
    item: CartItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    POST /cart/items
    Add item to cart or increment quantity if already exists
    """
    return await cart_service.add_to_cart(current_user.id, item.product_id, item.quantity, db)


@router.put("/items/{product_id}", response_model=CartItemResponse)
async def update_cart_item(
    product_id: int,
    update: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    PUT /cart/items/{product_id}
    Update quantity of a specific cart item
    """
    return await cart_service.update_cart_item(current_user.id, product_id, update.quantity, db)


@router.delete("/items/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_from_cart(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    DELETE /cart/items/{product_id}
    Remove specific item from cart
    """
    await cart_service.remove_from_cart(current_user.id, product_id, db)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
async def clear_cart(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    DELETE /cart
    Clear all items from cart (useful after checkout)
    """
    await cart_service.clear_cart(current_user.id, db)


@router.post("/merge", response_model=CartResponse)
async def merge_cart(
    request: CartMergeRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    POST /cart/merge
    Merge local cart items with server cart (called on login)
    Combines quantities for existing products, adds new ones
    """
    return await cart_service.merge_cart_items(current_user.id, request.items, db)
