"""
Test for order pagination.
"""

import time

import pytest
from app.db.schemas import Order
from app.main import app
from app.middleware.auth import get_current_user
from tests.conftest import create_test_user


@pytest.fixture
def test_user(db_session):
    """Create a test user."""
    return create_test_user(
        db_session, email="pagination@example.com", role="user", clerk_id="user_pag_1"
    )


def test_list_orders_pagination(client, db_session, test_user):
    """Test pagination for GET /orders."""
    # Override auth to return our test user
    app.dependency_overrides[get_current_user] = lambda: test_user

    try:
        # Create 5 dummy orders directly in DB
        orders = []
        for i in range(5):
            order = Order(
                user_id=test_user.id,
                status="New",
                total=10.0 * (i + 1),
                stripe_payment_intent_id=f"pi_{i}",
            )
            db_session.add(order)
            db_session.commit()  # Commit to generate ID and created_at

        # Verify total orders
        response = client.get("/orders")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 5
        # Verify default sort order (Newest first -> pi_4)
        assert data[0]["stripe_payment_intent_id"] == "pi_4"
        assert data[4]["stripe_payment_intent_id"] == "pi_0"

        # Test Page 1 (Limit 2, Skip 0) -> Should get Newest 2 (pi_4, pi_3)
        response = client.get("/orders?limit=2&skip=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["stripe_payment_intent_id"] == "pi_4"
        assert data[1]["stripe_payment_intent_id"] == "pi_3"

        # Test Page 2 (Limit 2, Skip 2) -> Should get Next 2 (pi_2, pi_1)
        response = client.get("/orders?limit=2&skip=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2
        assert data[0]["stripe_payment_intent_id"] == "pi_2"
        assert data[1]["stripe_payment_intent_id"] == "pi_1"

        # Test Page 3 (Limit 2, Skip 4) -> Should get Last 1 (pi_0)
        response = client.get("/orders?limit=2&skip=4")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["stripe_payment_intent_id"] == "pi_0"

        # Test Empty Page (Limit 2, Skip 6)
        response = client.get("/orders?limit=2&skip=6")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 0

    finally:
        # Clean up override
        app.dependency_overrides.pop(get_current_user, None)
