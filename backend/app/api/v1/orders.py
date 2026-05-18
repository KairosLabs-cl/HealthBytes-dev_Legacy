"""
Orders API Endpoints
Standard error responses + Proper authorization checks
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.schemas import User
from app.middleware.auth import get_current_user
from app.schemas.error import ErrorDetail, ErrorResponse
from app.schemas.order import OrderCreate, OrderItemResponse, OrderResponse, OrderUpdate
from app.services import order_service

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /api/v1/orders
    Create a new order with validation
    """
    try:
        user_id = current_user.id

        if not user_id:
            error = ErrorResponse.validation_error(
                message="Cannot create order without authenticated user",
                path="/api/v1/orders",
                details=[
                    ErrorDetail(
                        code="NO_USER",
                        message="User ID is missing from authentication",
                        suggestion="Ensure you are logged in",
                    )
                ],
            )
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error.model_dump())

        try:
            if order_data.address_id:
                owns_address = await order_service.user_owns_active_address(
                    db, current_user.id, order_data.address_id
                )
                if not owns_address:
                    error = ErrorResponse.not_found(
                        message="Address not found",
                        path="/api/v1/orders",
                    )
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND, detail=error.model_dump()
                    )

            new_order = await order_service.create_order(
                db=db, user_id=user_id, order_in=order_data
            )
        except ValueError as e:
            await db.rollback()
            is_not_found = "not found" in str(e).lower()
            error = ErrorResponse.validation_error(
                message="Order creation failed",
                path="/api/v1/orders",
                details=[
                    ErrorDetail(
                        code="PRODUCT_NOT_FOUND" if is_not_found else "INVALID_VALUE",
                        message=str(e),
                        suggestion="Verify all product IDs are valid" if is_not_found else None,
                    )
                ],
            )
            error_status = status.HTTP_404_NOT_FOUND if is_not_found else 422
            raise HTTPException(status_code=error_status, detail=error.model_dump())

        # Build response
        items_response = [
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
            )
            for item in new_order.items
        ]

        return OrderResponse(
            id=new_order.id,
            user_id=new_order.user_id,
            created_at=new_order.created_at,
            status=new_order.status,
            address_id=new_order.address_id,
            payment_method=new_order.payment_method,
            items=items_response,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error creating order: %s: %s", type(e).__name__, str(e))
        await db.rollback()
        error = ErrorResponse.server_error(
            message="An unexpected error occurred while creating the order",
            path="/api/v1/orders",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error.model_dump()
        )


@router.get("", response_model=List[OrderResponse])
async def list_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=50, description="Max 50 items per request"),
    status_filter: str = Query(None, alias="status", description="Filter orders by status"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/v1/orders
    List orders with role-based filtering
    - Admin: All orders
    - User: Their own orders
    - Seller: Orders with their products (TODO)
    - status: Optional filter by order status
    """
    try:
        orders = await order_service.list_orders_for_request(
            db=db,
            current_user=current_user,
            skip=skip,
            limit=limit,
            status_filter=status_filter,
        )

        # Convert to response
        orders_response = []
        for order in orders:
            items_response = [
                OrderItemResponse(
                    id=item.id,
                    order_id=item.order_id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=item.price,
                )
                for item in (order.items or [])
            ]
            orders_response.append(
                OrderResponse(
                    id=order.id,
                    user_id=order.user_id,
                    created_at=order.created_at,
                    status=order.status,
                    address_id=order.address_id,
                    payment_method=order.payment_method,
                    items=items_response,
                )
            )

        return orders_response

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error listing orders: %s", type(e).__name__)
        error = ErrorResponse.server_error(
            message="An error occurred while fetching orders",
            path="/api/v1/orders",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error.model_dump()
        )


@router.get("/{id}", response_model=OrderResponse)
async def get_order(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/v1/orders/{id}
    Get specific order
    - Admin: Any order
    - User: Only their own
    """
    try:
        order = await order_service.get_order_for_request(db, id, current_user)

        if not order:
            error = ErrorResponse.not_found(
                message="Order not found",
                path=f"/api/v1/orders/{id}",
            )
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error.model_dump())

        # Build response
        items_response = [
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
            )
            for item in (order.items or [])
        ]

        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            created_at=order.created_at,
            status=order.status,
            address_id=order.address_id,
            payment_method=order.payment_method,
            items=items_response,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error fetching order %s: %s", id, type(e).__name__)
        error = ErrorResponse.server_error(
            message="An error occurred while fetching the order",
            path=f"/api/v1/orders/{id}",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error.model_dump()
        )


@router.put("/{id}", response_model=OrderResponse)
async def update_order(
    id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PUT /api/v1/orders/{id}
    Update order status (Admin only)
    """
    try:
        # Authorization: only admins can update orders
        if current_user.role != "admin":
            error = ErrorResponse.forbidden(
                message="You do not have permission to update orders",
                path=f"/api/v1/orders/{id}",
            )
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=error.model_dump())

        # Use service to validate status transition and handle stock release on cancel
        try:
            order = await order_service.update_order_status(
                db=db, order_id=id, status=order_data.status
            )
        except ValueError as e:
            error = ErrorResponse.validation_error(
                message=str(e),
                path=f"/api/v1/orders/{id}",
                details=[
                    ErrorDetail(
                        code="INVALID_STATUS",
                        message=str(e),
                    )
                ],
            )
            raise HTTPException(status_code=422, detail=error.model_dump())

        if not order:
            error = ErrorResponse.not_found(
                message="Order not found",
                path=f"/api/v1/orders/{id}",
            )
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error.model_dump())

        await order_service.send_order_status_notifications(db, order, order_data.status)

        # Build response
        items_response = [
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
            )
            for item in (order.items or [])
        ]

        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            created_at=order.created_at,
            status=order.status,
            address_id=order.address_id,
            payment_method=order.payment_method,
            items=items_response,
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Error updating order %s: %s", id, type(e).__name__)
        error = ErrorResponse.server_error(
            message="An error occurred while updating the order",
            path=f"/api/v1/orders/{id}",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error.model_dump()
        )


@router.delete("/{id}", status_code=204)
async def delete_order(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    DELETE /api/v1/orders/{id}
    Delete order (Admin only)
    """
    try:
        # Authorization: only admins can delete orders
        if current_user.role != "admin":
            error = ErrorResponse.forbidden(
                message="You do not have permission to delete orders",
                path=f"/api/v1/orders/{id}",
            )
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=error.model_dump())

        deleted = await order_service.delete_order(db, id)
        if not deleted:
            error = ErrorResponse.not_found(
                message="Order not found",
                path=f"/api/v1/orders/{id}",
            )
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error.model_dump())
        return None

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Error deleting order %s: %s", id, type(e).__name__)
        error = ErrorResponse.server_error(
            message="An error occurred while deleting the order",
            path=f"/api/v1/orders/{id}",
        )
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=error.model_dump()
        )
