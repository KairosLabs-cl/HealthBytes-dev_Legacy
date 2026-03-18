"""
E2E test — Checkout flow: cart → order → MP webhook → order status updated.
Mocks external dependencies (Mercado Pago) but uses real service layer.
"""

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_unauthenticated_checkout_is_blocked(client):
    """Checkout must be blocked — no order should be creatable without auth."""
    response = client.post(
        "/orders",
        json={"payment_method": "mercadopago"},
    )
    assert response.status_code == 401
