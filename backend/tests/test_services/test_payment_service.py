"""Tests for payment service - Database operations only

Testing strategy:
- All payment CRUD operations
- Status transitions (PENDING -> COMPLETED, PENDING -> FAILED, etc.)
- Provider payment ID lookups (for webhooks)
- Refund validations
"""

from decimal import Decimal

import pytest

from app.db.models.payment import Payment, PaymentProvider, PaymentStatus
from app.services.payment_service import PaymentService
from tests.conftest import MockAsyncSession


@pytest.fixture
def async_db(db_session):
    """Wrap sync db_session with MockAsyncSession for async service calls."""
    return MockAsyncSession(db_session)


class TestPaymentService:
    """Test suite for PaymentService"""

    @pytest.mark.asyncio
    async def test_create_payment(self, async_db, test_order):
        """Test creating a new payment record"""
        payment = await PaymentService.create_payment(
            db=async_db,
            order_id=test_order.id,
            amount=Decimal("50000.00"),
            provider=PaymentProvider.MERCADO_PAGO,
            currency="CLP",
            provider_reference="TEST-REF-123",
        )

        assert payment.id is not None
        assert payment.order_id == test_order.id
        assert payment.amount == Decimal("50000.00")
        assert payment.currency == "CLP"
        assert payment.provider == PaymentProvider.MERCADO_PAGO
        assert payment.status == PaymentStatus.PENDING
        assert payment.provider_reference == "TEST-REF-123"

    @pytest.mark.asyncio
    async def test_get_payment_by_id(self, async_db, test_payment):
        """Test retrieving payment by ID"""
        payment = await PaymentService.get_payment_by_id(
            db=async_db,
            payment_id=test_payment.id,
        )

        assert payment is not None
        assert payment.id == test_payment.id
        assert payment.order_id == test_payment.order_id

    @pytest.mark.asyncio
    async def test_get_payments_by_order(self, async_db, test_order):
        """Test getting all payments for an order"""
        # Create multiple payments for same order (retry scenario)
        await PaymentService.create_payment(
            db=async_db,
            order_id=test_order.id,
            amount=Decimal("10000.00"),
            provider=PaymentProvider.MERCADO_PAGO,
        )
        await PaymentService.create_payment(
            db=async_db,
            order_id=test_order.id,
            amount=Decimal("10000.00"),
            provider=PaymentProvider.MERCADO_PAGO,
        )

        payments = await PaymentService.get_payments_by_order(
            db=async_db,
            order_id=test_order.id,
        )

        assert len(payments) >= 2

    @pytest.mark.asyncio
    async def test_update_payment_status(self, async_db, test_payment):
        """Test updating payment status"""
        updated = await PaymentService.update_payment_status(
            db=async_db,
            payment_id=test_payment.id,
            status=PaymentStatus.PROCESSING,
            provider_payment_id="MP-123",
        )

        assert updated.status == PaymentStatus.PROCESSING
        assert updated.provider_payment_id == "MP-123"

    @pytest.mark.asyncio
    async def test_mark_payment_completed(self, async_db, test_payment):
        """Test marking payment as completed"""
        completed = await PaymentService.mark_payment_completed(
            db=async_db,
            payment_id=test_payment.id,
            provider_payment_id="MP-SUCCESS-999",
        )

        assert completed.status == PaymentStatus.COMPLETED
        assert completed.provider_payment_id == "MP-SUCCESS-999"
        assert completed.completed_at is not None

    @pytest.mark.asyncio
    async def test_mark_payment_failed(self, async_db, test_payment):
        """Test marking payment as failed with error"""
        failed = await PaymentService.mark_payment_failed(
            db=async_db,
            payment_id=test_payment.id,
            error_message="Insufficient funds",
        )

        assert failed.status == PaymentStatus.FAILED
        assert failed.error_message == "Insufficient funds"

    @pytest.mark.asyncio
    async def test_refund_payment_success(self, async_db, test_payment):
        """Test refunding a completed payment"""
        # First complete the payment
        await PaymentService.mark_payment_completed(
            db=async_db,
            payment_id=test_payment.id,
            provider_payment_id="MP-COMP-123",
        )

        # Then refund it
        refunded = await PaymentService.refund_payment(
            db=async_db,
            payment_id=test_payment.id,
        )

        assert refunded.status == PaymentStatus.REFUNDED

    @pytest.mark.asyncio
    async def test_refund_payment_not_completed(self, async_db, test_payment):
        """Test refunding a non-completed payment fails"""
        with pytest.raises(ValueError, match="Can only refund completed payments"):
            await PaymentService.refund_payment(
                db=async_db,
                payment_id=test_payment.id,
            )
