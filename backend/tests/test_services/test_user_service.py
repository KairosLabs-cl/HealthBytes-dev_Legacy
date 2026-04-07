"""Unit tests for user_service"""

import pytest
from sqlalchemy import select

from app.db.schemas import User
from app.schemas.user import AdminUserUpdate, UserCreate, UserUpdate
from app.services.auth_service import register_user
from app.services.user_service import delete_user, get_user, update_user
from tests.conftest import MockAsyncSession


@pytest.mark.asyncio
async def test_get_user_existing(db_session):
    """Test getting an existing user"""
    mock_db = MockAsyncSession(db_session)

    # Create user directly in DB (ID will be auto-generated)
    user = User(email="test@example.com", password="hashed_password", role="customer")
    db_session.add(user)
    db_session.commit()

    result = await get_user(mock_db, user.id)

    assert result is not None
    assert result.email == "test@example.com"
    assert result.role == "customer"


@pytest.mark.asyncio
async def test_get_user_not_found(db_session):
    """Test getting a non-existent user"""
    mock_db = MockAsyncSession(db_session)

    result = await get_user(mock_db, "nonexistent_user_id")

    assert result is None


@pytest.mark.asyncio
async def test_update_user_success(db_session):
    """Test updating user information"""
    mock_db = MockAsyncSession(db_session)

    # Create user (auto-generated int ID)
    user = User(email="original@example.com", password="hashed_password", role="customer")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Update user
    update_data = AdminUserUpdate(email="updated@example.com")

    result = await update_user(mock_db, user.id, update_data)

    assert result is not None
    assert result.email == "updated@example.com"
    assert result.role == "customer"  # Unchanged


@pytest.mark.asyncio
async def test_update_user_not_found(db_session):
    """Test updating a non-existent user"""
    mock_db = MockAsyncSession(db_session)

    update_data = AdminUserUpdate(email="new@example.com")

    result = await update_user(mock_db, "nonexistent_user", update_data)

    assert result is None


@pytest.mark.asyncio
async def test_update_user_partial(db_session):
    """Test partial update (only some fields)"""
    mock_db = MockAsyncSession(db_session)

    # Create user (auto-generated int ID)
    user = User(email="partial_test@example.com", password="hashed_password", role="customer")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Update only role
    update_data = AdminUserUpdate(role="seller")

    result = await update_user(mock_db, user.id, update_data)

    assert result.role == "seller"
    # Email should remain unchanged from initial value
    assert result.email == "partial_test@example.com"


@pytest.mark.asyncio
async def test_update_user_all_fields(db_session):
    """Test updating all user fields"""
    mock_db = MockAsyncSession(db_session)

    # Create user (auto-generated int ID)
    user = User(email="old@example.com", password="old_hash", role="customer")
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Update all fields
    update_data = AdminUserUpdate(email="new@example.com", role="admin")

    result = await update_user(mock_db, user.id, update_data)

    assert result.email == "new@example.com"
    assert result.role == "admin"


@pytest.mark.asyncio
async def test_delete_user_existing(db_session):
    """Test deleting an existing user"""
    mock_db = MockAsyncSession(db_session)

    # Create user
    user = User(email="todelete@example.com", password="hashed_password", role="customer")
    db_session.add(user)
    db_session.commit()

    # Delete user
    result = await delete_user(mock_db, user.id)

    # Verify deletion result
    assert result is True or result is None


@pytest.mark.asyncio
async def test_delete_user_not_found(db_session):
    """Test deleting a non-existent user"""
    mock_db = MockAsyncSession(db_session)

    result = await delete_user(mock_db, "nonexistent_user")

    # Verify it returns False or None for non-existent user
    assert result is False or result is None


@pytest.mark.asyncio
async def test_get_user_with_multiple_users(db_session):
    """Test getting specific user among multiple users"""
    mock_db = MockAsyncSession(db_session)

    # Create multiple users
    users = []
    for i in range(1, 4):
        user = User(email=f"user{i}@example.com", password="hashed_password", role="customer")
        db_session.add(user)
        users.append(user)
    db_session.commit()

    # Get specific user
    result = await get_user(mock_db, users[1].id)

    assert result is not None
    assert result.email == "user2@example.com"
    assert result.id == users[1].id
