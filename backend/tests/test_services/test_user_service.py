"""Unit tests for user_service"""

import pytest
from sqlalchemy import select
from app.services.user_service import (
    get_user,
    update_user,
    delete_user,
)
from app.schemas.user import UserCreate, UserUpdate
from app.db.schemas import User
from app.services.auth_service import register_user
from tests.conftest import MockAsyncSession


@pytest.mark.asyncio
async def test_get_user_existing(db_session):
    """Test getting an existing user"""
    mock_db = MockAsyncSession(db_session)
    
    # Create user directly in DB
    user = User(
        id="user_123",
        email="test@example.com",
        password="hashed_password",
        role="customer"
    )
    db_session.add(user)
    db_session.commit()
    
    result = await get_user(mock_db, "user_123")
    
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
    
    # Create user
    user = User(
        id="user_456",
        email="original@example.com",
        password="hashed_password",
        role="customer"
    )
    db_session.add(user)
    db_session.commit()
    
    # Update user
    update_data = UserUpdate(
        email="updated@example.com"
    )
    
    result = await update_user(mock_db, "user_456", update_data)
    
    assert result is not None
    assert result.email == "updated@example.com"
    assert result.role == "customer"  # Unchanged


@pytest.mark.asyncio
async def test_update_user_not_found(db_session):
    """Test updating a non-existent user"""
    mock_db = MockAsyncSession(db_session)
    
    update_data = UserUpdate(email="new@example.com")
    
    result = await update_user(mock_db, "nonexistent_user", update_data)
    
    assert result is None


@pytest.mark.asyncio
async def test_update_user_partial(db_session):
    """Test partial update (only some fields)"""
    mock_db = MockAsyncSession(db_session)
    
    # Create user
    user = User(
        id="user_789",
        email="original@example.com",
        password="hashed_password",
        role="customer"
    )
    db_session.add(user)
    db_session.commit()
    
    # Update only role
    update_data = UserUpdate(role="seller")
    
    result = await update_user(mock_db, "user_789", update_data)
    
    assert result.role == "seller"
    assert result.email == "original@example.com"  # Unchanged


@pytest.mark.asyncio
async def test_update_user_all_fields(db_session):
    """Test updating all user fields"""
    mock_db = MockAsyncSession(db_session)
    
    # Create user
    user = User(
        id="user_999",
        email="old@example.com",
        password="old_hash",
        role="customer"
    )
    db_session.add(user)
    db_session.commit()
    
    # Update all fields
    update_data = UserUpdate(
        email="new@example.com",
        role="admin"
    )
    
    result = await update_user(mock_db, "user_999", update_data)
    
    assert result.email == "new@example.com"
    assert result.role == "admin"


@pytest.mark.asyncio
async def test_delete_user_existing(db_session):
    """Test deleting an existing user"""
    mock_db = MockAsyncSession(db_session)
    
    # Create user
    user = User(
        id="user_delete",
        email="todelete@example.com",
        password="hashed_password",
        role="customer"
    )
    db_session.add(user)
    db_session.commit()
    
    # Delete user
    result = await delete_user(mock_db, "user_delete")
    
    assert result is not None
    
    # Verify deletion
    deleted = await get_user(mock_db, "user_delete")
    assert deleted is None


@pytest.mark.asyncio
async def test_delete_user_not_found(db_session):
    """Test deleting a non-existent user"""
    mock_db = MockAsyncSession(db_session)
    
    result = await delete_user(mock_db, "nonexistent_user")
    
    assert result is None


@pytest.mark.asyncio
async def test_get_user_with_multiple_users(db_session):
    """Test getting specific user among multiple users"""
    mock_db = MockAsyncSession(db_session)
    
    # Create multiple users
    for i in range(1, 4):
        user = User(
            id=f"user_{i}",
            email=f"user{i}@example.com",
            password="hashed_password",
            role="customer"
        )
        db_session.add(user)
    db_session.commit()
    
    # Get specific user
    result = await get_user(mock_db, "user_2")
    
    assert result is not None
    assert result.email == "user2@example.com"
    assert result.id == "user_2"
