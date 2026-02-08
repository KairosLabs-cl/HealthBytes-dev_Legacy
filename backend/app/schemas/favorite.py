"""Pydantic schemas for favorites"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.schemas.product import ProductResponse


class FavoriteCreate(BaseModel):
    """Schema for creating a favorite"""
    product_id: int


class FavoriteBase(BaseModel):
    """Base favorite schema"""
    id: int
    user_id: int
    product_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True


class FavoriteResponse(FavoriteBase):
    """Response schema with product details included"""
    product: Optional[ProductResponse] = None


class FavoriteCheckResponse(BaseModel):
    """Response for checking if a product is favorited"""
    is_favorite: bool
    favorite_id: Optional[int] = None
