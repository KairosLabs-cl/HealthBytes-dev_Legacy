from app.db.database import _redact_url_credentials


def test_redact_url_credentials_removes_redis_password() -> None:
    redacted = _redact_url_credentials("redis://:secret-password@redis:6379/0")

    assert redacted == "redis://redis:6379/0"
    assert "secret-password" not in redacted


def test_redact_url_credentials_preserves_url_without_credentials() -> None:
    url = "redis://redis:6379/0"

    assert _redact_url_credentials(url) == url
