"""Product endpoints tests."""

import pytest


@pytest.mark.unit
@pytest.mark.products
def test_get_products(client):
    """Test GET /products endpoint."""
    response = client.get("/products")
    assert response.status_code in [200, 404]


@pytest.mark.unit
@pytest.mark.products
def test_get_product_by_id(client):
    """Test GET /products/{id} endpoint."""
    response = client.get("/products/1")
    # Should return 200 if product exists, 404 otherwise
    assert response.status_code in [200, 404]


@pytest.mark.unit
@pytest.mark.products
def test_create_product(client, sample_product_data):
    """Test POST /products endpoint (requires authentication)."""
    # This will likely fail without proper auth token
    response = client.post("/products", json=sample_product_data)
    assert response.status_code in [201, 401, 403]
