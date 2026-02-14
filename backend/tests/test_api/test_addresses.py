"""
Test Address API endpoints
"""

import pytest
from app.core.security import create_access_token
from tests.conftest import create_test_user


@pytest.fixture
def test_user(db_session):
    """Create a test user for address tests."""
    return create_test_user(db_session, email="address_user@test.com", role="customer")


@pytest.fixture
def auth_headers(test_user):
    """Generate auth headers with JWT token."""
    token = create_access_token({"userId": test_user.id, "role": test_user.role})
    return {"Authorization": token}


def test_address_requires_auth(client):
    """Test that address endpoints require authentication."""
    response = client.get("/addresses")
    assert response.status_code == 401


def test_create_address(client, auth_headers):
    """Test creating a new address."""
    address_data = {
        "label": "Home",
        "street": "Avenida Providencia",
        "street_number": "1234 Apt 5B",
        "city": "Santiago",
        "region": "Metropolitana",
        "postal_code": "7500000",
        "country": "CL",
        "is_default": True,
    }

    response = client.post("/addresses", json=address_data, headers=auth_headers)

    assert response.status_code == 201
    data = response.json()
    assert data["label"] == "Home"
    assert data["city"] == "Santiago"
    assert data["is_default"] is True
    assert "id" in data
    assert "user_id" in data


def test_get_addresses(client, auth_headers):
    """Test getting user addresses."""
    # Create two addresses
    address1 = {
        "label": "Home",
        "street": "Calle Principal",
        "city": "Santiago",
        "region": "Metropolitana",
        "postal_code": "7500000",
        "is_default": True,
    }
    address2 = {
        "label": "Work",
        "street": "Avenida Apoquindo",
        "city": "Santiago",
        "region": "Metropolitana",
        "postal_code": "7550000",
        "is_default": False,
    }

    client.post("/addresses", json=address1, headers=auth_headers)
    client.post("/addresses", json=address2, headers=auth_headers)

    response = client.get("/addresses", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    assert len(data["addresses"]) == 2


def test_get_address_by_id(client, auth_headers):
    """Test getting specific address."""
    address_data = {
        "label": "Test",
        "street": "Test Street",
        "city": "Santiago",
        "region": "Metropolitana",
        "postal_code": "7500000",
    }

    create_response = client.post("/addresses", json=address_data, headers=auth_headers)
    address_id = create_response.json()["id"]

    response = client.get(f"/addresses/{address_id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == address_id
    assert data["label"] == "Test"


def test_update_address(client, auth_headers):
    """Test updating address."""
    create_response = client.post(
        "/addresses",
        json={
            "street": "Old Street",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
        },
        headers=auth_headers,
    )
    address_id = create_response.json()["id"]

    update_data = {"street": "New Street", "label": "Updated Home"}

    response = client.put(
        f"/addresses/{address_id}", json=update_data, headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["street"] == "New Street"
    assert data["label"] == "Updated Home"
    assert data["city"] == "Santiago"  # Unchanged


def test_set_default_address(client, auth_headers):
    """Test setting address as default."""
    addr1_response = client.post(
        "/addresses",
        json={
            "label": "Address 1",
            "street": "Street 1",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
            "is_default": True,
        },
        headers=auth_headers,
    )

    addr2_response = client.post(
        "/addresses",
        json={
            "label": "Address 2",
            "street": "Street 2",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
        },
        headers=auth_headers,
    )

    addr2_id = addr2_response.json()["id"]

    # Set address 2 as default
    response = client.patch(f"/addresses/{addr2_id}/set-default", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["is_default"] is True

    # Verify address 1 is no longer default
    addr1_id = addr1_response.json()["id"]
    addr1_check = client.get(f"/addresses/{addr1_id}", headers=auth_headers)
    assert addr1_check.json()["is_default"] is False


def test_delete_address(client, auth_headers):
    """Test deleting address (need at least 2 to delete one)."""
    client.post(
        "/addresses",
        json={
            "street": "Street 1",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
            "is_default": True,
        },
        headers=auth_headers,
    )

    response2 = client.post(
        "/addresses",
        json={
            "street": "Street 2",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
        },
        headers=auth_headers,
    )
    addr2_id = response2.json()["id"]

    # Delete non-default address
    delete_response = client.delete(f"/addresses/{addr2_id}", headers=auth_headers)

    assert delete_response.status_code == 200
    assert "deleted successfully" in delete_response.json()["message"]


def test_cannot_delete_only_address(client, auth_headers):
    """Test that user cannot delete their only address."""
    response = client.post(
        "/addresses",
        json={
            "street": "Only Street",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
        },
        headers=auth_headers,
    )
    address_id = response.json()["id"]

    delete_response = client.delete(f"/addresses/{address_id}", headers=auth_headers)

    assert delete_response.status_code == 400


def test_cannot_delete_default_address(client, auth_headers):
    """Test that user cannot delete default address."""
    response1 = client.post(
        "/addresses",
        json={
            "street": "Street 1",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
            "is_default": True,
        },
        headers=auth_headers,
    )

    client.post(
        "/addresses",
        json={
            "street": "Street 2",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "7500000",
        },
        headers=auth_headers,
    )

    addr1_id = response1.json()["id"]

    delete_response = client.delete(f"/addresses/{addr1_id}", headers=auth_headers)

    assert delete_response.status_code == 400


def test_postal_code_normalization(client, auth_headers):
    """Test that postal codes are normalized (spaces removed)."""
    response = client.post(
        "/addresses",
        json={
            "street": "Test Street",
            "city": "Santiago",
            "region": "Metropolitana",
            "postal_code": "750 0000",  # With space
            "country": "cl",  # Lowercase
        },
        headers=auth_headers,
    )

    assert response.status_code == 201
    data = response.json()
    assert data["postal_code"] == "7500000"  # Space removed
    assert data["country"] == "CL"  # Uppercase
