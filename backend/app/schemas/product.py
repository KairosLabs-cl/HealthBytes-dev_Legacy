from pydantic import BaseModel, Field
from typing import Optional


class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: float = Field(..., gt=0)


class ProductCreate(ProductBase):
    """Schema for creating a product - Replica of createProductSchema"""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product - Replica of updateProductSchema (partial)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: Optional[float] = Field(None, gt=0)


class ProductResponse(ProductBase):
    """Product response schema"""
    id: int
    
    class Config:
        from_attributes = True
