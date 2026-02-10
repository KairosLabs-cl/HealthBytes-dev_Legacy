import os

import pytest
from app.config import Settings
from pydantic import ValidationError


def test_jwt_secret_required(monkeypatch):
    """Test that the application fails to start if JWT_SECRET is missing."""
    # Unset JWT_SECRET to verify it's required
    monkeypatch.delenv("JWT_SECRET", raising=False)

    # Ensure other required fields are present so we specifically test JWT_SECRET
    monkeypatch.setenv("***REDACTED_DATABASE_URL***

    # We must ensure other env vars that might be causing issues (like the quoted ones) are clean or set correctly
    # But monkeypatch handles the env for this test.

    with pytest.raises(ValidationError) as exc_info:
        Settings()

    errors = exc_info.value.errors()
    jwt_secret_error = next((e for e in errors if "JWT_SECRET" in str(e["loc"])), None)

    assert jwt_secret_error is not None, "JWT_SECRET should be a required field"
    assert jwt_secret_error["type"] == "missing", "JWT_SECRET should be missing"


def test_jwt_secret_configured(monkeypatch):
    """Test that the application starts if JWT_SECRET is provided."""
    monkeypatch.setenv("JWT_SECRET", "test-secret-value")
    monkeypatch.setenv("***REDACTED_DATABASE_URL***

    # Ensure invalid values from environment are overridden
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

    settings = Settings()
    assert settings.JWT_SECRET == "test-secret-value"
