from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class OrderItemCreate(BaseModel):
    """Schema for order item creation - Replica of insertOrderItemSchema"""

    productId: int
    quantity: int = Field(..., ge=1)
    price: float = Field(..., gt=0)


class OrderCreate(BaseModel):
    """Schema for order creation - Replica of insertOrderWithItemsSchema"""

    order: dict = {}
    items: List[OrderItemCreate]


class OrderItemResponse(BaseModel):
    """Order item response"""

    id: int
    order_id: int
    product_id: int
    quantity: int
    price: float

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    """Order response schema"""

    id: int
    user_id: int
    created_at: datetime
    status: str
    items: Optional[List[OrderItemResponse]] = []

    model_config = ConfigDict(from_attributes=True)


class OrderUpdate(BaseModel):
    """Schema for updating order - Replica of updateOrderSchema"""

    status: str = Field(..., max_length=50)
