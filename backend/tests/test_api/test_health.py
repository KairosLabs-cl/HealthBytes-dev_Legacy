"""Health check endpoint tests."""

import pytest


@pytest.mark.unit
def test_health_check(client):
    """Test GET / health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    # Adjust assertion based on actual response structure
    # assert response.json() == {"status": "ok"}
