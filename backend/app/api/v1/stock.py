"""
Stock Management Endpoints
API routes for checking and managing product stock
"""

from typing import List

from fastapi import APIRouter, Body, Depends
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.middleware.auth import verify_admin
from app.services.stock_service import StockService, StockStatus

router = APIRouter(prefix="/products", tags=["stock"])


class StockCheckRequest(BaseModel):
    """Request to check stock availability"""

    product_id: int
    quantity: int = Field(..., gt=0, description="Quantity to check")


class StockCheckResponse(BaseModel):
    """Stock availability response"""

    product_id: int
    product_name: str
    current_stock: int
    requested_quantity: int
    is_available: bool
    stock_status: StockStatus
    low_stock_threshold: int


class StockInfoResponse(BaseModel):
    """Detailed stock information"""

    product_id: int
    product_name: str
    stock: int
    stock_status: StockStatus
    is_available: bool
    is_low_stock: bool
    threshold: int


class StockUpdateRequest(BaseModel):
    """Request to update stock (admin only)"""

    new_stock: int = Field(..., ge=0, description="New stock value")


class BulkStockCheckRequest(BaseModel):
    """Request to check multiple products"""

    items: List[tuple[int, int]] = Field(
        ...,
        description="List of (product_id, quantity) tuples",
        json_schema_extra={"example": [[1, 2], [3, 1]]},
    )


@router.get(
    "/{product_id}/stock", response_model=StockInfoResponse, summary="Get product stock info"
)
async def get_product_stock(product_id: int, db: AsyncSession = Depends(get_db)):
    """
    Get detailed stock information for a product

    Returns:
    - Current stock level
    - Stock status (in_stock, low_stock, out_of_stock)
    - Availability flag
    - Low stock threshold

    Public endpoint - no auth required for read-only stock check
    """
    stock_info = await StockService.get_stock_info(db, product_id)
    return stock_info


@router.post(
    "/check-availability", response_model=StockCheckResponse, summary="Check if stock is available"
)
async def check_stock_availability(request: StockCheckRequest, db: AsyncSession = Depends(get_db)):
    """
    Check if a specific quantity of product is available

    Use this before adding to cart to show real-time availability
    """
    availability = await StockService.check_availability(db, request.product_id, request.quantity)
    return availability


@router.post("/bulk-check-availability", summary="Check availability for multiple products")
async def bulk_check_availability(
    items: List[List[int]], db: AsyncSession = Depends(get_db)  # [[product_id, quantity], ...]
):
    """
    Check availability for multiple products at once

    Useful for cart validation before checkout

    Request body:
    ```json
    {
        "items": [[1, 2], [3, 1], [5, 3]]
    }
    ```

    Returns dict mapping product_id to availability info
    """
    # Convert list of lists to list of tuples
    items_tuples = [(item[0], item[1]) for item in items]

    availability_map = await StockService.bulk_check_availability(db, items_tuples)

    return {
        "results": availability_map,
        "all_available": all(info["is_available"] for info in availability_map.values()),
    }


@router.put(
    "/{product_id}/stock",
    response_model=StockInfoResponse,
    summary="Update product stock (Admin only)",
)
async def update_product_stock(
    product_id: int,
    request: StockUpdateRequest,
    current_user=Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Manually update product stock

    **Admin only** - Requires authentication

    Use cases:
    - Manual inventory adjustment
    - Receiving new stock
    - Correcting discrepancies
    """
    await StockService.update_stock(db, product_id, request.new_stock, str(current_user.id))

    # Return updated stock info
    return await StockService.get_stock_info(db, product_id)


@router.post(
    "/{product_id}/release-stock",
    response_model=StockInfoResponse,
    summary="Release reserved stock (Admin only)",
)
async def release_reserved_stock(
    product_id: int,
    quantity: int = Body(..., gt=0),
    reason: str = Body(default="Manual release", max_length=200),
    current_user=Depends(verify_admin),
    db: AsyncSession = Depends(get_db),
):
    """
    Release stock back to inventory

    **Admin only** - Requires authentication

    Use cases:
    - Order cancellation
    - Payment failure
    - Manual adjustment
    """
    await StockService.release_stock(db, product_id, quantity, reason)

    return await StockService.get_stock_info(db, product_id)
