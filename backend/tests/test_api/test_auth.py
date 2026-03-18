"""Authentication endpoints tests."""

import logging
from unittest.mock import patch

import pytest

from app.core.security import get_password_hash


@pytest.mark.unit
@pytest.mark.auth
def test_register_user_success(client):
    """Test POST /auth/register creates user and returns token."""
    data = {"email": "new@example.com", "password": "SecurePass123", "name": "New User"}
    response = client.post("/auth/register", json=data)
    assert response.status_code == 201
    body = response.json()
    assert "token" in body
    assert body["user"]["email"] == "new@example.com"
    assert body["user"]["role"] == "user"


@pytest.mark.unit
@pytest.mark.auth
def test_register_user_duplicate_email(client, db_session):
    """Test POST /auth/register with duplicate email returns 400."""
    from tests.conftest import create_test_user

    create_test_user(db_session, email="dup@example.com", password=get_password_hash("pass1234"))
    data = {"email": "dup@example.com", "password": "AnotherPass1", "name": "Dup User"}
    response = client.post("/auth/register", json=data)
    assert response.status_code == 400
    assert response.json()["detail"] == "Something went wrong"


@pytest.mark.unit
@pytest.mark.auth
def test_register_user_missing_fields(client):
    """Test POST /auth/register with missing fields returns 422."""
    response = client.post("/auth/register", json={"email": "x@example.com"})
    assert response.status_code == 422


@pytest.mark.unit
@pytest.mark.auth
def test_login_user_success(client, db_session):
    """Test POST /auth/login with correct credentials returns token."""
    from tests.conftest import create_test_user

    create_test_user(
        db_session, email="login@example.com", password=get_password_hash("MyPassword1")
    )
    response = client.post(
        "/auth/login", json={"email": "login@example.com", "password": "MyPassword1"}
    )
    assert response.status_code == 200
    body = response.json()
    assert "token" in body
    assert body["user"]["email"] == "login@example.com"


@pytest.mark.unit
@pytest.mark.auth
def test_login_user_wrong_password(client, db_session):
    """Test POST /auth/login with wrong password returns 401."""
    from tests.conftest import create_test_user

    create_test_user(
        db_session, email="wrongpw@example.com", password=get_password_hash("RealPass1")
    )
    response = client.post(
        "/auth/login", json={"email": "wrongpw@example.com", "password": "WrongPass1"}
    )
    assert response.status_code == 401
    assert response.json() == {"detail": {"error": "Authentication failed"}}


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
    """Verify that verify_password_mock is called when the email does not exist."""
    with patch("app.api.v1.auth.verify_password_mock") as mock_verify:
        response = client.post(
            "/auth/login",
            json={"email": "nonexistent@example.com", "password": "somepassword"},
        )
    assert response.status_code == 401
    mock_verify.assert_called_once_with("somepassword")


@pytest.mark.unit
@pytest.mark.auth
def test_login_missing_fields(client):
    """Test POST /auth/login with missing fields returns 422."""
    response = client.post("/auth/login", json={"email": "x@example.com"})
    assert response.status_code == 422


@pytest.mark.unit
@pytest.mark.auth
def test_register_exception_logging(client, caplog):
    """Test that unexpected exceptions during registration are logged, not printed."""
    with patch("app.api.v1.auth.get_password_hash", side_effect=RuntimeError("boom")):
        with caplog.at_level(logging.ERROR, logger="app.api.v1.auth"):
            response = client.post(
                "/auth/register",
                json={"email": "exc@example.com", "password": "Pwd12345", "name": "Exc"},
            )
    assert response.status_code == 500
    assert "Registration failed" in caplog.text


@pytest.mark.unit
@pytest.mark.auth
def test_login_exception_logging(client, caplog):
    """Test that unexpected exceptions during login are logged, not printed."""
    with patch("app.api.v1.auth.verify_password_mock", side_effect=RuntimeError("boom")):
        with caplog.at_level(logging.ERROR, logger="app.api.v1.auth"):
            response = client.post(
                "/auth/login",
                json={"email": "exc2@example.com", "password": "Pwd12345"},
            )
    assert response.status_code == 500
    assert "Login failed" in caplog.text
