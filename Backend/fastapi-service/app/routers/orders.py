from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.db.schemas import Order, OrderItem, Product, User
from app.models.order import OrderCreate, OrderResponse, OrderUpdate, OrderItemResponse
from app.middleware.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=201)
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
                status_code=400,
                detail={"message": "Invalid order data"}
            )
        
        # Get stripePaymentIntentId from order dict if provided
        stripe_payment_intent_id = order_data.order.get("stripePaymentIntentId")
        
        # Create order
        new_order = Order(
            user_id=user_id,
            stripe_payment_intent_id=stripe_payment_intent_id
        )
        
        db.add(new_order)
        await db.flush()  # Get order.id without committing
        
        # TODO: validate products ids, and take their actual price from db
        # For now, using prices from request like Node.js does
        order_items = []
        for item_data in order_data.items:
            order_item = OrderItem(
                order_id=new_order.id,
                product_id=item_data.productId,
                quantity=item_data.quantity,
                price=item_data.price
            )
            db.add(order_item)
            order_items.append(order_item)
        
        await db.commit()
        await db.refresh(new_order)
        
        # Refresh all items to get their IDs
        for item in order_items:
            await db.refresh(item)
        
        # Build response
        items_response = [
            OrderItemResponse(
                id=item.id,
                order_id=item.order_id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price
            )
            for item in order_items
        ]
        
        return OrderResponse(
            id=new_order.id,
            user_id=new_order.user_id,
            created_at=new_order.created_at,
            status=new_order.status,
            stripe_payment_intent_id=new_order.stripe_payment_intent_id,
            items=items_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        await db.rollback()
        raise HTTPException(
            status_code=400,
            detail={"message": "Invalid order data"}
        )


@router.get("/", response_model=List[OrderResponse])
async def list_orders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    GET /orders
    List all orders
    Replica of listOrders from Node.js
    TODO: if req.role is admin, return all orders
    TODO: if req.role is seller, return orders by sellerId
    TODO: else, return only orders filtered by req.userId
    """
    try:
        result = await db.execute(select(Order))
        orders = result.scalars().all()
        
        # Convert to response format
        orders_response = []
        for order in orders:
            orders_response.append(OrderResponse(
                id=order.id,
                user_id=order.user_id,
                created_at=order.created_at,
                status=order.status,
                stripe_payment_intent_id=order.stripe_payment_intent_id,
                items=[]
            ))
        
        return orders_response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{id}", response_model=OrderResponse)
async def get_order(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
                price=item.price
            )
            for item in order_items
        ]
        
        return OrderResponse(
            id=order.id,
            user_id=order.user_id,
            created_at=order.created_at,
            status=order.status,
            stripe_payment_intent_id=order.stripe_payment_intent_id,
            items=items_response
        )
        
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/{id}", response_model=OrderResponse)
async def update_order(
    id: int,
    order_data: OrderUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
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
            items=[]
        )
        
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
