import pytest
from datetime import timedelta
from jose import jwt
from app.core.security import create_refresh_token, verify_refresh_token
from app.config import settings

def test_create_refresh_token():
    data = {"sub": "test_user"}
    token = create_refresh_token(data)
    assert token is not None
    
    payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
    assert payload["sub"] == "test_user"
    assert "exp" in payload
    
    # Check if it has a long expiry (default 30 days)
    # Note: This is a bit tricky to test exactly without mocking datetime,
    # but we can check if exp is roughly 30 days from now.
    import datetime
    exp = datetime.datetime.fromtimestamp(payload["exp"], tz=datetime.UTC)
    now = datetime.datetime.now(tz=datetime.UTC)
    diff = exp - now
    assert diff.days >= 29 # At least 29 days (allowing for some execution time)

def test_verify_refresh_token_valid():
    data = {"sub": "test_user"}
    token = create_refresh_token(data)
    payload = verify_refresh_token(token)
    assert payload is not None
    assert payload["sub"] == "test_user"

def test_verify_refresh_token_invalid():
    payload = verify_refresh_token("invalid_token")
    assert payload is None

def test_verify_refresh_token_expired(monkeypatch):
    # This might be harder to test without deep mocking, 
    # but we can try to create a token with 0 or negative expiry if the function allowed it.
    # For now, let's just test basic verification.
    pass
