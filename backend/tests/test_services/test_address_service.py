"""Tests for address_service - Address CRUD management"""

import pytest
from fastapi import HTTPException
from app.db.models.address import Address
from app.schemas.address import AddressCreate, AddressUpdate
from app.services.address_service import AddressService
from tests.conftest import MockAsyncSession


@pytest.fixture
def address_data():
    """Sample address creation data."""
    return AddressCreate(
        label="Home",
        street="Av. Providencia",
        street_number="1234",
        city="Santiago",
        region="Metropolitana",
        postal_code="7500000",
        country="CL",
        recipient_name="Test User",
        phone="+56912345678",
        is_default=False,
    )


@pytest.fixture
def default_address_data():
    """Address data marked as default."""
    return AddressCreate(
        label="Work",
        street="Av. Apoquindo",
        street_number="5678",
        city="Las Condes",
        region="Metropolitana",
        postal_code="7550000",
        country="CL",
        is_default=True,
    )


USER_ID = 1


# --- create_address ---


@pytest.mark.asyncio
async def test_create_address_success(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    result = await AddressService.create_address(mock_db, USER_ID, address_data)

    assert result.id is not None
    assert result.user_id == USER_ID
    assert result.street == "Av. Providencia"
    assert result.city == "Santiago"
    assert result.is_active is True


@pytest.mark.asyncio
async def test_create_address_as_default(db_session, default_address_data):
    mock_db = MockAsyncSession(db_session)
    result = await AddressService.create_address(mock_db, USER_ID, default_address_data)

    assert result.is_default is True


@pytest.mark.asyncio
async def test_create_default_unsets_previous_default(
    db_session, address_data, default_address_data
):
    mock_db = MockAsyncSession(db_session)

    # Create first address as default
    first = await AddressService.create_address(mock_db, USER_ID, default_address_data)
    assert first.is_default is True

    # Create second as default - should unset the first
    second_data = AddressCreate(
        label="New Default",
        street="Calle Nueva",
        city="Valparaiso",
        region="Valparaiso",
        postal_code="2340000",
        is_default=True,
    )
    second = await AddressService.create_address(mock_db, USER_ID, second_data)
    assert second.is_default is True

    # Refresh first address to check it was unset
    db_session.refresh(first)
    assert first.is_default is False


# --- get_user_addresses ---


@pytest.mark.asyncio
async def test_get_user_addresses_empty(db_session):
    mock_db = MockAsyncSession(db_session)
    result = await AddressService.get_user_addresses(mock_db, USER_ID)
    assert result == []


@pytest.mark.asyncio
async def test_get_user_addresses_returns_active_only(db_session, address_data):
    mock_db = MockAsyncSession(db_session)

    # Create active address
    await AddressService.create_address(mock_db, USER_ID, address_data)

    # Create inactive address directly
    inactive = Address(
        user_id=USER_ID,
        street="Deleted St",
        city="Gone",
        region="X",
        postal_code="000",
        is_active=False,
    )
    db_session.add(inactive)
    db_session.commit()

    result = await AddressService.get_user_addresses(mock_db, USER_ID)
    assert len(result) == 1
    assert result[0].street == "Av. Providencia"


@pytest.mark.asyncio
async def test_get_user_addresses_include_inactive(db_session, address_data):
    mock_db = MockAsyncSession(db_session)

    await AddressService.create_address(mock_db, USER_ID, address_data)
    inactive = Address(
        user_id=USER_ID,
        street="Deleted St",
        city="Gone",
        region="X",
        postal_code="000",
        is_active=False,
    )
    db_session.add(inactive)
    db_session.commit()

    result = await AddressService.get_user_addresses(mock_db, USER_ID, include_inactive=True)
    assert len(result) == 2


@pytest.mark.asyncio
async def test_get_user_addresses_isolation(db_session, address_data):
    """Different users should not see each other's addresses."""
    mock_db = MockAsyncSession(db_session)
    await AddressService.create_address(mock_db, USER_ID, address_data)

    other_user_addresses = await AddressService.get_user_addresses(mock_db, 999)
    assert len(other_user_addresses) == 0


# --- get_address_by_id ---


@pytest.mark.asyncio
async def test_get_address_by_id_success(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    created = await AddressService.create_address(mock_db, USER_ID, address_data)

    result = await AddressService.get_address_by_id(mock_db, created.id, USER_ID)
    assert result.id == created.id
    assert result.street == "Av. Providencia"


@pytest.mark.asyncio
async def test_get_address_by_id_not_found(db_session):
    mock_db = MockAsyncSession(db_session)
    with pytest.raises(HTTPException) as exc_info:
        await AddressService.get_address_by_id(mock_db, 99999, USER_ID)
    assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_get_address_by_id_wrong_user(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    created = await AddressService.create_address(mock_db, USER_ID, address_data)

    with pytest.raises(HTTPException) as exc_info:
        await AddressService.get_address_by_id(mock_db, created.id, 999)
    assert exc_info.value.status_code == 404


# --- get_default_address ---


@pytest.mark.asyncio
async def test_get_default_address_exists(db_session, default_address_data):
    mock_db = MockAsyncSession(db_session)
    created = await AddressService.create_address(mock_db, USER_ID, default_address_data)

    result = await AddressService.get_default_address(mock_db, USER_ID)
    assert result is not None
    assert result.id == created.id
    assert result.is_default is True


@pytest.mark.asyncio
async def test_get_default_address_none(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    await AddressService.create_address(mock_db, USER_ID, address_data)

    result = await AddressService.get_default_address(mock_db, USER_ID)
    assert result is None


# --- update_address ---


@pytest.mark.asyncio
async def test_update_address_success(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    created = await AddressService.create_address(mock_db, USER_ID, address_data)

    update = AddressUpdate(city="Concepcion", region="Biobio")
    result = await AddressService.update_address(mock_db, created.id, USER_ID, update)

    assert result.city == "Concepcion"
    assert result.region == "Biobio"
    assert result.street == "Av. Providencia"  # Unchanged


@pytest.mark.asyncio
async def test_update_address_set_as_default(db_session, address_data, default_address_data):
    mock_db = MockAsyncSession(db_session)
    first = await AddressService.create_address(mock_db, USER_ID, default_address_data)
    second = await AddressService.create_address(mock_db, USER_ID, address_data)

    update = AddressUpdate(is_default=True)
    result = await AddressService.update_address(mock_db, second.id, USER_ID, update)

    assert result.is_default is True
    db_session.refresh(first)
    assert first.is_default is False


@pytest.mark.asyncio
async def test_update_address_not_found(db_session):
    mock_db = MockAsyncSession(db_session)
    with pytest.raises(HTTPException) as exc_info:
        await AddressService.update_address(mock_db, 99999, USER_ID, AddressUpdate(city="Test"))
    assert exc_info.value.status_code == 404


# --- delete_address ---


@pytest.mark.asyncio
async def test_delete_address_success(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    first = await AddressService.create_address(mock_db, USER_ID, address_data)

    # Need at least 2 addresses to delete one
    second_data = AddressCreate(
        street="Second St", city="City2", region="Region2", postal_code="111"
    )
    await AddressService.create_address(mock_db, USER_ID, second_data)

    result = await AddressService.delete_address(mock_db, first.id, USER_ID)
    assert result["message"] == f"Address {first.id} deleted successfully"


@pytest.mark.asyncio
async def test_delete_address_only_one_raises(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    created = await AddressService.create_address(mock_db, USER_ID, address_data)

    with pytest.raises(HTTPException) as exc_info:
        await AddressService.delete_address(mock_db, created.id, USER_ID)
    assert exc_info.value.status_code == 400
    assert "only address" in str(exc_info.value.detail)


@pytest.mark.asyncio
async def test_delete_default_address_raises(db_session, default_address_data, address_data):
    mock_db = MockAsyncSession(db_session)
    default_addr = await AddressService.create_address(mock_db, USER_ID, default_address_data)
    await AddressService.create_address(mock_db, USER_ID, address_data)

    with pytest.raises(HTTPException) as exc_info:
        await AddressService.delete_address(mock_db, default_addr.id, USER_ID)
    assert exc_info.value.status_code == 400
    assert "default address" in str(exc_info.value.detail).lower()


@pytest.mark.asyncio
async def test_delete_is_soft_delete(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    first = await AddressService.create_address(mock_db, USER_ID, address_data)
    second_data = AddressCreate(
        street="Second St", city="City2", region="Region2", postal_code="111"
    )
    await AddressService.create_address(mock_db, USER_ID, second_data)

    await AddressService.delete_address(mock_db, first.id, USER_ID)

    # Address still exists in DB but is_active=False
    db_session.refresh(first)
    assert first.is_active is False


# --- set_default_address ---


@pytest.mark.asyncio
async def test_set_default_address_success(db_session, address_data):
    mock_db = MockAsyncSession(db_session)
    created = await AddressService.create_address(mock_db, USER_ID, address_data)

    result = await AddressService.set_default_address(mock_db, created.id, USER_ID)
    assert result.is_default is True


@pytest.mark.asyncio
async def test_set_default_unsets_previous(db_session, default_address_data, address_data):
    mock_db = MockAsyncSession(db_session)
    first = await AddressService.create_address(mock_db, USER_ID, default_address_data)
    second = await AddressService.create_address(mock_db, USER_ID, address_data)

    await AddressService.set_default_address(mock_db, second.id, USER_ID)

    db_session.refresh(first)
    assert first.is_default is False
    db_session.refresh(second)
    assert second.is_default is True
