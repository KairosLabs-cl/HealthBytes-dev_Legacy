import logging
from typing import List, Optional

from sqlalchemy import desc, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.schemas import OrderItem, Product, Review
from app.schemas.review import ReviewCreate

logger = logging.getLogger(__name__)


async def create_review(
    db: AsyncSession, user_id: int, product_id: int, review_in: ReviewCreate
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

    # Validate that user has purchased the product (paid/processing/shipped/delivered)
    from app.db.schemas import Order
    valid_statuses = ["processing", "shipped", "delivered"]
    order_check = await db.execute(
        select(OrderItem)
        .join(Order, onclause=OrderItem.order_id == Order.id)
        .where(OrderItem.product_id == product_id)
        .where(Order.user_id == user_id)
        .where(Order.status.in_(valid_statuses))
    )
    if not order_check.scalar_one_or_none():
        raise ValueError("You must purchase this product before reviewing it")

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

    return list(result.scalars().all())
