from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class OrderItemCreate(BaseModel):
    """Schema for order item creation - Replica of insertOrderItemSchema"""

    model_config = ConfigDict(populate_by_name=True)

    product_id: int = Field(..., gt=0, alias="productId", description="Product ID must be positive")
    quantity: int = Field(..., ge=1, le=1000, description="Quantity must be 1-1000")
    price: int = Field(..., gt=0, description="Price in CLP (integer, no decimals)")

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
    def validate_price(cls, v: int) -> int:
        """Ensure price is reasonable"""
        if v <= 0:
            raise ValueError("Price must be positive")
        if v > 999999999:
            raise ValueError("Price is unreasonably high")
        return v


VALID_PAYMENT_METHODS = {"mercado_pago", "venti"}


class OrderCreate(BaseModel):
    """Schema for order creation - Replica of insertOrderWithItemsSchema"""

    model_config = ConfigDict(populate_by_name=True)

    order: dict = Field(default_factory=dict, description="Empty dict as in Node.js")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="At least 1 item required")
    address_id: Optional[int] = Field(
        None, gt=0, alias="addressId", description="Shipping address ID"
    )
    payment_method: Optional[str] = Field(None, alias="paymentMethod", description="Payment method")

    @field_validator("payment_method")
    @classmethod
    def validate_payment_method(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and v not in VALID_PAYMENT_METHODS:
            raise ValueError(f"Invalid payment method. Must be one of: {VALID_PAYMENT_METHODS}")
        return v

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
    price: int

    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    """Order response schema"""

    id: int
    user_id: int
    created_at: datetime
    status: str
    address_id: Optional[int] = None
    payment_method: Optional[str] = None
    items: Optional[List[OrderItemResponse]] = []

    model_config = ConfigDict(from_attributes=True)


class OrderUpdate(BaseModel):
    """Schema for updating order - Replica of updateOrderSchema"""

    status: str = Field(..., max_length=50)
