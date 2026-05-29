"""Tests for legacy Pydantic schemas under app.db.models.

These modules are still imported by coverage but had no direct tests. Keep
coverage focused on their public validation and serialization contracts.
"""

from datetime import datetime

import pytest
from pydantic import ValidationError

from app.db.models.order import (
    OrderCreate,
    OrderItemCreate,
    OrderItemResponse,
    OrderResponse,
    OrderUpdate,
)
from app.db.models.product import ProductCreate, ProductResponse, ProductUpdate
from app.db.models.user import Token, UserCreate, UserLogin, UserResponse, UserUpdate, UserWithToken


class TestLegacyOrderSchemas:
    def test_order_create_accepts_valid_items(self):
        order = OrderCreate(
            order={"notes": "leave at reception"},
            items=[OrderItemCreate(productId=1, quantity=2, price=1990.0)],
        )

        assert order.order == {"notes": "leave at reception"}
        assert order.items[0].productId == 1

    @pytest.mark.parametrize(
        ("quantity", "price"),
        [
            (0, 1990.0),
            (1, 0),
        ],
    )
    def test_order_item_rejects_invalid_quantity_or_price(self, quantity, price):
        with pytest.raises(ValidationError):
            OrderItemCreate(productId=1, quantity=quantity, price=price)

    def test_order_response_supports_nested_items(self):
        created_at = datetime(2026, 5, 29, 12, 0, 0)
        item = OrderItemResponse(id=10, order_id=20, product_id=30, quantity=3, price=4500.0)
        response = OrderResponse(
            id=20,
            user_id=5,
            created_at=created_at,
            status="pending",
            items=[item],
        )

        assert response.created_at == created_at
        assert response.items == [item]

    def test_order_update_limits_status_length(self):
        assert OrderUpdate(status="paid").status == "paid"
        with pytest.raises(ValidationError):
            OrderUpdate(status="x" * 51)


class TestLegacyProductSchemas:
    def test_product_create_accepts_optional_fields(self):
        product = ProductCreate(
            name="Protein Bar",
            description="Gluten free snack",
            image="https://example.com/bar.png",
            price=2500.0,
            vendor_name="HealthBytes",
            nutritional_info="10g protein",
        )

        assert product.name == "Protein Bar"
        assert product.nutritional_info == "10g protein"

    @pytest.mark.parametrize(
        "payload",
        [
            {"name": "", "price": 2500.0},
            {"name": "Protein Bar", "price": 0},
            {"name": "Protein Bar", "price": 2500.0, "image": "x" * 256},
        ],
    )
    def test_product_create_rejects_invalid_fields(self, payload):
        with pytest.raises(ValidationError):
            ProductCreate(**payload)

    def test_product_update_allows_partial_updates(self):
        update = ProductUpdate(price=1990.0, nutritional_info="reformulated")

        assert update.name is None
        assert update.price == 1990.0
        assert update.nutritional_info == "reformulated"

    def test_product_response_uses_from_attributes_config(self):
        response = ProductResponse(id=1, name="Bread", price=3990.0)

        assert response.id == 1
        assert response.model_config["from_attributes"] is True


class TestLegacyUserSchemas:
    def test_user_create_accepts_valid_registration_payload(self):
        user = UserCreate(
            email="person@example.com",
            password="short_pwd_1234",
            name="Person",
            address="Main Street 123",
        )

        assert user.email == "person@example.com"
        assert user.address == "Main Street 123"

    @pytest.mark.parametrize(
        "payload",
        [
            {"email": "invalid", "password": "secret"},
            {"email": "person@example.com", "password": ""},
            {"email": "person@example.com", "password": "secret", "name": "x" * 256},
        ],
    )
    def test_user_create_rejects_invalid_registration_payloads(self, payload):
        with pytest.raises(ValidationError):
            UserCreate(**payload)

    def test_user_login_requires_email_and_password(self):
        login = UserLogin(email="person@example.com", password="secret")

        assert login.email == "person@example.com"
        assert login.password == "secret"

    def test_user_update_allows_partial_profile_changes(self):
        update = UserUpdate(name="New Name")

        assert update.name == "New Name"
        assert update.password is None

    def test_token_response_wraps_user_response(self):
        user = UserResponse(
            id=1,
            email="person@example.com",
            role="user",
            name=None,
            address=None,
        )
        response = UserWithToken(user=user, token="access-token")

        assert Token(token="access-token").token == "access-token"
        assert response.user == user
        assert response.token == "access-token"
        assert user.model_config["from_attributes"] is True
