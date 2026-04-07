"""
Tests for Mercado Pago API router endpoints.
Covers create-preference, webhook, get-payment-status, refund.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.main import app
from app.middleware.auth import get_current_user
from tests.conftest import create_test_user

# The MP router is mounted at /api/v1 prefix + router prefix /payments/mercadopago
BASE_URL = "/api/v1/payments/mercadopago"


@pytest.fixture
def customer_user(db_session):
    """Create a customer user."""
    return create_test_user(
        db_session, email="mp_router_user@test.com", role="customer", name="MP User"
    )


@pytest.fixture
def admin_user(db_session):
    """Create an admin user."""
    return create_test_user(db_session, email="mp_admin@test.com", role="admin", name="MP Admin")


class TestCreatePreference:
    """Tests for POST /api/v1/payments/mercadopago/create-preference"""

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_create_preference_success(self, mock_mp_cls, client, db_session, customer_user):
        """Test successful preference creation."""
        mock_order = MagicMock(id=1, user_id=customer_user.id)

        mock_mp = MagicMock()
        mock_mp.create_preference = AsyncMock(
            return_value={
                "payment_id": 1,
                "preference_id": "pref_abc",
                "init_point": "https://mp.com/checkout",
                "sandbox_init_point": "https://sandbox.mp.com/checkout",
            }
        )
        mock_mp_cls.return_value = mock_mp

        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            with patch(
                "app.services.order_service.get_order",
                new_callable=AsyncMock,
                return_value=mock_order,
            ):
                response = client.post(
                    f"{BASE_URL}/create-preference",
                    json={"order_id": 1, "payer_email": "test@test.com"},
                )
                assert response.status_code == 200
                data = response.json()
                assert data["preference_id"] == "pref_abc"
                assert data["init_point"] == "https://mp.com/checkout"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_create_preference_order_not_found(
        self, mock_mp_cls, client, db_session, customer_user
    ):
        """Test preference creation with non-existent order."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            with patch(
                "app.services.order_service.get_order",
                new_callable=AsyncMock,
                return_value=None,
            ):
                response = client.post(
                    f"{BASE_URL}/create-preference",
                    json={"order_id": 999},
                )
                assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_preference_requires_auth(self, client):
        """Test preference creation requires authentication."""
        response = client.post(
            f"{BASE_URL}/create-preference",
            json={"order_id": 1},
        )
        assert response.status_code == 401


class TestWebhook:
    """Tests for POST /api/v1/payments/mercadopago/webhook"""

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_webhook_payment_success(self, mock_mp_cls, client, db_session):
        """Test webhook processes payment notification."""
        mock_mp = MagicMock()
        mock_mp.process_webhook = AsyncMock(
            return_value={
                "payment_id": 1,
                "order_id": 1,
                "status": "completed",
                "mp_payment_id": "12345",
            }
        )
        mock_mp_cls.return_value = mock_mp

        response = client.post(
            f"{BASE_URL}/webhook",
            json={"type": "payment", "data": {"id": "12345"}},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "ok"

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_webhook_no_payment_id(self, mock_mp_cls, client, db_session):
        """Test webhook with missing payment ID returns 400."""
        response = client.post(
            f"{BASE_URL}/webhook",
            json={"type": "payment", "data": {}},
        )
        assert response.status_code == 400

    def test_webhook_non_payment_type(self, client, db_session):
        """Test webhook acknowledges non-payment notification types."""
        response = client.post(
            f"{BASE_URL}/webhook",
            json={"type": "merchant_order", "data": {"id": "abc"}},
        )
        assert response.status_code == 200
        assert "acknowledged" in response.json()["message"]

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_webhook_payment_error_returns_200(self, mock_mp_cls, client, db_session):
        """Test webhook returns 200 even on PaymentError (to avoid MP retries)."""
        from app.core.exceptions import PaymentError

        mock_mp = MagicMock()
        mock_mp.process_webhook = AsyncMock(side_effect=PaymentError("test error"))
        mock_mp_cls.return_value = mock_mp

        response = client.post(
            f"{BASE_URL}/webhook",
            json={"type": "payment", "data": {"id": "12345"}},
        )
        assert response.status_code == 200
        assert response.json()["status"] == "error"

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_webhook_idempotent_duplicate_ignored(self, mock_mp_cls, client, db_session):
        """Test that duplicate webhook for already-completed payment is handled idempotently."""
        mock_mp = MagicMock()
        # Service returns same status (idempotency guard triggered internally)
        mock_mp.process_webhook = AsyncMock(
            return_value={
                "payment_id": 1,
                "order_id": 1,
                "status": "completed",
                "mp_payment_id": "12345",
            }
        )
        mock_mp_cls.return_value = mock_mp

        payload = {"type": "payment", "data": {"id": "12345"}}

        # First call
        r1 = client.post(f"{BASE_URL}/webhook", json=payload)
        assert r1.status_code == 200
        assert r1.json()["status"] == "ok"

        # Duplicate call — should also return 200 (not 4xx)
        r2 = client.post(f"{BASE_URL}/webhook", json=payload)
        assert r2.status_code == 200
        assert r2.json()["status"] == "ok"

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_webhook_logs_x_request_id(self, mock_mp_cls, client, db_session):
        """Test webhook accepts and logs x-request-id header without error."""
        mock_mp = MagicMock()
        mock_mp.process_webhook = AsyncMock(
            return_value={
                "payment_id": 1,
                "order_id": 1,
                "status": "completed",
                "mp_payment_id": "12345",
            }
        )
        mock_mp_cls.return_value = mock_mp

        response = client.post(
            f"{BASE_URL}/webhook",
            json={"type": "payment", "data": {"id": "12345"}},
            headers={"x-request-id": "mp-req-abc123"},
        )
        assert response.status_code == 200


class TestGetPaymentStatus:
    """Tests for GET /api/v1/payments/mercadopago/payment/{payment_id}"""

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_get_payment_status_success(self, mock_mp_cls, client, db_session, customer_user):
        """Test getting payment status."""
        mock_mp = MagicMock()
        mock_mp.get_payment_info = AsyncMock(
            return_value={
                "status": "approved",
                "status_detail": "accredited",
                "external_reference": "1",
            }
        )
        mock_mp_cls.return_value = mock_mp

        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get(f"{BASE_URL}/payment/12345")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "approved"
            assert data["payment_id"] == "12345"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_payment_status_requires_auth(self, client):
        """Test getting payment status requires auth."""
        response = client.get(f"{BASE_URL}/payment/12345")
        assert response.status_code == 401


class TestRefund:
    """Tests for POST /api/v1/payments/mercadopago/refund"""

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_refund_success(self, mock_mp_cls, client, db_session, admin_user):
        """Test successful refund (admin only)."""
        mock_mp = MagicMock()
        mock_mp.refund_payment = AsyncMock(
            return_value={
                "payment_id": 1,
                "refund_id": "refund_123",
                "amount": 5000.0,
                "status": "refunded",
            }
        )
        mock_mp_cls.return_value = mock_mp

        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.post(
                f"{BASE_URL}/refund",
                json={"payment_id": 1},
            )
            assert response.status_code == 200
            assert response.json()["status"] == "refunded"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch("app.api.v1.mercadopago.MercadoPagoService")
    def test_refund_payment_error(self, mock_mp_cls, client, db_session, admin_user):
        """Test refund with PaymentError returns 400."""
        from app.core.exceptions import PaymentError

        mock_mp = MagicMock()
        mock_mp.refund_payment = AsyncMock(side_effect=PaymentError("Not found"))
        mock_mp_cls.return_value = mock_mp

        app.dependency_overrides[get_current_user] = lambda: admin_user
        try:
            response = client.post(
                f"{BASE_URL}/refund",
                json={"payment_id": 999},
            )
            assert response.status_code == 400
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_refund_customer_forbidden(self, client, db_session, customer_user):
        """Test that non-admin users cannot refund."""
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.post(
                f"{BASE_URL}/refund",
                json={"payment_id": 1},
            )
            assert response.status_code == 403
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_refund_requires_auth(self, client):
        """Test refund requires authentication."""
        response = client.post(
            f"{BASE_URL}/refund",
            json={"payment_id": 1},
        )
        assert response.status_code == 401
