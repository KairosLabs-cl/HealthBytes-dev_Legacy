"""Unit tests for refresh token rotation logic"""

import pytest
from sqlalchemy import select
from app.db.schemas import User, RefreshToken
from app.schemas.user import UserCreate
from app.services.auth_service import (
    register_user,
    create_user_tokens,
    refresh_access_token,
)
from tests.conftest import MockAsyncSession

@pytest.mark.asyncio
async def test_create_user_tokens(db_session):
    """Test creating both access and refresh tokens"""
    mock_db = MockAsyncSession(db_session)
    
    user_data = UserCreate(email="tokens@example.com", password="password123")
    user = await register_user(mock_db, user_data)
    
    tokens = await create_user_tokens(mock_db, user)
    await mock_db.commit()
    
    assert "token" in tokens
    assert "refresh_token" in tokens
    assert tokens["token"] is not None
    assert tokens["refresh_token"] is not None
    
    # Check if refresh token is stored in DB (hashed)
    # db_session is synchronous
    result = db_session.execute(select(RefreshToken).where(RefreshToken.user_id == user.id))
    db_tokens = result.scalars().all()
    assert len(db_tokens) == 1
    assert db_tokens[0].token != tokens["refresh_token"] # Should be hashed

@pytest.mark.asyncio
async def test_refresh_token_rotation_success(db_session):
    """Test successful refresh token rotation"""
    mock_db = MockAsyncSession(db_session)
    
    user_data = UserCreate(email="rotate@example.com", password="password123")
    user = await register_user(mock_db, user_data)
    
    initial_tokens = await create_user_tokens(mock_db, user)
    await mock_db.commit()
    
    old_refresh_token = initial_tokens["refresh_token"]
    
    # Small delay to ensure expiration timestamp (exp) is different
    # or just rely on rotation itself.
    import asyncio
    await asyncio.sleep(0.1)
    
    # Rotate token
    new_auth_response = await refresh_access_token(mock_db, old_refresh_token)
    
    assert new_auth_response is not None
    # If the test runs extremely fast, the 'exp' claim might still be the same second.
    # But new_auth_response.refresh_token MUST be different due to rotation.
    assert new_auth_response.refresh_token != initial_tokens["refresh_token"]
    assert new_auth_response.user.id == user.id
    
    # Check old token is revoked
    result = db_session.execute(
        select(RefreshToken).where(RefreshToken.user_id == user.id).order_by(RefreshToken.created_at.asc())
    )
    db_tokens = result.scalars().all()
    assert len(db_tokens) == 2
    assert db_tokens[0].revoked is True
    assert db_tokens[1].revoked is False

@pytest.mark.asyncio
async def test_refresh_token_revoked_fails(db_session):
    """Test that a revoked refresh token cannot be used"""
    mock_db = MockAsyncSession(db_session)
    
    user_data = UserCreate(email="revoked@example.com", password="password123")
    user = await register_user(mock_db, user_data)
    
    tokens = await create_user_tokens(mock_db, user)
    await mock_db.commit() # Ensure token is saved
    refresh_token = tokens["refresh_token"]
    
    # Manually revoke the token
    result = db_session.execute(select(RefreshToken).where(RefreshToken.user_id == user.id))
    db_token = result.scalar_one()
    db_token.revoked = True
    db_session.commit()
    
    # Attempt to refresh
    result = await refresh_access_token(mock_db, refresh_token)
    assert result is None

@pytest.mark.asyncio
async def test_refresh_token_expired_fails(db_session):
    """Test that an expired refresh token cannot be used"""
    mock_db = MockAsyncSession(db_session)
    
    user_data = UserCreate(email="expired@example.com", password="password123")
    user = await register_user(mock_db, user_data)
    
    tokens = await create_user_tokens(mock_db, user)
    await mock_db.commit() # Ensure token is saved
    refresh_token = tokens["refresh_token"]
    
    # Manually expire the token
    from datetime import UTC, datetime, timedelta
    result = db_session.execute(select(RefreshToken).where(RefreshToken.user_id == user.id))
    db_token = result.scalar_one()
    db_token.expires_at = datetime.now(UTC) - timedelta(seconds=1)
    db_session.commit()
    
    # Attempt to refresh
    result = await refresh_access_token(mock_db, refresh_token)
    assert result is None

@pytest.mark.asyncio
async def test_invalid_refresh_token_fails(db_session):
    """Test that an invalid refresh token fails"""
    mock_db = MockAsyncSession(db_session)
    
    result = await refresh_access_token(mock_db, "invalid.token.here")
    assert result is None
