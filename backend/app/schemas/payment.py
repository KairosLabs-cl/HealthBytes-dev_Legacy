"""Payment Pydantic schemas for request/response validation"""

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

from app.db.models.payment import PaymentCurrency, PaymentProvider, PaymentStatus


class PaymentCreate(BaseModel):
    """Schema for creating a payment"""

    order_id: int = Field(..., gt=0, description="Order ID to process payment for")
    amount: Decimal = Field(..., gt=0, description="Payment amount")
    currency: PaymentCurrency = Field(
        default=PaymentCurrency.CLP,
        description="Currency code",
    )
    provider: PaymentProvider = Field(..., description="Payment provider")
    provider_reference: Optional[str] = Field(
        None,
        max_length=255,
        description="Optional reference from provider",
    )

    @field_validator("amount")
    @classmethod
    def validate_amount(cls, v: Decimal) -> Decimal:
        """Ensure amount has max 2 decimal places"""
        exponent = v.as_tuple().exponent
        if isinstance(exponent, int) and exponent < -2:
            raise ValueError("Amount cannot have more than 2 decimal places")
        return v


class PaymentUpdate(BaseModel):
    """Schema for updating payment status (webhooks, admin)"""

    status: Optional[PaymentStatus] = None
    provider_payment_id: Optional[str] = Field(None, max_length=255)
    error_message: Optional[str] = Field(None, max_length=500)
    completed_at: Optional[datetime] = None


class PaymentResponse(BaseModel):
    """Schema for payment response"""

    id: int
    order_id: int
    amount: Decimal
    currency: PaymentCurrency
    status: PaymentStatus
    provider: PaymentProvider
    provider_payment_id: Optional[str] = None
    provider_reference: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class PaymentStatusCheckResponse(BaseModel):
    """Schema for checking payment status"""

    payment_id: int
    status: PaymentStatus
    can_retry: bool
    error_message: Optional[str] = None


class PaymentRefundRequest(BaseModel):
    """Schema for requesting a refund"""

    payment_id: int = Field(..., gt=0)
    reason: Optional[str] = Field(None, max_length=500)


class PaymentRefundResponse(BaseModel):
    """Schema for refund response"""

    payment_id: int
    status: PaymentStatus
    refunded_amount: Decimal
    message: str

    model_config = ConfigDict(from_attributes=True)
