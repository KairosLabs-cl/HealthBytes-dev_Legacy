import logging
from typing import List, Optional
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.schemas import Review, Product
from app.schemas.review import ReviewCreate

logger = logging.getLogger(__name__)


async def create_review(
    db: AsyncSession, user_id: str, product_id: int, review_in: ReviewCreate
) -> Optional[Review]:
    """Create a new review for a product."""
    # Check if product exists
    product_result = await db.execute(select(Product).where(Product.id == product_id))
    product = product_result.scalar_one_or_none()

    if not product:
        return None

    # Check if user already reviewed this product
    existing_result = await db.execute(
        select(Review).where(Review.user_id == user_id).where(Review.product_id == product_id)
    )
    if existing_result.scalar_one_or_none():
        raise ValueError("User has already reviewed this product")

    # Validar que el usuario compró el producto.
    # TODO: Implementar validación desde order_service cruzando OrderItems y userId

    db_review = Review(
        user_id=user_id, product_id=product_id, rating=review_in.rating, comment=review_in.comment
    )

    db.add(db_review)
    await db.commit()
    await db.refresh(db_review)

    return db_review


async def get_product_reviews(
    db: AsyncSession, product_id: int, skip: int = 0, limit: int = 20
) -> List[Review]:
    """Get all reviews for a specific product."""
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.product_id == product_id)
        .order_by(desc(Review.created_at))
        .offset(skip)
        .limit(limit)
    )

    return result.scalars().all()
