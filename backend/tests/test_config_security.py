
import pytest
from pydantic import ValidationError

from app.config import Settings


def test_jwt_secret_required(monkeypatch, tmp_path):
    """Test that the application fails to start if JWT_SECRET is missing."""
    # Unset JWT_SECRET to verify it's required
    monkeypatch.delenv("JWT_SECRET", raising=False)

    # Ensure other required fields are present so we specifically test JWT_SECRET
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")

    # Create an empty .env file so Settings doesn't load the real one
    empty_env = tmp_path / ".env"
    empty_env.write_text("DATABASE_URL=sqlite:///:memory:\n")

    # Override the env_file to avoid loading real .env with JWT_SECRET
    with pytest.raises(ValidationError) as exc_info:
        Settings(_env_file=str(empty_env))

    errors = exc_info.value.errors()
    jwt_secret_error = next((e for e in errors if "JWT_SECRET" in str(e["loc"])), None)

    assert jwt_secret_error is not None, "JWT_SECRET should be a required field"
    assert jwt_secret_error["type"] == "missing", "JWT_SECRET should be missing"


def test_jwt_secret_configured(monkeypatch):
    """Test that the application starts if JWT_SECRET is provided."""
    monkeypatch.setenv("JWT_SECRET", "test-secret-value")
    monkeypatch.setenv("DATABASE_URL", "sqlite:///:memory:")

    # Ensure invalid values from environment are overridden
    monkeypatch.setenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

    settings = Settings()
    assert settings.JWT_SECRET == "test-secret-value"
