from typing import List, Optional

from pydantic import BaseModel, Field


class DietaryTagResponse(BaseModel):
    """Dietary tag response schema"""

    id: int
    name: str
    display_name: str
    color: Optional[str] = None

    class Config:
        from_attributes = True


class ProductBase(BaseModel):
    """Base product schema"""

    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: float = Field(..., gt=0)
    stock: int = Field(0, ge=0)


class ProductCreate(ProductBase):
    """Schema for creating a product - Replica of createProductSchema"""

    dietary_tag_ids: Optional[List[int]] = Field(default_factory=list)


class ProductUpdate(BaseModel):
    """Schema for updating a product - Replica of updateProductSchema (partial)"""

    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    dietary_tag_ids: Optional[List[int]] = None


class ProductResponse(ProductBase):
    """Product response schema"""

    id: int
    dietary_tags: List[DietaryTagResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
