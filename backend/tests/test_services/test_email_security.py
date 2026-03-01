from decimal import Decimal

from app.config import Settings
from app.services.email_service import EmailService, OrderEmailData, OrderItemData


def test_html_injection():
    settings = Settings(RESEND_API_KEY="test")
    service = EmailService(settings=settings)

    malicious_name = "<script>alert('xss')</script>"
    malicious_product = "<img src=x onerror=alert('xss')>"

    data = OrderEmailData(
        order_id=1,
        customer_name=malicious_name,
        customer_email="test@test.com",
        items=[OrderItemData(product_name=malicious_product, quantity=1, price=Decimal("100.0"))],
        total=Decimal("100.0"),
    )

    html = service.render_order_confirmation(data)

    assert "<script>" not in html, "Customer name is not escaped"
    assert "<img" not in html, "Product name is not escaped"


if __name__ == "__main__":
    test_html_injection()
