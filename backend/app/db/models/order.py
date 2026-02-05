from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field


class OrderItemCreate(BaseModel):
    """Schema for order item creation - Replica of insertOrderItemSchema"""

    productId: int
    quantity: int = Field(..., ge=1)
    price: float = Field(..., gt=0)


class OrderCreate(BaseModel):
    """Schema for order creation - Replica of insertOrderWithItemsSchema"""

    order: dict = {}  # Empty dict as in Node.js (only stripePaymentIntentId optional)
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    """Order item response"""

    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    """Order response schema"""

    id: int
    user_id: int
    created_at: datetime
    status: str
    stripe_payment_intent_id: Optional[str] = None
    items: Optional[List[OrderItemResponse]] = []

    class Config:
        from_attributes = True


class OrderUpdate(BaseModel):
    """Schema for updating order - Replica of updateOrderSchema"""

    status: str = Field(..., max_length=50)
