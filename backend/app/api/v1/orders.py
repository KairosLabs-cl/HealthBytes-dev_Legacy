"""
Orders API Endpoints
Standard error responses + Proper authorization checks
"""

import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models.address import Address
from app.db.schemas import Order, User
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
            # Validate address ownership if provided
            if order_data.address_id:
                addr_result = await db.execute(
                    select(Address).where(
                        Address.id == order_data.address_id,
                        Address.user_id == current_user.id,
                        Address.is_active.is_(True),
                    )
                )
                if not addr_result.scalar_one_or_none():
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
            error_status = (
                status.HTTP_404_NOT_FOUND if is_not_found else status.HTTP_422_UNPROCESSABLE_ENTITY
            )
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
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /api/v1/orders
    List orders with role-based filtering
    - Admin: All orders
    - User: Their own orders
    - Seller: Orders with their products (TODO)
    """
    try:
        if current_user.role == "admin":
            stmt = select(Order)
        elif current_user.role == "seller":
            # TODO: Filter by seller's products once seller_id is added to Product schema
            # For now, sellers only see their own orders (same as regular users)
            stmt = select(Order).where(Order.user_id == current_user.id)
        else:
            stmt = select(Order).where(Order.user_id == current_user.id)

        # Eager load items
        stmt = (
            stmt.options(selectinload(Order.items))
            .order_by(Order.created_at.desc(), Order.id.desc())
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        orders = result.scalars().all()

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
        stmt = select(Order).where(Order.id == id)

        # Authorization: non-admin users can only see their own orders
        if current_user.role != "admin":
            stmt = stmt.where(Order.user_id == current_user.id)

        stmt = stmt.options(selectinload(Order.items))
        result = await db.execute(stmt)
        order = result.scalar_one_or_none()

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
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=error.model_dump()
            )

        if not order:
            error = ErrorResponse.not_found(
                message="Order not found",
                path=f"/api/v1/orders/{id}",
            )
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error.model_dump())

        # Send shipped email if status changed to shipped
        if order_data.status == "shipped":
            try:
                from app.config import settings
                from app.services.email_service import EmailService, build_order_email_data

                email_svc = EmailService(settings)
                email_data = await build_order_email_data(db, order.id)
                if email_data:
                    await email_svc.send_order_shipped(email_data)
            except Exception:
                logger.exception("Failed to send shipped email for order %s", order.id)

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

        result = await db.execute(select(Order).where(Order.id == id))
        order = result.scalar_one_or_none()

        if not order:
            error = ErrorResponse.not_found(
                message="Order not found",
                path=f"/api/v1/orders/{id}",
            )
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=error.model_dump())

        await db.delete(order)
        await db.commit()
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
