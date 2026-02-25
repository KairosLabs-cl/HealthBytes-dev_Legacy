from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.product import ProductResponse


class CartItemCreate(BaseModel):
    """Schema for adding item to cart"""

    product_id: int = Field(..., gt=0, description="ID of the product to add")
    quantity: int = Field(default=1, ge=1, description="Quantity to add (must be >= 1)")


class CartItemUpdate(BaseModel):
    """Schema for updating cart item quantity"""

    quantity: int = Field(..., ge=1, description="New quantity (must be >= 1)")


class CartItemResponse(BaseModel):
    """Cart item with product details"""

    id: int
    product_id: int
    quantity: int
    created_at: datetime
    product: ProductResponse  # Include full product info

    model_config = ConfigDict(from_attributes=True)


class CartResponse(BaseModel):
    """Complete cart with all items and total"""

    items: List[CartItemResponse]
    total: float = Field(..., description="Total price of all items in cart")


class CartMergeRequest(BaseModel):
    """Schema for merging local cart with server cart (on login)"""

    items: List[CartItemCreate] = Field(..., description="Items from local cart to merge")
