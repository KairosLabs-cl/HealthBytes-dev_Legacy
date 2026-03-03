import pytest
from httpx import AsyncClient
from app.main import app
from tests.conftest import create_test_user
import json

@pytest.fixture
def customer_user(db_session):
    return create_test_user(db_session, email="customer@test.com", role="customer", name="Customer User")

def test_privilege_escalation_via_user_update(client, customer_user, db_session):
    from app.middleware.auth import get_current_user
    app.dependency_overrides[get_current_user] = lambda: customer_user

    try:
        response = client.put(
            f"/users/{customer_user.id}",
            json={"role": "admin", "name": "New Name"},
        )
        assert response.status_code == 200
        data = response.json()

        # Verify name changed but role remained 'customer'
        assert data["name"] == "New Name"
        assert data["role"] == "customer"
    finally:
        app.dependency_overrides.pop(get_current_user, None)
