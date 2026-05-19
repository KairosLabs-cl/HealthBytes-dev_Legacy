"""
Tests for favorites API endpoints.
Covers add, remove, list, check, and get IDs.
"""

from datetime import datetime
from unittest.mock import AsyncMock, patch

import pytest

from app.db.schemas import Product
from app.main import app
from app.middleware.auth import get_current_user
from tests.conftest import create_test_user


@pytest.fixture
def customer_user(db_session):
    """Create a customer user for favorites tests."""
    return create_test_user(
        db_session, email="fav_customer@test.com", role="customer", name="Fav Customer"
    )


@pytest.fixture
def product(db_session):
    """Create a test product."""
    p = Product(name="Fav Product", description="For favorites", price=1000.0, stock=10)
    db_session.add(p)
    db_session.commit()
    db_session.refresh(p)
    return p


class TestAddFavorite:
    """Tests for POST /favorites/"""

    @patch("app.api.v1.favorites.favorite_service")
    def test_add_favorite_success(self, mock_svc, client, db_session, customer_user, product):
        """Test adding a product to favorites."""
        mock_svc.add_favorite = AsyncMock(
            return_value={
                "id": 1,
                "user_id": customer_user.id,
                "product_id": product.id,
                "created_at": datetime.now(),
            }
        )
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.post("/favorites", json={"product_id": product.id})
            assert response.status_code == 201
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch("app.api.v1.favorites.favorite_service")
    def test_add_favorite_duplicate(self, mock_svc, client, db_session, customer_user, product):
        """Test adding duplicate favorite returns 409."""
        mock_svc.add_favorite = AsyncMock(side_effect=ValueError("Already favorited"))
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.post("/favorites", json={"product_id": product.id})
            assert response.status_code == 409
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_add_favorite_requires_auth(self, client):
        """Test adding favorite requires authentication."""
        response = client.post("/favorites", json={"product_id": 1})
        assert response.status_code == 401


class TestRemoveFavorite:
    """Tests for DELETE /favorites/{product_id}"""

    @patch("app.api.v1.favorites.favorite_service")
    def test_remove_favorite_success(self, mock_svc, client, db_session, customer_user, product):
        """Test removing a favorite."""
        mock_svc.remove_favorite = AsyncMock(return_value=True)
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.delete(f"/favorites/{product.id}")
            assert response.status_code == 204
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch("app.api.v1.favorites.favorite_service")
    def test_remove_favorite_not_found(self, mock_svc, client, db_session, customer_user):
        """Test removing non-existent favorite returns 404."""
        mock_svc.remove_favorite = AsyncMock(return_value=False)
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.delete("/favorites/99999")
            assert response.status_code == 404
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestGetFavorites:
    """Tests for GET /favorites/"""

    @patch("app.api.v1.favorites.favorite_service")
    def test_get_favorites_success(self, mock_svc, client, db_session, customer_user):
        """Test getting user favorites."""
        mock_svc.get_user_favorites = AsyncMock(return_value=[])
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get("/favorites")
            assert response.status_code == 200
            assert isinstance(response.json(), list)
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_favorites_requires_auth(self, client):
        """Test getting favorites requires auth."""
        response = client.get("/favorites")
        assert response.status_code == 401


class TestCheckFavorite:
    """Tests for GET /favorites/check/{product_id}"""

    @patch("app.api.v1.favorites.favorite_service")
    def test_check_favorite_true(self, mock_svc, client, db_session, customer_user, product):
        """Test checking if product is favorited (true)."""
        mock_svc.is_favorite = AsyncMock(return_value=(True, 1))
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get(f"/favorites/check/{product.id}")
            assert response.status_code == 200
            data = response.json()
            assert data["is_favorite"] is True
            assert data["favorite_id"] == 1
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    @patch("app.api.v1.favorites.favorite_service")
    def test_check_favorite_false(self, mock_svc, client, db_session, customer_user):
        """Test checking if product is not favorited."""
        mock_svc.is_favorite = AsyncMock(return_value=(False, None))
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get("/favorites/check/99999")
            assert response.status_code == 200
            data = response.json()
            assert data["is_favorite"] is False
        finally:
            app.dependency_overrides.pop(get_current_user, None)


class TestGetFavoriteIds:
    """Tests for GET /favorites/ids"""

    @patch("app.api.v1.favorites.favorite_service")
    def test_get_favorite_ids(self, mock_svc, client, db_session, customer_user):
        """Test getting list of favorite product IDs."""
        mock_svc.get_favorite_product_ids = AsyncMock(return_value=[1, 2, 3])
        app.dependency_overrides[get_current_user] = lambda: customer_user
        try:
            response = client.get("/favorites/ids")
            assert response.status_code == 200
            assert response.json() == [1, 2, 3]
        finally:
            app.dependency_overrides.pop(get_current_user, None)

    def test_get_favorite_ids_requires_auth(self, client):
        """Test getting favorite IDs requires auth."""
        response = client.get("/favorites/ids")
        assert response.status_code == 401
