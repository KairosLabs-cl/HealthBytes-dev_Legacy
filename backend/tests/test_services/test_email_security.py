"""
Security tests for email service.
Checks for HTML injection vulnerabilities in email templates.
"""

from decimal import Decimal
from unittest.mock import MagicMock

import pytest

from app.config import Settings
from app.services.email_service import EmailService, OrderEmailData, OrderItemData


@pytest.fixture
def email_settings():
    """Mock settings."""
    settings = MagicMock(spec=Settings)
    settings.RESEND_API_KEY = "re_test_123"
    settings.EMAIL_FROM_ADDRESS = "Test <test@test.com>"
    settings.FRONTEND_URL = "http://localhost:8081"
    settings.ENVIRONMENT = "dev"
    return settings


class TestEmailSecurity:
    """Security tests for EmailService."""

    def test_html_injection_in_customer_name(self, email_settings):
        """Test that HTML in customer name is escaped."""
        svc = EmailService(email_settings)

        # Malicious input
        malicious_name = "<script>alert('xss')</script>Juan"

        data = OrderEmailData(
            order_id=1,
            customer_name=malicious_name,
            customer_email="test@test.com",
            items=[],
            total=Decimal("0"),
        )

        # Render template
        html = svc.render_order_confirmation(data)

        # Verify malicious tag is NOT present as raw HTML
        assert "<script>" not in html
        assert "&lt;script&gt;" in html

        # Verify rendered in payment success too
        html_payment = svc.render_payment_success(data)
        assert "<script>" not in html_payment
        assert "&lt;script&gt;" in html_payment

        # Verify rendered in order shipped too
        html_shipped = svc.render_order_shipped(data)
        assert "<script>" not in html_shipped
        assert "&lt;script&gt;" in html_shipped

    def test_html_injection_in_product_name(self, email_settings):
        """Test that HTML in product name is escaped."""
        svc = EmailService(email_settings)

        malicious_product = "<b>Malicious Product</b>"

        data = OrderEmailData(
            order_id=1,
            customer_name="Juan",
            customer_email="test@test.com",
            items=[
                OrderItemData(
                    product_name=malicious_product,
                    quantity=1,
                    price=Decimal("100")
                )
            ],
            total=Decimal("100"),
        )

        html = svc.render_order_confirmation(data)

        # Verify malicious tag is NOT present as raw HTML
        assert "<b>" not in html
        assert "&lt;b&gt;" in html
