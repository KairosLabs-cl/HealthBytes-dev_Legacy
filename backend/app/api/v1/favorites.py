"""Favorites API endpoints"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import logging

from app.db.database import get_db
from app.db.schemas import User
from app.middleware.auth import get_current_user
from app.schemas.favorite import FavoriteCreate, FavoriteResponse, FavoriteCheckResponse
from app.services import favorite_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["favorites"])


@router.post("/", response_model=FavoriteResponse, status_code=status.HTTP_201_CREATED)
async def add_favorite(
    favorite_data: FavoriteCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Add a product to user's favorites.
    Requires authentication.
    """
    try:
        favorite = await favorite_service.add_favorite(
            db, user_id=current_user.id, product_id=favorite_data.product_id
        )
        return favorite
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))
    except Exception as e:
        logger.error(f"Error adding favorite: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to add favorite"
        )


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Remove a product from user's favorites.
    Requires authentication.
    """
    try:
        removed = await favorite_service.remove_favorite(
            db, user_id=current_user.id, product_id=product_id
        )
        if not removed:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error removing favorite: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to remove favorite"
        )


@router.get("/", response_model=List[FavoriteResponse])
async def get_favorites(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get all favorites for the authenticated user.
    Returns favorites with product details.
    """
    try:
        favorites = await favorite_service.get_user_favorites(
            db, user_id=current_user.id, skip=skip, limit=limit
        )
        return favorites
    except Exception as e:
        logger.error(f"Error getting favorites: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get favorites"
        )


@router.get("/check/{product_id}", response_model=FavoriteCheckResponse)
async def check_favorite(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Check if a product is in user's favorites.
    Returns {is_favorite: bool, favorite_id: int | null}
    """
    try:
        is_fav, fav_id = await favorite_service.is_favorite(
            db, user_id=current_user.id, product_id=product_id
        )
        return FavoriteCheckResponse(is_favorite=is_fav, favorite_id=fav_id)
    except Exception as e:
        logger.error(f"Error checking favorite: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to check favorite"
        )


@router.get("/ids", response_model=List[int])
async def get_favorite_ids(
    current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)
):
    """
    Get list of product IDs that are favorited by user.
    Useful for bulk checking favorites in the frontend.
    """
    try:
        product_ids = await favorite_service.get_favorite_product_ids(db, user_id=current_user.id)
        return product_ids
    except Exception as e:
        logger.error(f"Error getting favorite IDs: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to get favorite IDs"
        )
