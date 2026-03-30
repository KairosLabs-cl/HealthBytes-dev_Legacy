from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.schemas.review import ReviewCreate, ReviewResponse
from app.services import vendor_service, review_service

router = APIRouter()


@router.get("/{vendor_id}/rating")
async def get_vendor_rating(vendor_id: int, db: AsyncSession = Depends(get_db)):
    """Get vendor rating statistics."""
    vendor = await vendor_service.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return await vendor_service.get_vendor_rating(db, vendor_id)


@router.get("/{vendor_id}/reviews")
async def get_vendor_reviews(
    vendor_id: int,
    skip: int = 0,
    limit: int = 20,
    db: AsyncSession = Depends(get_db)
):
    """Get all reviews for a vendor."""
    vendor = await vendor_service.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    reviews = await vendor_service.get_vendor_reviews(db, vendor_id, skip, limit)
    return [
        {
            "id": r.id,
            "user_id": r.user_id,
            "vendor_id": r.vendor_id,
            "rating": r.rating,
            "comment": r.comment,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "user_name": r.user.name if r.user else "Usuario"
        }
        for r in reviews
    ]


@router.post("/{vendor_id}/reviews", response_model=ReviewResponse)
async def create_vendor_review(
    vendor_id: int,
    review_in: ReviewCreate,
    db: AsyncSession = Depends(get_db),
    user_id: int = 1  # TODO: get from auth
):
    """Create a review for a vendor."""
    vendor = await vendor_service.get_vendor_by_id(db, vendor_id)
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    try:
        review = await review_service.create_vendor_review(db, user_id, vendor_id, review_in)
        return {
            "id": review.id,
            "user_id": review.user_id,
            "product_id": review.product_id,
            "vendor_id": review.vendor_id,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
