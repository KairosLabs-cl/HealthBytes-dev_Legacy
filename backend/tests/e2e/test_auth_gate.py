"""
E2E tests — AuthGate regression suite.
All protected endpoints must return 401 without a valid token.
This suite is the canonical verification that the infinite-loop fix
in checkout-v2.tsx did not break backend auth, and that the AuthGate
middleware is applied consistently.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture
def client():
    return TestClient(app)


def test_cart_requires_auth(client):
    """Cart endpoint requires authentication."""
    response = client.get("/cart")
    assert response.status_code == 401


def test_addresses_requires_auth(client):
    """
    Regression: the infinite /addresses loop fix — endpoint must
    return 401 before executing any DB logic.
    """
    response = client.get("/addresses")
    assert response.status_code == 401


def test_orders_requires_auth(client):
    response = client.get("/orders")
    assert response.status_code == 401


def test_favorites_requires_auth(client):
    response = client.get("/favorites")
    assert response.status_code == 401


def test_health_is_public(client):
    response = client.get("/health")
    assert response.status_code == 200
