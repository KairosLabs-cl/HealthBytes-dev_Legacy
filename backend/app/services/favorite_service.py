"""Favorite service - Business logic for user favorites"""

import logging
from typing import List, Optional

from sqlalchemy import and_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from app.db.schemas import Product, UserFavorite

logger = logging.getLogger(__name__)


async def add_favorite(db: AsyncSession, user_id: int, product_id: int) -> UserFavorite:
    """
    Add a product to user's favorites.
    Returns UserFavorite with product relationship loaded.
    """
    try:
        # Check if already favorited
        existing = await db.execute(
            select(UserFavorite).where(
                and_(UserFavorite.user_id == user_id, UserFavorite.product_id == product_id)
            )
        )
        if existing.scalar_one_or_none():
            logger.info("Product %s already in favorites for user %s", product_id, user_id)
            raise ValueError("Product already in favorites")

        # Create new favorite
        favorite = UserFavorite(user_id=user_id, product_id=product_id)
        db.add(favorite)
        await db.commit()
        await db.refresh(favorite)

        # Load product relationship with dietary_tags
        result = await db.execute(
            select(UserFavorite)
            .options(joinedload(UserFavorite.product).selectinload(Product.dietary_tags))
            .where(UserFavorite.id == favorite.id)
        )
        favorite_with_product = result.scalar_one()

        logger.info("Added product %s to favorites for user %s", product_id, user_id)
        return favorite_with_product

    except Exception as e:
        await db.rollback()
        logger.error("Error adding favorite: %s", type(e).__name__)
        raise


async def remove_favorite(db: AsyncSession, user_id: int, product_id: int) -> bool:
    """
    Remove a product from user's favorites.
    Returns True if removed, False if not found.
    """
    try:
        result = await db.execute(
            select(UserFavorite).where(
                and_(UserFavorite.user_id == user_id, UserFavorite.product_id == product_id)
            )
        )
        favorite = result.scalar_one_or_none()

        if not favorite:
            logger.warning("Favorite not found for user %s, product %s", user_id, product_id)
            return False

        await db.delete(favorite)
        await db.commit()

        logger.info("Removed product %s from favorites for user %s", product_id, user_id)
        return True

    except Exception as e:
        await db.rollback()
        logger.error("Error removing favorite: %s", type(e).__name__)
        raise


async def get_user_favorites(
    db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
) -> List[UserFavorite]:
    """
    Get all favorites for a user with product details.
    """
    try:
        result = await db.execute(
            select(UserFavorite)
            .options(joinedload(UserFavorite.product).selectinload(Product.dietary_tags))
            .where(UserFavorite.user_id == user_id)
            .order_by(UserFavorite.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        favorites = result.scalars().all()

        logger.info("Retrieved %s favorites for user %s", len(favorites), user_id)
        return favorites

    except Exception as e:
        logger.error("Error getting favorites: %s", type(e).__name__)
        raise


async def is_favorite(
    db: AsyncSession, user_id: int, product_id: int
) -> tuple[bool, Optional[int]]:
    """
    Check if a product is in user's favorites.
    Returns (is_favorite, favorite_id).
    """
    try:
        result = await db.execute(
            select(UserFavorite).where(
                and_(UserFavorite.user_id == user_id, UserFavorite.product_id == product_id)
            )
        )
        favorite = result.scalar_one_or_none()

        if favorite:
            return (True, favorite.id)
        return (False, None)

    except Exception as e:
        logger.error("Error checking favorite: %s", type(e).__name__)
        raise


async def get_favorite_product_ids(db: AsyncSession, user_id: int) -> List[int]:
    """
    Get list of product IDs that are favorited by user.
    Useful for bulk checking favorites.
    """
    try:
        result = await db.execute(
            select(UserFavorite.product_id).where(UserFavorite.user_id == user_id)
        )
        product_ids = [row[0] for row in result.all()]
        return product_ids

    except Exception as e:
        logger.error("Error getting favorite IDs: %s", type(e).__name__)
        raise
