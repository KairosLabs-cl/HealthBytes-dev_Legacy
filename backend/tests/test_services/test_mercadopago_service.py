"""
Tests for Mercado Pago Service
"""

import hashlib
import hmac
from decimal import Decimal
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.config import Settings
from app.core.exceptions import PaymentError
from app.db.models.payment import Payment, PaymentCurrency, PaymentProvider, PaymentStatus
from app.db.schemas import Order, OrderItem
from app.services.mercadopago_service import MercadoPagoService


@pytest.fixture
def mp_settings():
    """Mock settings for Mercado Pago"""
    settings = MagicMock(spec=Settings)
    settings.MERCADO_PAGO_ACCESS_TOKEN = "TEST-1234567890-ACCESS-TOKEN"
    settings.MERCADO_PAGO_WEBHOOK_SECRET = "secret123"
    settings.BACKEND_URL = "http://localhost:3001"
    settings.FRONTEND_URL = "http://localhost:8081"
    settings.ENVIRONMENT = "dev"
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
def test_order_with_items():
    """Mock order object with items"""
    order = MagicMock(spec=Order)
    order.id = 1
    order.status = "pending"
    order.user_id = 1

    item1 = MagicMock(spec=OrderItem)
    item1.product_id = 10
    item1.quantity = 2
    item1.price = Decimal("5000.00")

    item2 = MagicMock(spec=OrderItem)
    item2.product_id = 20
    item2.quantity = 1
    item2.price = Decimal("3000.00")

    order.items = [item1, item2]
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


# --- create_preference tests ---


@pytest.mark.asyncio
async def test_create_preference_order_not_found(mp_service, mock_db):
    """Test preference creation with non-existent order"""
    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    )

    with pytest.raises(PaymentError, match="Order .* not found"):
        await mp_service.create_preference(db=mock_db, order_id=999)


@pytest.mark.asyncio
async def test_create_preference_cancelled_order(mp_service, mock_db, test_order_with_items):
    """Test preference creation with cancelled order"""
    test_order_with_items.status = "cancelled"

    mock_db.execute = AsyncMock(
        return_value=MagicMock(
            scalar_one_or_none=MagicMock(return_value=test_order_with_items)
        )
    )

    with pytest.raises(PaymentError, match="cancelled"):
        await mp_service.create_preference(db=mock_db, order_id=test_order_with_items.id)


@pytest.mark.asyncio
async def test_create_preference_no_items(mp_service, mock_db):
    """Test preference creation with order that has no items"""
    order = MagicMock(spec=Order)
    order.id = 1
    order.status = "pending"
    order.items = []

    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=order))
    )

    with pytest.raises(PaymentError, match="has no items"):
        await mp_service.create_preference(db=mock_db, order_id=1)


@pytest.mark.asyncio
async def test_create_preference_success(mp_service, mock_db, test_order_with_items):
    """Test successful preference creation"""
    mock_db.execute = AsyncMock(
        return_value=MagicMock(
            scalar_one_or_none=MagicMock(return_value=test_order_with_items)
        )
    )

    mp_response = {
        "id": "pref_123",
        "init_point": "https://www.mercadopago.cl/checkout/v1/redirect?pref_id=pref_123",
        "sandbox_init_point": "https://sandbox.mercadopago.cl/checkout/v1/redirect?pref_id=pref_123",
    }

    with patch("httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 201
        mock_response.json.return_value = mp_response

        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            return_value=mock_response
        )

        result = await mp_service.create_preference(
            db=mock_db, order_id=1, payer_email="test@example.com"
        )

        assert result["preference_id"] == "pref_123"
        assert result["init_point"] == mp_response["init_point"]
        assert result["sandbox_init_point"] == mp_response["sandbox_init_point"]
        assert "payment_id" in result


@pytest.mark.asyncio
async def test_create_preference_mp_api_error(mp_service, mock_db, test_order_with_items):
    """Test preference creation when MP API returns error"""
    mock_db.execute = AsyncMock(
        return_value=MagicMock(
            scalar_one_or_none=MagicMock(return_value=test_order_with_items)
        )
    )

    with patch("httpx.AsyncClient") as mock_client:
        mock_response = MagicMock()
        mock_response.status_code = 400
        mock_response.text = '{"error": "bad request"}'
        mock_response.json.return_value = {"error": "bad request"}

        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            return_value=mock_response
        )

        with pytest.raises(PaymentError, match="Mercado Pago API error"):
            await mp_service.create_preference(db=mock_db, order_id=1)


# --- get_payment_info tests ---


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


# --- process_webhook tests ---


@pytest.mark.asyncio
async def test_process_webhook_no_external_reference(mp_service, mock_db):
    """Test webhook with missing external_reference"""
    payment_info = {
        "id": "12345",
        "status": "approved",
    }

    mp_service.get_payment_info = AsyncMock(return_value=payment_info)

    with pytest.raises(PaymentError, match="No external_reference"):
        await mp_service.process_webhook(
            db=mock_db, payment_id="12345", topic="payment"
        )


@pytest.mark.asyncio
async def test_process_webhook_payment_not_found(mp_service, mock_db):
    """Test webhook when payment record not found in DB"""
    payment_info = {
        "id": "12345",
        "status": "approved",
        "external_reference": "999",
    }

    mp_service.get_payment_info = AsyncMock(return_value=payment_info)
    mock_db.execute = AsyncMock(
        return_value=MagicMock(scalar_one_or_none=MagicMock(return_value=None))
    )

    with pytest.raises(PaymentError, match="Payment not found"):
        await mp_service.process_webhook(
            db=mock_db, payment_id="12345", topic="payment"
        )


@pytest.mark.asyncio
async def test_process_webhook_approved(mp_service, mock_db, test_payment):
    """Test webhook with approved payment updates order to confirmed"""
    payment_info = {
        "id": "12345",
        "status": "approved",
        "external_reference": "1",
    }

    mp_service.get_payment_info = AsyncMock(return_value=payment_info)

    order_mock = MagicMock()
    order_mock.status = "pending"

    mock_db.execute = AsyncMock(
        side_effect=[
            MagicMock(scalar_one_or_none=MagicMock(return_value=test_payment)),
            MagicMock(scalar_one_or_none=MagicMock(return_value=order_mock)),
        ]
    )

    result = await mp_service.process_webhook(
        db=mock_db, payment_id="12345", topic="payment"
    )

    assert result["status"] == "completed"
    assert order_mock.status == "confirmed"
    assert test_payment.status == PaymentStatus.COMPLETED


@pytest.mark.asyncio
async def test_process_webhook_rejected(mp_service, mock_db, test_payment, test_order_with_items):
    """Test webhook with rejected payment cancels order and releases stock"""
    payment_info = {
        "id": "12345",
        "status": "rejected",
        "external_reference": "1",
    }

    mp_service.get_payment_info = AsyncMock(return_value=payment_info)

    test_order_with_items.status = "pending"

    mock_db.execute = AsyncMock(
        side_effect=[
            MagicMock(scalar_one_or_none=MagicMock(return_value=test_payment)),
            MagicMock(scalar_one_or_none=MagicMock(return_value=test_order_with_items)),
        ]
    )

    with patch(
        "app.services.mercadopago_service.StockService.release_stock", new_callable=AsyncMock
    ) as mock_release:
        result = await mp_service.process_webhook(
            db=mock_db, payment_id="12345", topic="payment"
        )

        assert result["status"] == "failed"
        assert test_order_with_items.status == "cancelled"
        assert test_payment.status == PaymentStatus.FAILED
        assert mock_release.call_count == len(test_order_with_items.items)


@pytest.mark.asyncio
async def test_process_webhook_invalid_signature(mp_service, mock_db):
    """Test webhook with invalid signature raises error"""
    with pytest.raises(PaymentError, match="Invalid webhook signature"):
        await mp_service.process_webhook(
            db=mock_db,
            payment_id="12345",
            topic="payment",
            webhook_signature="ts=12345,v1=invalid_hash",
        )


# --- refund tests ---


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


@pytest.mark.asyncio
async def test_refund_payment_success(mp_service, mock_db, test_payment, test_order_with_items):
    """Test successful refund with stock release and order cancellation"""
    test_payment.status = PaymentStatus.COMPLETED
    test_payment.provider_payment_id = "mp_pay_123"
    test_order_with_items.status = "confirmed"

    # First execute returns payment, second returns order (for stock release)
    payment_result = MagicMock(scalar_one_or_none=MagicMock(return_value=test_payment))
    order_result = MagicMock(scalar_one_or_none=MagicMock(return_value=test_order_with_items))
    mock_db.execute = AsyncMock(side_effect=[payment_result, order_result])

    refund_response = {"id": "refund_456", "amount": 13000.0}

    with patch("httpx.AsyncClient") as mock_client, patch(
        "app.services.mercadopago_service.StockService.release_stock", new_callable=AsyncMock
    ) as mock_release:
        mock_resp = MagicMock()
        mock_resp.status_code = 201
        mock_resp.json.return_value = refund_response

        mock_client.return_value.__aenter__.return_value.post = AsyncMock(
            return_value=mock_resp
        )

        result = await mp_service.refund_payment(db=mock_db, payment_id=test_payment.id)

        assert result["status"] == "refunded"
        assert result["refund_id"] == "refund_456"
        assert test_payment.status == PaymentStatus.REFUNDED
        assert test_order_with_items.status == "cancelled"
        assert mock_release.call_count == len(test_order_with_items.items)


# --- _validate_x_signature tests ---


def test_validate_x_signature_valid(mp_service):
    """Test valid x-signature validation"""
    data_id = "12345"
    ts = "1707849600"

    manifest = f"id:{data_id};ts:{ts};"
    v1 = hmac.new(
        mp_service.webhook_secret.encode(), manifest.encode(), hashlib.sha256
    ).hexdigest()

    x_signature = f"ts={ts},v1={v1}"

    assert mp_service._validate_x_signature(x_signature, data_id) is True


def test_validate_x_signature_invalid(mp_service):
    """Test invalid x-signature"""
    x_signature = "ts=12345,v1=invalid_hash"
    assert mp_service._validate_x_signature(x_signature, "12345") is False


def test_validate_x_signature_no_secret():
    """Test signature validation skipped when no secret configured"""
    settings = MagicMock(spec=Settings)
    settings.MERCADO_PAGO_ACCESS_TOKEN = "test"
    settings.MERCADO_PAGO_WEBHOOK_SECRET = None

    service = MercadoPagoService(settings)
    assert service._validate_x_signature("ts=1,v1=abc", "12345") is True


def test_validate_x_signature_malformed(mp_service):
    """Test malformed x-signature header"""
    assert mp_service._validate_x_signature("garbage", "12345") is False
    assert mp_service._validate_x_signature("ts=123", "12345") is False
    assert mp_service._validate_x_signature("", "12345") is False
