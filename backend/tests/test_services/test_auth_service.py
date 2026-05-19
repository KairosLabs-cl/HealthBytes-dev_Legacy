"""Unit tests for auth_service"""

import pytest

from app.db.schemas import User
from app.schemas.user import UserCreate
from app.services.auth_service import (
    get_user_by_clerk_id,
    get_user_by_email,
    login_user,
    register_user,
)
from tests.conftest import MockAsyncSession


@pytest.mark.asyncio
async def test_register_user_success(db_session):
    """Test successful user registration"""
    mock_db = MockAsyncSession(db_session)

    user_data = UserCreate(
        email="newuser@example.com", password="sec123"  # Max 72 bytes for bcrypt
    )

    result = await register_user(mock_db, user_data)

    assert result is not None
    assert result.email == "newuser@example.com"
    assert result.id is not None
    # Password should be hashed, not plaintext
    assert result.password != "secure123"


@pytest.mark.asyncio
async def test_register_user_duplicate_email(db_session):
    """Test registration fails with duplicate email"""
    mock_db = MockAsyncSession(db_session)

    # Create first user
    user1_data = UserCreate(email="duplicate@example.com", password="pass123")
    await register_user(mock_db, user1_data)

    # Try to create user with same email
    user2_data = UserCreate(email="duplicate@example.com", password="pass456")

    with pytest.raises(ValueError) as exc_info:
        await register_user(mock_db, user2_data)

    assert "already registered" in str(exc_info.value).lower()


@pytest.mark.asyncio
async def test_register_user_with_name(db_session):
    """Test registering user with name"""
    mock_db = MockAsyncSession(db_session)

    user_data = UserCreate(email="clerk@example.com", password="pass123", name="Test User")

    result = await register_user(mock_db, user_data)

    assert result.email == "clerk@example.com"
    assert result.id is not None


@pytest.mark.asyncio
async def test_login_user_success(db_session):
    """Test successful login"""
    mock_db = MockAsyncSession(db_session)

    # Register user first
    user_data = UserCreate(email="login@example.com", password="correct123")
    registered_user = await register_user(mock_db, user_data)

    # Login
    result = await login_user(mock_db, "login@example.com", "correct123")

    assert result is not None
    assert result.email == "login@example.com"
    assert result.id == registered_user.id


@pytest.mark.asyncio
async def test_login_user_wrong_password(db_session):
    """Test login fails with wrong password"""
    mock_db = MockAsyncSession(db_session)

    # Register user
    user_data = UserCreate(email="login@example.com", password="correct123")
    await register_user(mock_db, user_data)

    # Try login with wrong password
    result = await login_user(mock_db, "login@example.com", "wrong123")

    assert result is None


@pytest.mark.asyncio
async def test_login_user_nonexistent_email(db_session):
    """Test login fails with non-existent email"""
    mock_db = MockAsyncSession(db_session)

    result = await login_user(mock_db, "nonexistent@example.com", "pass123")

    assert result is None


@pytest.mark.asyncio
async def test_get_user_by_email_found(db_session):
    """Test getting user by email"""
    mock_db = MockAsyncSession(db_session)

    # Create user
    user_data = UserCreate(email="findme@example.com", password="pass123")
    created_user = await register_user(mock_db, user_data)

    # Find by email
    result = await get_user_by_email(mock_db, "findme@example.com")

    assert result is not None
    assert result.email == "findme@example.com"
    assert result.id == created_user.id


@pytest.mark.asyncio
async def test_get_user_by_email_not_found(db_session):
    """Test getting non-existent user by email"""
    mock_db = MockAsyncSession(db_session)

    result = await get_user_by_email(mock_db, "notfound@example.com")

    assert result is None


@pytest.mark.asyncio
async def test_get_user_by_clerk_id_found(db_session):
    """Test getting user by Clerk ID"""
    mock_db = MockAsyncSession(db_session)

    # Create user with Clerk ID directly in DB (register_user doesn't support clerk_id)
    user = User(
        email="clerkuser@example.com",
        password="hashed_password",
        role="customer",
        clerk_id="clerk_user_12345",
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Find by Clerk ID
    result = await get_user_by_clerk_id(mock_db, "clerk_user_12345")

    assert result is not None
    assert result.clerk_id == "clerk_user_12345"
    assert result.id == user.id


@pytest.mark.asyncio
async def test_get_user_by_clerk_id_not_found(db_session):
    """Test getting non-existent user by Clerk ID"""
    mock_db = MockAsyncSession(db_session)

    result = await get_user_by_clerk_id(mock_db, "nonexistent_clerk_id")

    assert result is None


@pytest.mark.asyncio
async def test_password_hashing_different_passwords(db_session):
    """Test that different passwords produce different hashes"""
    mock_db = MockAsyncSession(db_session)

    user1_data = UserCreate(email="user1@example.com", password="pass1")
    user2_data = UserCreate(email="user2@example.com", password="pass2")

    user1 = await register_user(mock_db, user1_data)
    user2 = await register_user(mock_db, user2_data)

    assert user1.password != user2.password


@pytest.mark.asyncio
async def test_password_hashing_same_password_different_hash(db_session):
    """Test that same password produces different hashes (due to salt)"""
    mock_db = MockAsyncSession(db_session)

    user1_data = UserCreate(email="user1@example.com", password="same123")
    user2_data = UserCreate(email="user2@example.com", password="same123")

    user1 = await register_user(mock_db, user1_data)
    user2 = await register_user(mock_db, user2_data)

    # Same password, but hashes should be different (due to salt)
    assert user1.password != user2.password

    # But both should login successfully
    login1 = await login_user(mock_db, "user1@example.com", "same123")
    login2 = await login_user(mock_db, "user2@example.com", "same123")

    assert login1 is not None
    assert login2 is not None
