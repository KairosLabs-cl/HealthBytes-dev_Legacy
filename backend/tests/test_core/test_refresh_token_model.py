import pytest
from datetime import datetime, timedelta, UTC
from sqlalchemy.orm import Session
from app.db.schemas import User, RefreshToken

def test_create_refresh_token_model(db_session: Session):
    # Create a user first
    user = User(
        email="token_test@example.com",
        password="test_password",
        role="user",
        name="Token Test User"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Create refresh token
    expires_at = datetime.now(UTC) + timedelta(days=30)
    refresh_token = RefreshToken(
        user_id=user.id,
        token="hashed_token_string",
        expires_at=expires_at
    )
    db_session.add(refresh_token)
    db_session.commit()
    db_session.refresh(refresh_token)

    assert refresh_token.id is not None
    assert refresh_token.user_id == user.id
    assert refresh_token.token == "hashed_token_string"
    
    # Normalize datetimes for comparison (SQLite may lose timezone info)
    actual_expires = refresh_token.expires_at.replace(tzinfo=None) if refresh_token.expires_at.tzinfo else refresh_token.expires_at
    expected_expires = expires_at.replace(tzinfo=None) if expires_at.tzinfo else expires_at
    assert actual_expires == expected_expires
    
    assert refresh_token.revoked is False
    assert refresh_token.created_at is not None

def test_revoke_refresh_token(db_session: Session):
    # Create a user first
    user = User(
        email="revoke_test@example.com",
        password="test_password",
        role="user"
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    # Create refresh token
    refresh_token = RefreshToken(
        user_id=user.id,
        token="token_to_revoke",
        expires_at=datetime.now(UTC) + timedelta(days=30)
    )
    db_session.add(refresh_token)
    db_session.commit()

    # Revoke it
    refresh_token.revoked = True
    db_session.commit()
    db_session.refresh(refresh_token)

    assert refresh_token.revoked is True
