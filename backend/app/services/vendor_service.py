import logging
from typing import List, Optional
from sqlalchemy import desc, select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.schemas import Vendor, Review

logger = logging.getLogger(__name__)


async def get_or_create_vendor(db: AsyncSession, name: str) -> Vendor:
    """Get vendor by name or create if doesn't exist."""
    result = await db.execute(select(Vendor).where(Vendor.name == name))
    vendor = result.scalar_one_or_none()
    if not vendor:
        vendor = Vendor(name=name)
        db.add(vendor)
        await db.commit()
        await db.refresh(vendor)
    return vendor


async def get_vendor_by_id(db: AsyncSession, vendor_id: int) -> Optional[Vendor]:
    """Get vendor by ID."""
    result = await db.execute(select(Vendor).where(Vendor.id == vendor_id))
    return result.scalar_one_or_none()


async def get_vendor_by_name(db: AsyncSession, name: str) -> Optional[Vendor]:
    """Get vendor by name."""
    result = await db.execute(select(Vendor).where(Vendor.name == name))
    return result.scalar_one_or_none()


async def get_vendor_rating(db: AsyncSession, vendor_id: int) -> dict:
    """Get average rating and review count for a vendor."""
    result = await db.execute(
        select(func.avg(Review.rating), func.count(Review.id))
        .where(Review.vendor_id == vendor_id)
    )
    row = result.one()
    return {
        "avg_rating": round(float(row[0]), 1) if row[0] else 0,
        "review_count": row[1] or 0
    }


async def get_vendor_reviews(
    db: AsyncSession, vendor_id: int, skip: int = 0, limit: int = 20
) -> List[Review]:
    """Get all reviews for a specific vendor."""
    result = await db.execute(
        select(Review)
        .options(selectinload(Review.user))
        .where(Review.vendor_id == vendor_id)
        .order_by(desc(Review.created_at))
        .offset(skip)
        .limit(limit)
    )
    return list(result.scalars().all())
