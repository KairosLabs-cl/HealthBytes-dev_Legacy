from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class ReviewCreate(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Calificación de 1 a 5 estrellas")
    comment: Optional[str] = Field(None, max_length=500, description="Comentario opcional")


class ReviewResponse(BaseModel):
    id: int
    user_id: int
    product_id: Optional[int] = None
    vendor_id: Optional[int] = None
    rating: int
    comment: Optional[str]
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
