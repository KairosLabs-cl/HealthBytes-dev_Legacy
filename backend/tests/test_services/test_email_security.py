"""Tests to verify HTML injection is prevented in email templates."""

from decimal import Decimal

import pytest

from app.config import Settings
from app.services.email_service import EmailService, OrderEmailData, OrderItemData


@pytest.fixture
def email_service():
    settings = Settings(RESEND_API_KEY="test-key")
    return EmailService(settings=settings)


def test_order_confirmation_escapes_customer_name(email_service):
    data = OrderEmailData(
        order_id=1,
        customer_name="<script>alert('xss')</script>",
        customer_email="test@test.com",
        items=[OrderItemData(product_name="Pan sin gluten", quantity=1, price=Decimal("100.0"))],
        total=Decimal("100.0"),
    )
    rendered = email_service.render_order_confirmation(data)
    assert "<script>" not in rendered
    assert "&lt;script&gt;" in rendered


def test_order_confirmation_escapes_product_name(email_service):
    data = OrderEmailData(
        order_id=1,
        customer_name="Cliente",
        customer_email="test@test.com",
        items=[
            OrderItemData(
                product_name="<img src=x onerror=alert('xss')>",
                quantity=1,
                price=Decimal("100.0"),
            )
        ],
        total=Decimal("100.0"),
    )
    rendered = email_service.render_order_confirmation(data)
    assert "<img" not in rendered
    assert "&lt;img" in rendered


def test_payment_success_escapes_customer_name(email_service):
    data = OrderEmailData(
        order_id=2,
        customer_name='"><svg onload=alert(1)>',
        customer_email="test@test.com",
        items=[OrderItemData(product_name="Producto", quantity=1, price=Decimal("500.0"))],
        total=Decimal("500.0"),
    )
    rendered = email_service.render_payment_success(data)
    assert "<svg" not in rendered


def test_order_shipped_escapes_customer_name(email_service):
    data = OrderEmailData(
        order_id=3,
        customer_name="<b>Bold</b>",
        customer_email="test@test.com",
        items=[OrderItemData(product_name="Producto", quantity=1, price=Decimal("200.0"))],
        total=Decimal("200.0"),
    )
    rendered = email_service.render_order_shipped(data)
    assert "<b>Bold</b>" not in rendered
    assert "&lt;b&gt;" in rendered
