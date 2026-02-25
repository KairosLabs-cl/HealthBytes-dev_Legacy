"""
Tests for email service.
Covers template rendering, send logic, and build_order_email_data helper.
"""

from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest

from app.config import Settings
from app.services.email_service import (
    EmailService,
    OrderEmailData,
    OrderItemData,
    build_order_email_data,
)
from tests.conftest import MockAsyncSession


@pytest.fixture
def email_settings():
    """Mock settings with Resend API key."""
    settings = MagicMock(spec=Settings)
    settings.***REDACTED_RESEND_KEY***
    settings.EMAIL_FROM_ADDRESS = "Test <test@test.com>"
    settings.FRONTEND_URL = "http://localhost:8081"
    settings.ENVIRONMENT = "dev"
    return settings


@pytest.fixture
def email_settings_no_key():
    """Mock settings without Resend API key (dev mode)."""
    settings = MagicMock(spec=Settings)
    settings.***REDACTED_RESEND_KEY***
    settings.EMAIL_FROM_ADDRESS = "Test <test@test.com>"
    settings.FRONTEND_URL = "http://localhost:8081"
    settings.ENVIRONMENT = "dev"
    return settings


@pytest.fixture
def sample_order_data():
    """Sample order email data."""
    return OrderEmailData(
        order_id=42,
        customer_name="Juan",
        customer_email="juan@test.com",
        items=[
            OrderItemData(product_name="Galletas Sin Gluten", quantity=2, price=Decimal("3500")),
            OrderItemData(product_name="Leche de Almendras", quantity=1, price=Decimal("2800")),
        ],
        total=Decimal("9800"),
        currency="CLP",
    )


class TestEmailServiceInit:
    """Tests for EmailService initialization."""

    def test_init_with_api_key(self, email_settings):
        """Test service is enabled with API key."""
        svc = EmailService(email_settings)
        assert svc._enabled is True
        assert svc.from_address == "Test <test@test.com>"

    def test_init_without_api_key(self, email_settings_no_key):
        """Test service is disabled without API key."""
        svc = EmailService(email_settings_no_key)
        assert svc._enabled is False


class TestFormatPrice:
    """Tests for price formatting."""

    def test_format_clp(self, email_settings):
        """Test CLP price formatting with dots."""
        svc = EmailService(email_settings)
        assert svc._format_price(Decimal("3500"), "CLP") == "$3.500"
        assert svc._format_price(Decimal("1000000"), "CLP") == "$1.000.000"

    def test_format_usd(self, email_settings):
        """Test USD price formatting."""
        svc = EmailService(email_settings)
        assert svc._format_price(Decimal("29.99"), "USD") == "$29.99 USD"


class TestTemplateRendering:
    """Tests for email HTML template rendering."""

    def test_order_confirmation_html(self, email_settings, sample_order_data):
        """Test order confirmation template has key elements."""
        svc = EmailService(email_settings)
        html = svc.render_order_confirmation(sample_order_data)

        assert "Orden #42" in html
        assert "Juan" in html
        assert "Galletas Sin Gluten" in html
        assert "Leche de Almendras" in html
        assert "$9.800" in html
        assert "Pendiente de pago" in html
        assert "HealthBytes" in html

    def test_payment_success_html(self, email_settings, sample_order_data):
        """Test payment success template has key elements."""
        svc = EmailService(email_settings)
        html = svc.render_payment_success(sample_order_data)

        assert "Orden #42" in html
        assert "Juan" in html
        assert "Pago confirmado" in html
        assert "$9.800" in html
        assert "preparando tu pedido" in html

    def test_order_shipped_html(self, email_settings, sample_order_data):
        """Test order shipped template has key elements."""
        svc = EmailService(email_settings)
        html = svc.render_order_shipped(sample_order_data)

        assert "Orden #42" in html
        assert "Juan" in html
        assert "en camino" in html
        assert "Enviado" in html
        assert "Ver mi pedido" in html
        assert "orders/42" in html

    def test_template_with_no_name(self, email_settings):
        """Test template falls back to 'Cliente' when no name."""
        svc = EmailService(email_settings)
        data = OrderEmailData(
            order_id=1,
            customer_name="",
            customer_email="test@test.com",
            items=[],
            total=Decimal("0"),
        )
        html = svc.render_order_confirmation(data)
        assert "Cliente" in html


class TestSendEmail:
    """Tests for email sending logic."""

    @pytest.mark.asyncio
    async def test_send_email_disabled(self, email_settings_no_key, sample_order_data):
        """Test email is not sent when disabled (no API key)."""
        svc = EmailService(email_settings_no_key)
        result = await svc.send_email("test@test.com", "Subject", "<p>Test</p>")
        assert result is None

    @pytest.mark.asyncio
    @patch("app.services.email_service.resend.Emails.send")
    async def test_send_email_success(self, mock_send, email_settings, sample_order_data):
        """Test successful email send."""
        mock_send.return_value = {"id": "email_123"}
        svc = EmailService(email_settings)
        result = await svc.send_email("test@test.com", "Subject", "<p>Test</p>")

        assert result == {"id": "email_123"}
        mock_send.assert_called_once()
        call_args = mock_send.call_args[0][0]
        assert call_args["to"] == ["test@test.com"]
        assert call_args["subject"] == "Subject"

    @pytest.mark.asyncio
    @patch("app.services.email_service.resend.Emails.send")
    async def test_send_email_failure(self, mock_send, email_settings):
        """Test email send failure is handled gracefully."""
        mock_send.side_effect = Exception("API error")
        svc = EmailService(email_settings)
        result = await svc.send_email("test@test.com", "Subject", "<p>Test</p>")
        assert result is None

    @pytest.mark.asyncio
    @patch("app.services.email_service.resend.Emails.send")
    async def test_send_order_confirmation(self, mock_send, email_settings, sample_order_data):
        """Test send_order_confirmation calls send_email with correct subject."""
        mock_send.return_value = {"id": "email_456"}
        svc = EmailService(email_settings)
        result = await svc.send_order_confirmation(sample_order_data)

        assert result == {"id": "email_456"}
        call_args = mock_send.call_args[0][0]
        assert "juan@test.com" in call_args["to"]
        assert "Orden #42 recibida" in call_args["subject"]

    @pytest.mark.asyncio
    @patch("app.services.email_service.resend.Emails.send")
    async def test_send_payment_success(self, mock_send, email_settings, sample_order_data):
        """Test send_payment_success calls send_email with correct subject."""
        mock_send.return_value = {"id": "email_789"}
        svc = EmailService(email_settings)
        result = await svc.send_payment_success(sample_order_data)

        assert result == {"id": "email_789"}
        call_args = mock_send.call_args[0][0]
        assert "Pago confirmado" in call_args["subject"]

    @pytest.mark.asyncio
    @patch("app.services.email_service.resend.Emails.send")
    async def test_send_order_shipped(self, mock_send, email_settings, sample_order_data):
        """Test send_order_shipped calls send_email with correct subject."""
        mock_send.return_value = {"id": "email_abc"}
        svc = EmailService(email_settings)
        result = await svc.send_order_shipped(sample_order_data)

        assert result == {"id": "email_abc"}
        call_args = mock_send.call_args[0][0]
        assert "en camino" in call_args["subject"]


class TestBuildOrderEmailData:
    """Tests for the build_order_email_data helper."""

    @pytest.mark.asyncio
    async def test_build_data_success(self, db_session):
        """Test building email data from a real order."""
        from app.db.schemas import Order, OrderItem, Product, User

        # Create test data
        user = User(email="builder@test.com", name="Builder", role="customer", password="hashed")
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        product = Product(name="Test Product", description="Desc", price=5000.0, stock=10)
        db_session.add(product)
        db_session.commit()
        db_session.refresh(product)

        order = Order(user_id=user.id, status="New", total=10000.0)
        db_session.add(order)
        db_session.commit()
        db_session.refresh(order)

        item = OrderItem(order_id=order.id, product_id=product.id, quantity=2, price=5000.0)
        db_session.add(item)
        db_session.commit()

        async_db = MockAsyncSession(db_session)
        data = await build_order_email_data(async_db, order.id)

        assert data is not None
        assert data.order_id == order.id
        assert data.customer_email == "builder@test.com"
        assert data.customer_name == "Builder"
        assert len(data.items) == 1
        assert data.items[0].product_name == "Test Product"
        assert data.items[0].quantity == 2
        assert data.total == Decimal("10000.0")

    @pytest.mark.asyncio
    async def test_build_data_order_not_found(self, db_session):
        """Test returns None for non-existent order."""
        async_db = MockAsyncSession(db_session)
        data = await build_order_email_data(async_db, 99999)
        assert data is None

    @pytest.mark.asyncio
    async def test_build_data_user_not_found(self, db_session):
        """Test returns None when user doesn't exist."""
        from app.db.schemas import Order

        order = Order(user_id=99999, status="New", total=0.0)
        db_session.add(order)
        db_session.commit()
        db_session.refresh(order)

        async_db = MockAsyncSession(db_session)
        data = await build_order_email_data(async_db, order.id)
        assert data is None

    @pytest.mark.asyncio
    async def test_build_data_fallback_name(self, db_session):
        """Test uses email prefix when user has no name."""
        from app.db.schemas import Order, User

        user = User(email="noname@test.com", name=None, role="customer", password="hashed")
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)

        order = Order(user_id=user.id, status="New", total=0.0)
        db_session.add(order)
        db_session.commit()
        db_session.refresh(order)

        async_db = MockAsyncSession(db_session)
        data = await build_order_email_data(async_db, order.id)

        assert data is not None
        assert data.customer_name == "noname"
