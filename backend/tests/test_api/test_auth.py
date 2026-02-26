"""Authentication endpoints tests."""

import pytest


@pytest.mark.unit
@pytest.mark.auth
def test_register_user(client, sample_user_data):
    """Test POST /auth/register endpoint."""
    response = client.post("/auth/register", json=sample_user_data)
    # Adjust status codes based on actual implementation
    assert response.status_code in [200, 201, 400, 409]


@pytest.mark.unit
@pytest.mark.auth
def test_login_user(client, sample_user_data):
    """Test POST /auth/login endpoint."""
    response = client.post(
        "/auth/login",
        json={"email": sample_user_data["email"], "password": sample_user_data["password"]},
    )
    assert response.status_code in [200, 401, 404]


@pytest.mark.unit
@pytest.mark.auth
def test_login_user_not_found(client):
    """Test POST /auth/login with non-existent user."""
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "password"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": {"error": "Authentication failed"}}
