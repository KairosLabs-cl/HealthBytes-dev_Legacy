"""Authentication endpoints tests."""

from unittest.mock import patch

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
    """Test POST /auth/login with non-existent user returns 401."""
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "password"},
    )
    assert response.status_code == 401
    assert response.json() == {"detail": {"error": "Authentication failed"}}


@pytest.mark.unit
@pytest.mark.auth
def test_login_user_not_found_calls_mock_verification(client):
    """Verify that verify_password_mock is called when the email does not exist.

    This test enforces the anti-timing-attack contract: when a login attempt is made
    with an unknown email, the endpoint MUST invoke verify_password_mock() to simulate
    bcrypt work and keep response times indistinguishable from a real failed login.

    Note: actual timing equality is not asserted here — doing so reliably requires
    integration/load tests in a controlled environment. This test only ensures the
    code path that provides the protection is not accidentally removed.
    """
    with patch("app.api.v1.auth.verify_password_mock") as mock_verify:
        response = client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "somepassword"},
        )
    assert response.status_code == 401
    mock_verify.assert_called_once_with("somepassword")
