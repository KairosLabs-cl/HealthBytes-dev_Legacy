"""
E2E test — Email service: graceful degradation when ***REDACTED_RESEND_KEY***
"""

import pytest
from unittest.mock import patch, AsyncMock


@pytest.mark.asyncio
async def test_send_email_does_not_raise_when_api_key_missing(monkeypatch):
    """
    When ***REDACTED_RESEND_KEY***
    email_service.send_email must log a warning instead of raising.
    This prevents a missing env var from crashing the order flow.
    """
    monkeypatch.setattr("app.config.settings.***REDACTED_RESEND_KEY***
    monkeypatch.setattr("app.config.settings.EMAIL_FROM_ADDRESS", "test@test.com")
    monkeypatch.setattr("app.config.settings.FRONTEND_URL", "https://test.com")
    from app.config import settings
    from app.services.email_service import EmailService

    service = EmailService(settings)
    result = await service.send_email(
        to="test@example.com",
        subject="Test order confirmation",
        html="<p>Your order has been confirmed.</p>",
    )
    assert result is None


@pytest.mark.asyncio
async def test_send_email_calls_resend_when_key_present(monkeypatch):
    """When ***REDACTED_RESEND_KEY***
    monkeypatch.setattr("app.config.settings.***REDACTED_RESEND_KEY***
    monkeypatch.setattr("app.config.settings.EMAIL_FROM_ADDRESS", "test@test.com")
    monkeypatch.setattr("app.config.settings.FRONTEND_URL", "https://test.com")
    with patch("resend.Emails.send") as mock_send:
        mock_send.return_value = {"id": "email_123"}
        from app.config import settings
        from app.services.email_service import EmailService

        service = EmailService(settings)
        result = await service.send_email(
            to="customer@example.com",
            subject="Order confirmed",
            html="<p>Thanks for your order!</p>",
        )
        mock_send.assert_called_once()
        call_kwargs = mock_send.call_args[0][0]
        assert call_kwargs["to"] == ["customer@example.com"]
        assert call_kwargs["subject"] == "Order confirmed"
        assert result == {"id": "email_123"}
