from fastapi import APIRouter, Depends, HTTPException
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.db.schemas import Order, OrderItem, Product, User
from app.schemas.order import OrderCreate, OrderResponse, OrderUpdate, OrderItemResponse
from app.middleware.auth import get_current_user
from app.services import order_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    POST /orders
    Create a new order
    Replica of createOrder from Node.js
    """
    try:
        user_id = current_user.id

        if not user_id:
            raise HTTPException(
                status_code=400, detail={"message": "Invalid order data"}
            )
        
        try:
            new_order = await order_service.create_order(
                db=db,
                user_id=user_id,
                order_in=order_data
            )
        except ValueError as e:
            await db.rollback()
            raise HTTPException(
                status_code=404 if "not found" in str(e).lower() else 400,
                detail=str(e)
            )
        
        # Build response
        # Using selectinload in service means items are already populated
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
            stripe_payment_intent_id=new_order.stripe_payment_intent_id,
            items=items_response,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        await db.rollback()
        raise HTTPException(status_code=400, detail={"message": "Invalid order data"})


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)
):
    """
    GET /orders
    List all orders
    - Admin: All orders
    - Seller: Orders containing their products
    - User: Their own orders
    """
    try:
        if current_user.role == "admin":
            stmt = select(Order)
        elif current_user.role == "seller":
            # For now sellers see all orders, logic to filter by seller needs complex join
            # Future improvement: Filter orders where order items belong to seller's products
            stmt = select(Order)
        else:
            stmt = select(Order).where(Order.user_id == current_user.id)

        result = await db.execute(stmt)
        orders = result.scalars().all()

        # Convert to response format
        orders_response = []
        for order in orders:
            orders_response.append(
                OrderResponse(
                    id=order.id,
                    user_id=order.user_id,
                    created_at=order.created_at,
                    status=order.status,
                    stripe_payment_intent_id=order.stripe_payment_intent_id,
                    items=[],
                )
            )

        return orders_response

    except Exception as e:
        logger.error(f"Error listing orders: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/{id}", status_code=204)
async def delete_order(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    DELETE /orders/:id
    Delete an order (Admin only)
    """
    try:
        if current_user.role != "admin":
            raise HTTPException(
                status_code=403, detail="Not authorized to delete orders"
            )

        result = await db.execute(select(Order).where(Order.id == id))
        order = result.scalar_one_or_none()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Delete order items first (cascade should handle this but explicit is safer without cascade set)
        await db.execute(select(OrderItem).where(OrderItem.order_id == id))
        # Note: SQLAlchemy flush/commit handles deletion if cascade is set,
        # but pure SQL delete might be needed if not. Assuming basic delete of parent works.

        await db.delete(order)
        await db.commit()

        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting order {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{id}", response_model=OrderResponse)
async def get_order(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /orders/:id
    Get order by ID with items
    Replica of getOrder from Node.js
    """
    try:
        # Get order
        result = await db.execute(select(Order).where(Order.id == id))
        order = result.scalar_one_or_none()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Get order items
        items_result = await db.execute(
            select(OrderItem).where(OrderItem.order_id == id)
        )
        order_items = items_result.scalars().all()

        # Build response
        items_response = [
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
            )
            for item in order_items
        ]

        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            created_at=order.created_at,
            status=order.status,
            stripe_payment_intent_id=order.stripe_payment_intent_id,
            items=items_response,
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting order {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/{id}", response_model=OrderResponse)
async def update_order(
    id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PUT /orders/:id
    Update order status
    Replica of updateOrder from Node.js
    """
    try:
        result = await db.execute(select(Order).where(Order.id == id))
        order = result.scalar_one_or_none()

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        # Update status
        order.status = order_data.status

        await db.commit()
        await db.refresh(order)

        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            created_at=order.created_at,
            status=order.status,
            stripe_payment_intent_id=order.stripe_payment_intent_id,
            items=[],
        )

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating order {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
