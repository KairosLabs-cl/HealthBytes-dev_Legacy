"""
Integration tests for checkout flow with address and payment method.
Covers the address_id + payment_method fields added to orders.
"""

import pytest
from app.db.schemas import Product
from app.db.models.address import Address
from app.main import app
from app.middleware.auth import get_current_user
from tests.conftest import create_test_user


@pytest.fixture
def checkout_user(db_session):
    """User with clerk_id so address ownership check works."""
    return create_test_user(
        db_session,
        email="checkout_flow@test.com",
        role="customer",
        name="Checkout User",
        clerk_id="clerk_checkout_test_123",
    )


@pytest.fixture
def checkout_product(db_session):
    """Product for checkout flow tests."""
    p = Product(name="Producto Checkout", price=10000.0, stock=50)
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    return p


@pytest.fixture
def user_address(db_session, checkout_user):
    """Active address belonging to checkout_user."""
    addr = Address(
        user_id=checkout_user.id,
        label="Casa",
        street="Av. Providencia",
        street_number="1234",
        city="Santiago",
        region="Región Metropolitana",
        postal_code="7500000",
        country="CL",
        is_default=True,
        is_active=True,
    )
    db_session.add(addr)
    db_session.commit()
    db_session.refresh(addr)
    return addr


def _order_payload(product, **extra):
    return {
        "items": [{"productId": product.id, "quantity": 1, "price": int(product.price)}],
        **extra,
    }


class TestCheckoutWithAddress:
    """Order creation includes address_id and payment_method."""

    def test_create_order_with_address_and_payment(
        self, client, db_session, checkout_user, checkout_product, user_address
    ):
        """Fields are persisted and returned in the response."""
        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            response = client.post(
                "/orders",
                json=_order_payload(
                    checkout_product,
                    addressId=user_address.id,
                    paymentMethod="mercado_pago",
                ),
            )
            assert response.status_code == 201
            data = response.json()
            assert data["address_id"] == user_address.id
            assert data["payment_method"] == "mercado_pago"
            assert data["status"] == "pending"
            assert "address_id" in data
            assert "payment_method" in data
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_without_address_is_valid(
        self, client, db_session, checkout_user, checkout_product
    ):
        """address_id is optional — order should succeed without it."""
        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            response = client.post(
                "/orders",
                json=_order_payload(checkout_product, paymentMethod="mercado_pago"),
            )
            assert response.status_code == 201
            data = response.json()
            assert data["address_id"] is None
            assert data["payment_method"] == "mercado_pago"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_defaults_to_mercado_pago(
        self, client, db_session, checkout_user, checkout_product
    ):
        """When paymentMethod is omitted, defaults to mercado_pago."""
        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            response = client.post(
                "/orders",
                json=_order_payload(checkout_product),
            )
            assert response.status_code == 201
            assert response.json()["payment_method"] == "mercado_pago"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_address_not_owned_returns_404(
        self, client, db_session, checkout_user, checkout_product
    ):
        """Address belonging to another user must return 404."""
        other_addr = Address(
            user_id=9999,  # non-existent user → ownership check must reject
            street="Calle Ajena",
            street_number="99",
            city="Valparaíso",
            region="Región de Valparaíso",
            postal_code="2340000",
            country="CL",
            is_active=True,
        )
        db_session.add(other_addr)
        db_session.commit()
        db_session.refresh(other_addr)

        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            response = client.post(
                "/orders",
                json=_order_payload(checkout_product, addressId=other_addr.id),
            )
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_inactive_address_returns_404(
        self, client, db_session, checkout_user, checkout_product
    ):
        """Inactive address (soft-deleted) must return 404."""
        inactive_addr = Address(
            user_id=checkout_user.id,
            street="Calle Inactiva",
            street_number="1",
            city="Santiago",
            region="Región Metropolitana",
            postal_code="7500000",
            country="CL",
            is_active=False,
        )
        db_session.add(inactive_addr)
        db_session.commit()
        db_session.refresh(inactive_addr)

        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            response = client.post(
                "/orders",
                json=_order_payload(checkout_product, addressId=inactive_addr.id),
            )
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_invalid_payment_method_returns_422(
        self, client, db_session, checkout_user, checkout_product
    ):
        """Unsupported payment method must return 422."""
        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            response = client.post(
                "/orders",
                json=_order_payload(checkout_product, paymentMethod="stripe"),
            )
            assert response.status_code == 422
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_create_order_venti_payment_accepted(
        self, client, db_session, checkout_user, checkout_product
    ):
        """venti is a valid payment method (even if not yet active in UI)."""
        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            response = client.post(
                "/orders",
                json=_order_payload(checkout_product, paymentMethod="venti"),
            )
            assert response.status_code == 201
            assert response.json()["payment_method"] == "venti"
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_order_returns_address_and_payment_fields(
        self, client, db_session, checkout_user, checkout_product, user_address
    ):
        """GET /orders/{id} response includes address_id and payment_method."""
        app.dependency_overrides[get_current_user] = lambda: checkout_user
        try:
            create_resp = client.post(
                "/orders",
                json=_order_payload(
                    checkout_product,
                    addressId=user_address.id,
                    paymentMethod="mercado_pago",
                ),
            )
            assert create_resp.status_code == 201
            order_id = create_resp.json()["id"]

            get_resp = client.get(f"/orders/{order_id}")
            assert get_resp.status_code == 200
            data = get_resp.json()
            assert data["address_id"] == user_address.id
            assert data["payment_method"] == "mercado_pago"
        finally:
            app.dependency_overrides.pop(get_current_user, None)
