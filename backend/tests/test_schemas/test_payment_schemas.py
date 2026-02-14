"""
Tests for payment Pydantic schemas.
Covers validation, serialization, and edge cases.
"""

from datetime import datetime
from decimal import Decimal

import pytest
from pydantic import ValidationError

from app.db.models.payment import PaymentCurrency, PaymentProvider, PaymentStatus
from app.schemas.payment import (
    PaymentCreate,
    PaymentRefundRequest,
    PaymentRefundResponse,
    PaymentResponse,
    PaymentStatusCheckResponse,
    PaymentUpdate,
)


class TestPaymentCreate:
    """Tests for PaymentCreate schema."""

    def test_valid_payment_create(self):
        """Test creating a valid payment."""
        payment = PaymentCreate(
            order_id=1,
            amount=Decimal("25000.00"),
            currency=PaymentCurrency.CLP,
            provider=PaymentProvider.MERCADO_PAGO,
        )
        assert payment.order_id == 1
        assert payment.amount == Decimal("25000.00")
        assert payment.currency == PaymentCurrency.CLP

    def test_payment_create_default_currency(self):
        """Test default currency is CLP."""
        payment = PaymentCreate(
            order_id=1,
            amount=Decimal("100.00"),
            provider=PaymentProvider.MERCADO_PAGO,
        )
        assert payment.currency == PaymentCurrency.CLP

    def test_payment_create_invalid_order_id(self):
        """Test order_id must be positive."""
        with pytest.raises(ValidationError):
            PaymentCreate(
                order_id=0,
                amount=Decimal("100.00"),
                provider=PaymentProvider.MERCADO_PAGO,
            )

    def test_payment_create_invalid_amount_zero(self):
        """Test amount must be positive."""
        with pytest.raises(ValidationError):
            PaymentCreate(
                order_id=1,
                amount=Decimal("0"),
                provider=PaymentProvider.MERCADO_PAGO,
            )

    def test_payment_create_invalid_amount_negative(self):
        """Test negative amount is rejected."""
        with pytest.raises(ValidationError):
            PaymentCreate(
                order_id=1,
                amount=Decimal("-10.00"),
                provider=PaymentProvider.MERCADO_PAGO,
            )

    def test_payment_create_too_many_decimals(self):
        """Test amount with more than 2 decimal places is rejected."""
        with pytest.raises(ValidationError, match="2 decimal places"):
            PaymentCreate(
                order_id=1,
                amount=Decimal("10.999"),
                provider=PaymentProvider.MERCADO_PAGO,
            )

    def test_payment_create_with_provider_reference(self):
        """Test payment with optional provider reference."""
        payment = PaymentCreate(
            order_id=1,
            amount=Decimal("50.00"),
            provider=PaymentProvider.MERCADO_PAGO,
            provider_reference="ref_123",
        )
        assert payment.provider_reference == "ref_123"


class TestPaymentUpdate:
    """Tests for PaymentUpdate schema."""

    def test_update_status(self):
        """Test updating payment status."""
        update = PaymentUpdate(status=PaymentStatus.COMPLETED)
        assert update.status == PaymentStatus.COMPLETED

    def test_update_with_error_message(self):
        """Test updating with error message."""
        update = PaymentUpdate(
            status=PaymentStatus.FAILED,
            error_message="Card declined",
        )
        assert update.error_message == "Card declined"

    def test_update_all_fields_optional(self):
        """Test all fields are optional."""
        update = PaymentUpdate()
        assert update.status is None
        assert update.provider_payment_id is None
        assert update.error_message is None
        assert update.completed_at is None


class TestPaymentResponse:
    """Tests for PaymentResponse schema."""

    def test_payment_response(self):
        """Test payment response serialization."""
        now = datetime.now()
        response = PaymentResponse(
            id=1,
            order_id=1,
            amount=Decimal("25000.00"),
            currency=PaymentCurrency.CLP,
            status=PaymentStatus.COMPLETED,
            provider=PaymentProvider.MERCADO_PAGO,
            provider_payment_id="mp_123",
            created_at=now,
            updated_at=now,
            completed_at=now,
        )
        assert response.id == 1
        assert response.status == PaymentStatus.COMPLETED
        assert response.provider_payment_id == "mp_123"


class TestPaymentStatusCheckResponse:
    """Tests for PaymentStatusCheckResponse."""

    def test_status_check_can_retry(self):
        """Test status check with retry flag."""
        check = PaymentStatusCheckResponse(
            payment_id=1,
            status=PaymentStatus.FAILED,
            can_retry=True,
            error_message="Timeout",
        )
        assert check.can_retry is True
        assert check.error_message == "Timeout"

    def test_status_check_completed(self):
        """Test status check for completed payment."""
        check = PaymentStatusCheckResponse(
            payment_id=1,
            status=PaymentStatus.COMPLETED,
            can_retry=False,
        )
        assert check.can_retry is False
        assert check.error_message is None


class TestPaymentRefundRequest:
    """Tests for PaymentRefundRequest."""

    def test_refund_request_valid(self):
        """Test valid refund request."""
        req = PaymentRefundRequest(payment_id=1, reason="Customer requested")
        assert req.payment_id == 1
        assert req.reason == "Customer requested"

    def test_refund_request_invalid_payment_id(self):
        """Test refund with invalid payment_id."""
        with pytest.raises(ValidationError):
            PaymentRefundRequest(payment_id=0)

    def test_refund_request_no_reason(self):
        """Test refund without reason is valid."""
        req = PaymentRefundRequest(payment_id=1)
        assert req.reason is None


class TestPaymentRefundResponse:
    """Tests for PaymentRefundResponse."""

    def test_refund_response(self):
        """Test refund response serialization."""
        resp = PaymentRefundResponse(
            payment_id=1,
            status=PaymentStatus.REFUNDED,
            refunded_amount=Decimal("25000.00"),
            message="Refund processed",
        )
        assert resp.status == PaymentStatus.REFUNDED
        assert resp.refunded_amount == Decimal("25000.00")
