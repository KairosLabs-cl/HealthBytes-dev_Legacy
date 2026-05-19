"""
E2E integration tests for the complete Mercado Pago checkout flow.

Verifies the full data pipeline from order creation to payment confirmation,
using SQLite in-memory DB and mocked Mercado Pago API calls.

Flow covered:
  POST /orders/          → order created (pending, stock reserved)
  POST create-preference → Payment record created (PENDING)
  POST webhook           → Payment + order status updated
  GET  /orders/{id}      → verify final DB state
"""

import hashlib
import hmac
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from sqlalchemy import select as sql_select

from app.config import settings
from app.db.models.payment import Payment, PaymentProvider, PaymentStatus
from app.db.schemas import Product
from app.main import app
from app.middleware.auth import get_current_user
from tests.conftest import create_test_user

MP_BASE = "/api/v1/payments/mercadopago"
ORDERS_BASE = "/orders"
TEST_WEBHOOK_SECRET = "test-webhook-secret"


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------


@pytest.fixture(autouse=True)
def mp_webhook_secret(monkeypatch):
    """Configure webhook secret so E2E webhook tests exercise signature validation."""
    monkeypatch.setattr(settings, "MERCADO_PAGO_WEBHOOK_SECRET", TEST_WEBHOOK_SECRET)


@pytest.fixture
def e2e_user(db_session):
    """Customer user for E2E tests."""
    return create_test_user(
        db_session,
        email="e2e_checkout@test.com",
        role="customer",
        name="E2E User",
        clerk_id="clerk_e2e_001",
    )


@pytest.fixture
def e2e_product(db_session):
    """Product with stock=10 for E2E checkout tests."""
    p = Product(name="Arroz Sin TACC", price=5000.0, stock=10)
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    return p


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------


def _webhook_signature(payment_id, request_id=None, ts="1707849600"):
    """Build signed Mercado Pago webhook headers for tests."""
    if request_id:
        manifest = f"id:{payment_id};request-id:{request_id};ts:{ts};"
    else:
        manifest = f"id:{payment_id};ts:{ts};"
    webhook_secret = settings.MERCADO_PAGO_WEBHOOK_SECRET
    assert webhook_secret, "MERCADO_PAGO_WEBHOOK_SECRET must be set for signed webhook tests"
    v1 = hmac.new(webhook_secret.encode(), manifest.encode(), hashlib.sha256).hexdigest()
    headers = {"x-signature": f"ts={ts},v1={v1}"}
    if request_id:
        headers["x-request-id"] = request_id
    return headers


def _order_payload(product, **extra):
    """Build order creation request body."""
    return {
        "items": [{"productId": product.id, "quantity": 1, "price": int(product.price)}],
        **extra,
    }


def _preference_response(pref_id="pref_e2e_001"):
    """Mock httpx response for MP create-preference POST."""
    mock = MagicMock()
    mock.status_code = 201
    mock.json.return_value = {
        "id": pref_id,
        "init_point": f"https://mercadopago.cl/checkout?pref={pref_id}",
        "sandbox_init_point": f"https://sandbox.mercadopago.cl/checkout?pref={pref_id}",
    }
    return mock


def _payment_info_response(mp_id, status, order_id):
    """Mock httpx response for MP get-payment-info GET (used inside process_webhook)."""
    mock = MagicMock()
    mock.status_code = 200
    mock.json.return_value = {
        "id": mp_id,
        "status": status,
        "status_detail": "accredited" if status == "approved" else status,
        "external_reference": str(order_id),
    }
    return mock


def _get_payment_from_db(db_session, order_id):
    """Query the Payment record for a given order (sync helper)."""
    return db_session.execute(
        sql_select(Payment).where(Payment.order_id == order_id)
    ).scalar_one_or_none()


def _get_product_stock(db_session, product_id):
    """Query current stock for a product (sync helper)."""
    return (
        db_session.execute(sql_select(Product).where(Product.id == product_id)).scalar_one().stock
    )


# ---------------------------------------------------------------------------
# E2E: Happy Path — Payment Approved
# ---------------------------------------------------------------------------


class TestE2ECheckoutApproved:
    """Full flow: order → preference → webhook approved → order confirmed."""

    def test_payment_approved_confirms_order(self, client, db_session, e2e_user, e2e_product):
        """
        Happy path:
        1. Create order          → status=pending, stock reserved (10→9)
        2. Create preference     → Payment record PENDING in DB
        3. Webhook (approved)    → Payment COMPLETED, order CONFIRMED
        4. GET /orders/{id}      → response status=confirmed
        5. DB assertions         → Payment.status=COMPLETED, completed_at set
        """
        app.dependency_overrides[get_current_user] = lambda: e2e_user
        try:
            # Step 1: Create order
            resp = client.post(
                f"{ORDERS_BASE}",
                json=_order_payload(e2e_product, paymentMethod="mercado_pago"),
            )
            assert resp.status_code == 201, resp.json()
            order_id = resp.json()["id"]
            assert resp.json()["status"] == "unpaid"

            mp_pay_id = "mp_pay_e2e_001"

            with patch("httpx.AsyncClient") as MockHttp:
                # POST /checkout/preferences → preference created
                MockHttp.return_value.__aenter__.return_value.post = AsyncMock(
                    return_value=_preference_response()
                )
                # GET /v1/payments/{id} → called inside process_webhook
                MockHttp.return_value.__aenter__.return_value.get = AsyncMock(
                    return_value=_payment_info_response(mp_pay_id, "approved", order_id)
                )

                # Step 2: Create MP preference
                pref_resp = client.post(
                    f"{MP_BASE}/create-preference",
                    json={"order_id": order_id, "payer_email": "e2e@test.com"},
                )
                assert pref_resp.status_code == 200, pref_resp.json()
                pref_data = pref_resp.json()
                assert pref_data["preference_id"] == "pref_e2e_001"
                assert "init_point" in pref_data

                # Verify Payment record was created with PENDING status
                payment = _get_payment_from_db(db_session, order_id)
                assert payment is not None
                assert payment.status == PaymentStatus.PENDING
                assert payment.provider == PaymentProvider.MERCADO_PAGO

                # Step 3: Simulate MP webhook — payment approved
                webhook_resp = client.post(
                    f"{MP_BASE}/webhook",
                    json={"type": "payment", "data": {"id": mp_pay_id}},
                    headers=_webhook_signature(mp_pay_id, "e2e-req-001"),
                )
                assert webhook_resp.status_code == 200, webhook_resp.json()
                webhook_data = webhook_resp.json()
                assert webhook_data["status"] == "ok"
                assert webhook_data["result"]["status"] == "completed"
                assert webhook_data["result"]["order_id"] == order_id

            # Step 4: Verify order via GET endpoint
            order_resp = client.get(f"{ORDERS_BASE}/{order_id}")
            assert order_resp.status_code == 200
            assert order_resp.json()["status"] == "processing"
            payment = _get_payment_from_db(db_session, order_id)
            assert payment.status == PaymentStatus.COMPLETED
            assert payment.provider_payment_id == mp_pay_id
            assert payment.completed_at is not None

        finally:
            app.dependency_overrides.pop(get_current_user, None)


# ---------------------------------------------------------------------------
# E2E: Payment Rejected — Order Cancelled, Stock Released
# ---------------------------------------------------------------------------


class TestE2ECheckoutRejected:
    """Payment rejected: order cancelled and reserved stock released."""

    def test_payment_rejected_cancels_order_and_releases_stock(
        self, client, db_session, e2e_user, e2e_product
    ):
        """
        Rejection path:
        1. Create order          → stock reserved (10→9)
        2. Create preference     → Payment PENDING
        3. Webhook (rejected)    → Payment FAILED, order CANCELLED, stock 9→10
        """
        app.dependency_overrides[get_current_user] = lambda: e2e_user
        try:
            initial_stock = _get_product_stock(db_session, e2e_product.id)
            assert initial_stock == 10

            # Step 1: Create order
            resp = client.post(
                f"{ORDERS_BASE}",
                json=_order_payload(e2e_product, paymentMethod="mercado_pago"),
            )
            assert resp.status_code == 201, resp.json()
            order_id = resp.json()["id"]

            # Stock should be reserved (decreased by 1)
            stock_after_order = _get_product_stock(db_session, e2e_product.id)
            assert stock_after_order == initial_stock - 1

            mp_pay_id = "mp_pay_e2e_rejected_001"

            with patch("httpx.AsyncClient") as MockHttp:
                MockHttp.return_value.__aenter__.return_value.post = AsyncMock(
                    return_value=_preference_response("pref_e2e_rejected_001")
                )
                MockHttp.return_value.__aenter__.return_value.get = AsyncMock(
                    return_value=_payment_info_response(mp_pay_id, "rejected", order_id)
                )

                # Step 2: Create preference
                pref_resp = client.post(
                    f"{MP_BASE}/create-preference",
                    json={"order_id": order_id},
                )
                assert pref_resp.status_code == 200, pref_resp.json()

                # Step 3: Webhook — payment rejected
                webhook_resp = client.post(
                    f"{MP_BASE}/webhook",
                    json={"type": "payment", "data": {"id": mp_pay_id}},
                    headers=_webhook_signature(mp_pay_id),
                )
                assert webhook_resp.status_code == 200, webhook_resp.json()
                assert webhook_resp.json()["result"]["status"] == "failed"

            # Verify order is cancelled
            order_resp = client.get(f"{ORDERS_BASE}/{order_id}")
            assert order_resp.status_code == 200
            assert order_resp.json()["status"] == "cancelled"

            # Verify Payment record
            payment = _get_payment_from_db(db_session, order_id)
            assert payment.status == PaymentStatus.FAILED

            # Verify stock was released back to initial value
            stock_after_rejection = _get_product_stock(db_session, e2e_product.id)
            assert stock_after_rejection == initial_stock

        finally:
            app.dependency_overrides.pop(get_current_user, None)


# ---------------------------------------------------------------------------
# E2E: Webhook Idempotency
# ---------------------------------------------------------------------------


class TestE2EWebhookIdempotency:
    """Duplicate webhook fires don't cause double-processing or errors."""

    def test_duplicate_approved_webhook_is_idempotent(
        self, client, db_session, e2e_user, e2e_product
    ):
        """
        Idempotency check:
        1. Create order + preference
        2. Webhook (approved) → order confirmed
        3. Same webhook again  → still 200, order still confirmed, Payment unchanged
        """
        app.dependency_overrides[get_current_user] = lambda: e2e_user
        try:
            resp = client.post(
                f"{ORDERS_BASE}",
                json=_order_payload(e2e_product, paymentMethod="mercado_pago"),
            )
            assert resp.status_code == 201
            order_id = resp.json()["id"]

            mp_pay_id = "mp_pay_e2e_idem_001"

            with patch("httpx.AsyncClient") as MockHttp:
                MockHttp.return_value.__aenter__.return_value.post = AsyncMock(
                    return_value=_preference_response("pref_idem_001")
                )
                MockHttp.return_value.__aenter__.return_value.get = AsyncMock(
                    return_value=_payment_info_response(mp_pay_id, "approved", order_id)
                )

                # Create preference
                pref_resp = client.post(
                    f"{MP_BASE}/create-preference",
                    json={"order_id": order_id},
                )
                assert pref_resp.status_code == 200

                webhook_payload = {"type": "payment", "data": {"id": mp_pay_id}}

                # First webhook — transitions payment PENDING → COMPLETED
                r1 = client.post(
                    f"{MP_BASE}/webhook",
                    json=webhook_payload,
                    headers=_webhook_signature(mp_pay_id),
                )
                assert r1.status_code == 200
                assert r1.json()["status"] == "ok"
                assert r1.json()["result"]["status"] == "completed"

                # Second identical webhook — idempotency guard returns early
                r2 = client.post(
                    f"{MP_BASE}/webhook",
                    json=webhook_payload,
                    headers=_webhook_signature(mp_pay_id),
                )
                assert r2.status_code == 200
                assert r2.json()["status"] == "ok"
                # Status still reported as completed (not an error)
                assert r2.json()["result"]["status"] == "completed"

            # Order still processing after duplicate webhook
            order_resp = client.get(f"{ORDERS_BASE}/{order_id}")
            assert order_resp.status_code == 200
            assert order_resp.json()["status"] == "processing"

            # Payment is still COMPLETED (not reset)
            payment = _get_payment_from_db(db_session, order_id)
            assert payment.status == PaymentStatus.COMPLETED

        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_webhook_for_unknown_type_is_acknowledged(self, client, db_session):
        """Non-payment notification types return 200 without processing."""
        resp = client.post(
            f"{MP_BASE}/webhook",
            json={"type": "merchant_order", "data": {"id": "order_abc"}},
        )
        assert resp.status_code == 200
        assert "acknowledged" in resp.json()["message"]
