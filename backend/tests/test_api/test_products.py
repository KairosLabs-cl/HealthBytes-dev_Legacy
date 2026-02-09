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
def test_get_products_by_ids(client):
    """Test GET /products/batch endpoint."""
    response = client.get("/products/batch?ids=1,2,3")
    assert response.status_code in [200, 404]
    if response.status_code == 200:
        data = response.json()
        assert isinstance(data, list)

@pytest.mark.unit
@pytest.mark.products
def test_search_products(client):
    """Test GET /products?search=... endpoint."""
    # This assumes there might be some products. 
    # Since we are mocking or using a test db, we might not find anything, 
    # but the query shouldn't fail.
    response = client.get("/products?search=test")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
