from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Annotated
from decimal import Decimal


class ProductBase(BaseModel):
    """Base product schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: float = Field(..., gt=0)
    stock: int = Field(0, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    dietary_tags: Optional[List[str]] = []
    
    @field_validator('price', mode='before')
    @classmethod
    def convert_decimal_to_float(cls, v):
        """Convert Decimal from database to float"""
        if isinstance(v, Decimal):
            return float(v)
        return v


class ProductCreate(ProductBase):
    """Schema for creating a product - Replica of createProductSchema"""
    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product - Replica of updateProductSchema (partial)"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    image: Optional[str] = Field(None, max_length=255)
    price: Optional[float] = Field(None, gt=0)
    stock: Optional[int] = Field(None, ge=0)
    category: Optional[str] = Field(None, max_length=100)
    dietary_tags: Optional[List[str]] = None


class ProductResponse(ProductBase):
    """Product response schema"""
    id: int
    
    class Config:
        from_attributes = True
