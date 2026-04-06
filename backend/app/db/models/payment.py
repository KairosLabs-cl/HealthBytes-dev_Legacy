"""Payment model for payment processing across multiple providers"""

import enum
from datetime import UTC, datetime

from sqlalchemy import (
    TIMESTAMP,
    Column,
    Enum,
    ForeignKey,
    Integer,
    Numeric,
    String,
)
from sqlalchemy.orm import relationship

from app.db.database import Base


class PaymentProvider(str, enum.Enum):
    """Payment provider options"""

    MERCADO_PAGO = "mercado_pago"


class PaymentStatus(str, enum.Enum):
    """Payment status lifecycle"""

    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"
    CANCELLED = "cancelled"


class PaymentCurrency(str, enum.Enum):
    """Supported currencies"""

    CLP = "CLP"  # Chilean Peso
    USD = "USD"  # US Dollar


class Payment(Base):
    """
    Payment records for orders across multiple payment providers.

    Supports:
    - Mercado Pago (Chile)
    """

    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)

    # Order relationship
    order_id = Column(
        Integer,
        ForeignKey("orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Payment details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(
        Enum(PaymentCurrency),
        nullable=False,
        default=PaymentCurrency.CLP,
    )
    status = Column(
        Enum(PaymentStatus),
        nullable=False,
        default=PaymentStatus.PENDING,
        index=True,
    )
    provider = Column(
        Enum(PaymentProvider),
        nullable=False,
        index=True,
    )

    # Provider-specific references
    provider_payment_id = Column(String(255), nullable=True, index=True)
    provider_reference = Column(String(255), nullable=True)

    # Error tracking
    error_message = Column(String(500), nullable=True)

    # Timestamps
    created_at = Column(TIMESTAMP, nullable=False, default=lambda: datetime.now(UTC))
    updated_at = Column(
        TIMESTAMP,
        nullable=False,
        default=lambda: datetime.now(UTC),
        onupdate=lambda: datetime.now(UTC),
    )
    completed_at = Column(TIMESTAMP, nullable=True)

    # Relationships
    order = relationship("Order", backref="payments")

    def __repr__(self):
        return (
            f"<Payment(id={self.id}, order_id={self.order_id}, "
            f"provider={self.provider}, status={self.status})>"
        )
