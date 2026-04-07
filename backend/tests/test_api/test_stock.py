"""
Test Stock Service & API Endpoints
Tests for stock management with race condition prevention
"""

import pytest

from app.core.security import create_access_token
from app.db.schemas import Product
from app.services.stock_service import StockService, StockStatus
from tests.conftest import create_test_user


@pytest.fixture
def test_user(db_session):
    """Create an admin user for stock update tests."""
    return create_test_user(db_session, email="stock_user@test.com", role="admin")


@pytest.fixture
def auth_headers(test_user):
    """Generate auth headers with JWT token."""
    token = create_access_token({"userId": test_user.id, "role": test_user.role})
    return {"Authorization": token}


@pytest.fixture
def test_products(db_session):
    """Create test products with known stock levels."""
    product1 = Product(
        name="Stock Test Product 1",
        description="Product with plenty of stock",
        price=10.0,
        stock=50,
    )
    product2 = Product(
        name="Stock Test Product 2",
        description="Product with low stock",
        price=20.0,
        stock=3,
    )
    product3 = Product(
        name="Stock Test Product 3",
        description="Out of stock product",
        price=15.0,
        stock=0,
    )
    db_session.add_all([product1, product2, product3])
    db_session.commit()
    db_session.refresh(product1)
    db_session.refresh(product2)
    db_session.refresh(product3)
    return [product1, product2, product3]


def test_stock_status_calculation():
    """Test stock status calculation logic."""
    # Out of stock
    assert StockService._calculate_stock_status(0) == StockStatus.OUT_OF_STOCK

    # Low stock (below threshold of 5)
    assert StockService._calculate_stock_status(1) == StockStatus.LOW_STOCK
    assert StockService._calculate_stock_status(4) == StockStatus.LOW_STOCK

    # In stock (at or above threshold)
    assert StockService._calculate_stock_status(5) == StockStatus.IN_STOCK
    assert StockService._calculate_stock_status(100) == StockStatus.IN_STOCK


def test_get_stock_info(client, test_products):
    """Test GET /api/v1/products/{id}/stock endpoint."""
    product = test_products[0]  # stock=50
    response = client.get(f"/api/v1/products/{product.id}/stock")

    assert response.status_code == 200
    data = response.json()
    assert data["product_id"] == product.id
    assert data["stock"] == 50
    assert data["stock_status"] == "in_stock"
    assert data["is_available"] is True
    assert data["is_low_stock"] is False


def test_get_stock_info_low_stock(client, test_products):
    """Test stock info for low stock product."""
    product = test_products[1]  # stock=3
    response = client.get(f"/api/v1/products/{product.id}/stock")

    assert response.status_code == 200
    data = response.json()
    assert data["stock_status"] == "low_stock"
    assert data["is_available"] is True
    assert data["is_low_stock"] is True


def test_get_stock_info_out_of_stock(client, test_products):
    """Test stock info for out of stock product."""
    product = test_products[2]  # stock=0
    response = client.get(f"/api/v1/products/{product.id}/stock")

    assert response.status_code == 200
    data = response.json()
    assert data["stock_status"] == "out_of_stock"
    assert data["is_available"] is False


def test_get_stock_info_not_found(client):
    """Test stock info for non-existent product."""
    response = client.get("/api/v1/products/99999/stock")
    assert response.status_code == 404


def test_check_availability_endpoint(client, test_products):
    """Test POST /api/v1/products/check-availability endpoint."""
    product = test_products[0]  # stock=50
    request_data = {"product_id": product.id, "quantity": 2}

    response = client.post("/api/v1/products/check-availability", json=request_data)

    assert response.status_code == 200
    data = response.json()
    assert data["is_available"] is True
    assert data["current_stock"] == 50
    assert data["requested_quantity"] == 2


def test_check_availability_insufficient(client, test_products):
    """Test availability check when not enough stock."""
    product = test_products[1]  # stock=3
    request_data = {"product_id": product.id, "quantity": 10}

    response = client.post("/api/v1/products/check-availability", json=request_data)

    assert response.status_code == 200
    data = response.json()
    assert data["is_available"] is False


def test_stock_endpoint_no_auth_required(client, test_products):
    """Test that read-only stock endpoints don't require auth."""
    product = test_products[0]

    # GET stock info - public
    response = client.get(f"/api/v1/products/{product.id}/stock")
    assert response.status_code == 200

    # POST check availability - public
    response = client.post(
        "/api/v1/products/check-availability",
        json={"product_id": product.id, "quantity": 1},
    )
    assert response.status_code == 200


def test_update_stock_requires_auth(client, test_products):
    """Test that stock update requires authentication."""
    product = test_products[0]
    response = client.put(
        f"/api/v1/products/{product.id}/stock",
        json={"new_stock": 100},
    )
    assert response.status_code == 401


def test_update_stock(client, test_products, auth_headers):
    """Test PUT /api/v1/products/{id}/stock admin endpoint."""
    product = test_products[0]
    response = client.put(
        f"/api/v1/products/{product.id}/stock",
        json={"new_stock": 100},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["stock"] == 100
    assert data["stock_status"] == "in_stock"


def test_update_stock_to_zero(client, test_products, auth_headers):
    """Test setting stock to zero."""
    product = test_products[0]
    response = client.put(
        f"/api/v1/products/{product.id}/stock",
        json={"new_stock": 0},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["stock"] == 0
    assert data["stock_status"] == "out_of_stock"
    assert data["is_available"] is False
