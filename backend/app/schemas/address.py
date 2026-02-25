"""
Address Schemas
Pydantic models for Address validation
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AddressBase(BaseModel):
    """Base address schema"""

    label: Optional[str] = Field(None, max_length=50, description="Label like 'Home', 'Work'")
    street: str = Field(..., min_length=3, max_length=255)
    street_number: Optional[str] = Field(None, max_length=20)
    city: str = Field(..., min_length=2, max_length=100)
    region: str = Field(..., min_length=2, max_length=100)
    postal_code: str = Field(..., min_length=3, max_length=20)
    country: str = Field(default="CL", max_length=2, description="ISO 3166-1 alpha-2")
    recipient_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_default: bool = Field(default=False)

    @field_validator("country")
    @classmethod
    def validate_country_code(cls, v: str) -> str:
        """Validate country is ISO 3166-1 alpha-2"""
        if len(v) != 2:
            raise ValueError("Country must be 2-letter ISO code (e.g., CL, AR, PE)")
        return v.upper()

    @field_validator("postal_code")
    @classmethod
    def validate_postal_code(cls, v: str) -> str:
        """Remove spaces and validate format"""
        return v.replace(" ", "").upper()


class AddressCreate(AddressBase):
    """Schema for creating new address"""

    pass


class AddressUpdate(BaseModel):
    """Schema for updating address (all fields optional)"""

    label: Optional[str] = Field(None, max_length=50)
    street: Optional[str] = Field(None, min_length=3, max_length=255)
    street_number: Optional[str] = Field(None, max_length=20)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    region: Optional[str] = Field(None, min_length=2, max_length=100)
    postal_code: Optional[str] = Field(None, min_length=3, max_length=20)
    country: Optional[str] = Field(None, max_length=2)
    recipient_name: Optional[str] = Field(None, max_length=100)
    phone: Optional[str] = Field(None, max_length=20)
    is_default: Optional[bool] = None
    is_active: Optional[bool] = None


class AddressResponse(AddressBase):
    """Schema for address response"""

    id: int
    user_id: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class AddressListResponse(BaseModel):
    """Schema for list of addresses"""

    addresses: list[AddressResponse]
    total: int
    default_address_id: Optional[int] = None
