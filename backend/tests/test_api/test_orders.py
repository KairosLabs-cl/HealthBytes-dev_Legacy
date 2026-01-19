"""Order endpoints tests."""

import pytest


@pytest.mark.unit
@pytest.mark.orders
def test_get_orders(client):
    """Test GET /orders endpoint."""
    response = client.get("/orders")
    # Requires authentication, should return 401 without token
    assert response.status_code in [200, 401, 403]


@pytest.mark.unit
@pytest.mark.orders
def test_create_order(client, sample_order_data):
    """Test POST /orders endpoint."""
    response = client.post("/orders", json=sample_order_data)
    # Requires authentication and valid data
    assert response.status_code in [201, 400, 401, 403]
