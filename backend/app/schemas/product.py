from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field, computed_field, field_serializer


class DietaryTagResponse(BaseModel):
    """Dietary tag response schema"""

    id: int
    name: str
    display_name: str
    color: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    """Base product schema"""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: Decimal = Field(..., gt=0)
    stock: int = Field(0, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    vendor_name: Optional[str] = Field(None, max_length=255)

    @field_serializer("price")
    def serialize_price(self, v: Decimal) -> float:
        """Serialize Decimal as JSON number for frontend compatibility."""
        return float(v)


class ProductCreate(ProductBase):
    """Schema for creating a product - Replica of createProductSchema"""

    discount_percentage: Optional[int] = Field(None, ge=0, le=100)
    dietary_tag_ids: Optional[List[int]] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    """Schema for updating a product - Replica of updateProductSchema (partial)"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: Optional[Decimal] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    # If this fails, use without _ids (old master used bare field name)
    dietary_tag_ids: Optional[List[int]] = None
    category: Optional[str] = Field(None, max_length=100)
    discount_percentage: Optional[int] = Field(None, ge=0, le=100)


class ProductResponse(ProductBase):
    """Product response schema with computed stock status"""

    id: int
    dietary_tags: List[DietaryTagResponse] = Field(default_factory=list)
    nutritional_info: Optional[str] = None
    discount_percentage: Optional[int] = None

    @computed_field
    @property
    def stock_status(self) -> str:
        """Computed field: stock status based on current stock level"""
        if self.stock == 0:
            return "out_of_stock"
        elif self.stock < 5:  # Low stock threshold
            return "low_stock"
        else:
            return "in_stock"

    @computed_field
    @property
    def is_available(self) -> bool:
        """Computed field: whether product can be purchased"""
        return self.stock > 0

    @computed_field
    @property
    def original_price(self) -> Optional[float]:
        """When discounted, original_price = price / (1 - discount/100)"""
        if self.discount_percentage and self.discount_percentage > 0:
            return round(float(self.price) / (1 - self.discount_percentage / 100), 2)
        return None

    model_config = ConfigDict(from_attributes=True)
