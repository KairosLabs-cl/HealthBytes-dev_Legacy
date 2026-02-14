"""
Address Model
User shipping/billing addresses
"""

from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.database import Base


class Address(Base):
    """User address for shipping/billing"""

    __tablename__ = "addresses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # Clerk user ID

    # Address fields
    label = Column(String(50), nullable=True)  # e.g., "Home", "Work", "Mom's house"
    street = Column(String(255), nullable=False)
    street_number = Column(String(20), nullable=True)  # Number, apt, suite
    city = Column(String(100), nullable=False)
    region = Column(String(100), nullable=False)  # State/Province
    postal_code = Column(String(20), nullable=False)
    country = Column(String(2), default="CL")  # ISO 3166-1 alpha-2 (Chile por defecto)

    # Contact info (opcional, puede usar del user)
    recipient_name = Column(String(100), nullable=True)
    phone = Column(String(20), nullable=True)

    # Status
    is_default = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    # orders = relationship("Order", back_populates="shipping_address")

    def __repr__(self):
        return f"<Address(id={self.id}, user_id={self.user_id}, city={self.city})>"

    @property
    def full_address(self) -> str:
        """Returns formatted full address"""
        parts = [self.street]
        if self.street_number:
            parts.append(self.street_number)
        parts.extend([self.city, self.region, self.postal_code])
        return ", ".join(parts)
