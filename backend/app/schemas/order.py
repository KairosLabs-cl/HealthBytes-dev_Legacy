from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OrderItemCreate(BaseModel):
    """Schema for order item creation - Replica of insertOrderItemSchema"""

    model_config = ConfigDict(populate_by_name=True)

    product_id: int = Field(..., gt=0, alias="productId", description="Product ID must be positive")
    quantity: int = Field(..., ge=1, le=1000, description="Quantity must be 1-1000")
    price: float = Field(..., gt=0, description="Price must be positive")

    @field_validator("quantity")
    @classmethod
    def validate_quantity(cls, v: int) -> int:
        """Ensure quantity is reasonable"""
        if v < 1:
            raise ValueError("Quantity must be at least 1")
        if v > 1000:
            raise ValueError("Quantity cannot exceed 1000 per item")
        return v

    @field_validator("price")
    @classmethod
    def validate_price(cls, v: float) -> float:
        """Ensure price is reasonable"""
        if v <= 0:
            raise ValueError("Price must be positive")
        if v > 999999.99:
            raise ValueError("Price is unreasonably high (max: 999999.99)")
        return v


class OrderCreate(BaseModel):
    """Schema for order creation - Replica of insertOrderWithItemsSchema"""

    order: dict = Field(default_factory=dict, description="Empty dict as in Node.js")
    items: List[OrderItemCreate] = Field(..., min_items=1, description="At least 1 item required")

    @field_validator("items")
    @classmethod
    def validate_items(cls, v: List[OrderItemCreate]) -> List[OrderItemCreate]:
        """Validate items array"""
        if not v:
            raise ValueError("Order must contain at least 1 item")

        # Check for duplicate product IDs
        product_ids = [item.product_id for item in v]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Duplicate products in order items")

        return v


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
