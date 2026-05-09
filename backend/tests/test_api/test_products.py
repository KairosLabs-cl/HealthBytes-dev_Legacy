"""Product endpoints tests."""

import logging
from unittest.mock import patch

import pytest

from app.core.security import create_access_token
from app.db.schemas import Product


def _create_product(db_session, **overrides):
    """Helper to insert a product directly into the test DB."""
    defaults = {
        "name": "Test Product",
        "description": "A test product",
        "price": 9.99,
        "stock": 10,
        "image": "https://example.com/image.jpg",
        "category": "Snacks",
    }
    defaults.update(overrides)
    product = Product(**defaults)
    db_session.add(product)
    db_session.commit()
    db_session.refresh(product)
    return product


# ---- LIST / GET ----


@pytest.mark.unit
@pytest.mark.products
def test_get_products_empty(client):
    """Test GET /products returns empty list when no products exist."""
    response = client.get("/products")
    assert response.status_code == 200
    assert response.json() == []


@pytest.mark.unit
@pytest.mark.products
def test_get_products_with_data(client, db_session):
    """Test GET /products returns products when they exist."""
    _create_product(db_session, name="Product A")
    _create_product(db_session, name="Product B", price=19.99)
    response = client.get("/products")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.unit
@pytest.mark.products
def test_get_products_with_category_filter(client, db_session):
    """Test GET /products?category=Snacks filters by category."""
    _create_product(db_session, name="Snack 1", category="Snacks")
    _create_product(db_session, name="Drink 1", category="Drinks")
    response = client.get("/products?category=Snacks")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Snack 1"


@pytest.mark.unit
@pytest.mark.products
def test_get_products_with_price_range(client, db_session):
    """Test GET /products?min_price=5&max_price=15 filters by price."""
    _create_product(db_session, name="Cheap", price=3.00)
    _create_product(db_session, name="Mid", price=10.00)
    _create_product(db_session, name="Expensive", price=50.00)
    response = client.get("/products?min_price=5&max_price=15")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Mid"


@pytest.mark.unit
@pytest.mark.products
def test_get_discounted_products_orders_active_discounts(client, db_session):
    """Test GET /products/discounts returns only discounted products, highest first."""
    _create_product(db_session, name="No Discount", discount_percentage=None)
    _create_product(db_session, name="Zero Discount", discount_percentage=0)
    _create_product(db_session, name="Small Discount", discount_percentage=10)
    _create_product(db_session, name="Big Discount", discount_percentage=35)

    response = client.get("/products/discounts")

    assert response.status_code == 200
    data = response.json()
    assert [product["name"] for product in data] == ["Big Discount", "Small Discount"]
    assert [product["discount_percentage"] for product in data] == [35, 10]


@pytest.mark.unit
@pytest.mark.products
def test_get_product_by_id_found(client, db_session):
    """Test GET /products/{id} returns product when found."""
    product = _create_product(db_session, name="FindMe")
    response = client.get(f"/products/{product.id}")
    assert response.status_code == 200
    assert response.json()["name"] == "FindMe"


@pytest.mark.unit
@pytest.mark.products
def test_get_product_by_id_not_found(client):
    """Test GET /products/{id} returns 404 when not found."""
    response = client.get("/products/9999")
    assert response.status_code == 404


@pytest.mark.unit
@pytest.mark.products
def test_get_products_by_ids_batch(client, db_session):
    """Test GET /products/batch?ids=1,2 returns matching products."""
    p1 = _create_product(db_session, name="Batch1")
    p2 = _create_product(db_session, name="Batch2")
    response = client.get(f"/products/batch?ids={p1.id},{p2.id}")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


@pytest.mark.unit
@pytest.mark.products
def test_get_products_batch_invalid_ids(client):
    """Test GET /products/batch?ids=abc returns 400."""
    response = client.get("/products/batch?ids=abc,def")
    assert response.status_code == 400


@pytest.mark.unit
@pytest.mark.products
def test_get_products_batch_empty(client):
    """Test GET /products/batch?ids= returns empty list."""
    response = client.get("/products/batch?ids=")
    assert response.status_code == 200
    assert response.json() == []


# ---- SEARCH ----


@pytest.mark.unit
@pytest.mark.products
def test_search_products(client, db_session):
    """Test GET /products?search=test uses search/LIKE fallback."""
    _create_product(db_session, name="Galletas Sin Gluten")
    _create_product(db_session, name="Chocolate Bar")
    response = client.get("/products?search=Galletas")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1
    assert any("Galletas" in p["name"] for p in data)


@pytest.mark.unit
@pytest.mark.products
def test_search_products_empty_query(client, db_session):
    """Test GET /products?search= with blank search returns all."""
    _create_product(db_session, name="All1")
    _create_product(db_session, name="All2")
    response = client.get("/products?search=   ")
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2


# ---- CREATE (requires seller) ----


@pytest.mark.unit
@pytest.mark.products
def test_create_product_unauthorized(client):
    """Test POST /products without auth returns 401/403."""
    response = client.post("/products", json={"name": "X", "price": 1.0})
    assert response.status_code in [401, 403]


@pytest.mark.unit
@pytest.mark.products
def test_create_product_as_seller(client, db_session):
    """Test POST /products as seller creates product."""
    from tests.conftest import create_test_user

    user = create_test_user(db_session, email="seller@test.com", role="seller")
    token = create_access_token({"userId": user.id, "role": "seller"})
    headers = {"Authorization": f"Bearer {token}"}
    data = {"name": "New Product", "price": 15.50, "stock": 50}
    response = client.post("/products", json=data, headers=headers)
    assert response.status_code == 201
    assert response.json()["name"] == "New Product"


@pytest.mark.unit
@pytest.mark.products
def test_create_product_as_customer_forbidden(client, db_session):
    """Test POST /products as customer returns 403."""
    from tests.conftest import create_test_user

    user = create_test_user(db_session, email="customer@test.com", role="customer")
    token = create_access_token({"userId": user.id, "role": "customer"})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/products", json={"name": "X", "price": 1.0}, headers=headers)
    assert response.status_code == 403


# ---- UPDATE ----


@pytest.mark.unit
@pytest.mark.products
def test_update_product_as_seller(client, db_session):
    """Test PUT /products/{id} as seller updates product."""
    from tests.conftest import create_test_user

    user = create_test_user(db_session, email="seller2@test.com", role="seller")
    product = _create_product(db_session, name="OldName")
    token = create_access_token({"userId": user.id, "role": "seller"})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.put(f"/products/{product.id}", json={"name": "NewName"}, headers=headers)
    assert response.status_code == 200
    assert response.json()["name"] == "NewName"


@pytest.mark.unit
@pytest.mark.products
def test_update_product_not_found(client, db_session):
    """Test PUT /products/{id} for non-existent product returns 404."""
    from tests.conftest import create_test_user

    user = create_test_user(db_session, email="seller3@test.com", role="seller")
    token = create_access_token({"userId": user.id, "role": "seller"})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.put("/products/9999", json={"name": "X"}, headers=headers)
    assert response.status_code == 404


# ---- DELETE ----


@pytest.mark.unit
@pytest.mark.products
def test_delete_product_as_seller(client, db_session):
    """Test DELETE /products/{id} as seller deletes product."""
    from tests.conftest import create_test_user

    user = create_test_user(db_session, email="seller4@test.com", role="seller")
    product = _create_product(db_session, name="ToDelete")
    token = create_access_token({"userId": user.id, "role": "seller"})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.delete(f"/products/{product.id}", headers=headers)
    assert response.status_code == 204


@pytest.mark.unit
@pytest.mark.products
def test_delete_product_not_found(client, db_session):
    """Test DELETE /products/{id} for non-existent product returns 404."""
    from tests.conftest import create_test_user

    user = create_test_user(db_session, email="seller5@test.com", role="seller")
    token = create_access_token({"userId": user.id, "role": "seller"})
    headers = {"Authorization": f"Bearer {token}"}
    response = client.delete("/products/9999", headers=headers)
    assert response.status_code == 404


# ---- ERROR HANDLING ----


@pytest.mark.unit
@pytest.mark.products
def test_list_products_exception_logging(client, caplog):
    """Test that exceptions in list_products are logged with lazy formatting."""
    with patch(
        "app.api.v1.products.product_service.list_products",
        side_effect=RuntimeError("db error"),
    ):
        with caplog.at_level(logging.ERROR, logger="app.api.v1.products"):
            response = client.get("/products")
    assert response.status_code == 500
    assert "Error listing/searching products" in caplog.text


@pytest.mark.unit
@pytest.mark.products
def test_get_product_exception_logging(client, caplog):
    """Test that exceptions in get_product_by_id are logged properly."""
    with patch(
        "app.api.v1.products.product_service.get_product",
        side_effect=RuntimeError("db error"),
    ):
        with caplog.at_level(logging.ERROR, logger="app.api.v1.products"):
            response = client.get("/products/1")
    assert response.status_code == 500
    assert "Error getting product" in caplog.text
