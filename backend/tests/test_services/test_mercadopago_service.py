"""
Tests for Mercado Pago Service
"""

import pytest
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

from app.services.mercadopago_service import MercadoPagoService
from app.db.models.payment import Payment, PaymentProvider, PaymentStatus, PaymentCurrency
from app.db.schemas import Order
from app.core.exceptions import PaymentError
from app.config import Settings


@pytest.fixture
def mp_settings():
    """Mock settings for Mercado Pago"""
    settings = MagicMock(spec=Settings)
    settings.MERCADO_PAGO_ACCESS_TOKEN = "TEST-1234567890-ACCESS-TOKEN"
    settings.MERCADO_PAGO_WEBHOOK_SECRET = "secret123"
    settings.BACKEND_URL = "http://localhost:3001"
    settings.FRONTEND_URL = "http://localhost:8081"
    return settings


@pytest.fixture
def mp_service(mp_settings):
    """Create MercadoPagoService instance"""
    return MercadoPagoService(mp_settings)


@pytest.fixture
def mock_db():
    """Mock async database session"""
    db = AsyncMock()
    db.add = MagicMock()
    db.commit = AsyncMock()
    db.refresh = AsyncMock()
    return db


@pytest.fixture
def test_order():
    """Mock order object"""
    order = MagicMock()
    order.id = 1
    order.status = "pending"
    order.user_id = 1
    order.items = []
    return order


@pytest.fixture
def test_payment():
    """Mock payment object"""
    payment = MagicMock()
    payment.id = 1
    payment.order_id = 1
    payment.status = PaymentStatus.PENDING
    payment.provider = PaymentProvider.MERCADO_PAGO
    payment.provider_payment_id = None
    return payment


@pytest.mark.asyncio
async def test_create_preference_order_not_found(mp_service, mock_db):
    """Test preference creation with non-existent order"""
    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    )

    with pytest.raises(PaymentError, match="Order .* not found"):
        await mp_service.create_preference(
            db=mock_db, order_id=999, amount=Decimal("10000.00")
        )


@pytest.mark.asyncio
async def test_create_preference_cancelled_order(mp_service, mock_db, test_order):
    """Test preference creation with cancelled order"""
    test_order.status = "cancelled"

    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=test_order))
    )

    with pytest.raises(PaymentError, match="cancelled"):
        await mp_service.create_preference(
            db=mock_db, order_id=test_order.id, amount=Decimal("10000.00")
        )


@pytest.mark.asyncio
async def test_get_payment_info_success(mp_service):
    """Test getting payment info from MP"""
    payment_data = {
        "id": "12345",
        "status": "approved",
        "status_detail": "accredited",
        "external_reference": "123",
        "transaction_amount": 25000.00,
    }

    with patch("httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = payment_data

        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )

        result = await mp_service.get_payment_info("12345")

        assert result["status"] == "approved"
        assert result["external_reference"] == "123"


@pytest.mark.asyncio
async def test_get_payment_info_not_found(mp_service):
    """Test getting non-existent payment"""
    with patch("httpx.AsyncClient") as mock_client:
        mock_response = AsyncMock()
        mock_response.status_code = 404

        mock_client.return_value.__aenter__.return_value.get = AsyncMock(
            return_value=mock_response
        )

        with pytest.raises(PaymentError, match="Failed to get payment info"):
            await mp_service.get_payment_info("99999")


@pytest.mark.asyncio
async def test_process_webhook_no_external_reference(mp_service, mock_db):
    """Test webhook with missing external_reference"""
    payment_info = {
        "id": "12345",
        "status": "approved",
        # external_reference missing
    }

    mp_service.get_payment_info = AsyncMock(return_value=payment_info)

    with pytest.raises(PaymentError, match="No external_reference"):
        await mp_service.process_webhook(
            db=mock_db, payment_id="12345", topic="payment"
        )


@pytest.mark.asyncio
async def test_refund_payment_not_found(mp_service, mock_db):
    """Test refund of non-existent payment"""
    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    )

    with pytest.raises(PaymentError, match="not found"):
        await mp_service.refund_payment(db=mock_db, payment_id=999)


@pytest.mark.asyncio
async def test_refund_payment_not_completed(mp_service, mock_db, test_payment):
    """Test refund of non-completed payment"""
    test_payment.status = PaymentStatus.PENDING

    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=test_payment))
    )

    with pytest.raises(PaymentError, match="Can only refund completed payments"):
        await mp_service.refund_payment(db=mock_db, payment_id=test_payment.id)


@pytest.mark.asyncio
async def test_refund_payment_no_mp_id(mp_service, mock_db, test_payment):
    """Test refund without Mercado Pago payment ID"""
    test_payment.status = PaymentStatus.COMPLETED
    test_payment.provider_payment_id = None

    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=test_payment))
    )

    with pytest.raises(PaymentError, match="No Mercado Pago payment ID"):
        await mp_service.refund_payment(db=mock_db, payment_id=test_payment.id)


def test_verify_webhook_signature(mp_service):
    """Test webhook signature verification"""
    payload = '{"id": "12345", "status": "approved"}'
    timestamp = "1234567890"

    # Generate valid signature
    import hmac
    import hashlib

    message = f"{timestamp}{payload}"
    signature = hmac.new(
        mp_service.webhook_secret.encode(), message.encode(), hashlib.sha256
    ).hexdigest()

    is_valid = mp_service.verify_webhook_signature(payload, signature, timestamp)
    assert is_valid is True


def test_verify_webhook_signature_invalid(mp_service):
    """Test webhook signature verification with invalid signature"""
    payload = '{"id": "12345"}'
    timestamp = "1234567890"
    invalid_signature = "invalid_signature"

    is_valid = mp_service.verify_webhook_signature(payload, invalid_signature, timestamp)
    assert is_valid is False
