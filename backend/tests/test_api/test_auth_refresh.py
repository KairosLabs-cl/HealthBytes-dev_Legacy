"""Auth refresh endpoint tests."""

import pytest
from app.core.security import get_password_hash

@pytest.mark.unit
@pytest.mark.auth
def test_refresh_token_success(client, db_session):
    """Test POST /auth/refresh returns new tokens."""
    # 1. Register a user to get a refresh token
    data = {"email": "refresh@example.com", "password": "SecurePass123", "name": "Refresh User"}
    reg_response = client.post("/auth/register", json=data)
    assert reg_response.status_code == 201
    refresh_token = reg_response.json()["refresh_token"]
    old_access_token = reg_response.json()["token"]

    # 2. Call refresh endpoint
    refresh_response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert refresh_response.status_code == 200
    
    body = refresh_response.json()
    assert "token" in body
    assert "refresh_token" in body
    assert body["token"] != old_access_token
    assert body["refresh_token"] != refresh_token
    assert body["user"]["email"] == "refresh@example.com"

@pytest.mark.unit
@pytest.mark.auth
def test_refresh_token_invalid(client):
    """Test POST /auth/refresh with invalid token returns 401."""
    response = client.post("/auth/refresh", json={"refresh_token": "invalid_token"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid refresh token"

@pytest.mark.unit
@pytest.mark.auth
def test_refresh_token_expired(client, db_session, monkeypatch):
    """Test POST /auth/refresh with expired token returns 401."""
    # 1. Register a user
    data = {"email": "expired@example.com", "password": "SecurePass123", "name": "Expired User"}
    reg_response = client.post("/auth/register", json=data)
    refresh_token = reg_response.json()["refresh_token"]

    # 2. Mock token verification to fail (simulate expiration/invalidity)
    from app.services import auth_service
    async def mock_refresh_access_token(db, token):
        return None
    
    monkeypatch.setattr("app.services.auth_service.refresh_access_token", mock_refresh_access_token)

    response = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert response.status_code == 401
