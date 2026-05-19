"""Auth service - Authentication and user registration logic."""

import hashlib
from datetime import UTC, datetime, timedelta
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    verify_password,
    verify_password_mock,
    verify_refresh_token,
)
from app.db.schemas import RefreshToken, User
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserWithToken


def hash_token(token: str) -> str:
    """Hash a token for secure storage in the database."""
    return hashlib.sha256(token.encode()).hexdigest()


async def create_user_tokens(db: AsyncSession, user: User) -> dict:
    """
    Generate new access and refresh tokens for a user.
    Saves the hashed refresh token to the database.
    """
    access_token = create_access_token({"userId": user.id, "role": user.role})
    refresh_token = create_refresh_token({"userId": user.id})

    hashed_refresh_token = hash_token(refresh_token)
    expires_at = datetime.now(UTC) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    db_refresh_token = RefreshToken(
        user_id=user.id,
        token=hashed_refresh_token,
        expires_at=expires_at,
    )
    db.add(db_refresh_token)
    # We don't commit here as this is typically part of a larger transaction (login/register)

    return {"token": access_token, "refresh_token": refresh_token}


async def build_auth_payload(db: AsyncSession, user: User) -> UserWithToken:
    """Build the full auth response payload including tokens."""
    tokens = await create_user_tokens(db, user)
    user_response = UserResponse(
        id=user.id,
        email=user.email,
        role=user.role,
        name=user.name,
        address=user.address,
        dietary_preferences=user.dietary_preferences or [],
    )
    return UserWithToken(
        user=user_response,
        token=tokens["token"],
        refresh_token=tokens["refresh_token"],
    )


async def register_user(db: AsyncSession, user_in: UserCreate) -> User:
    """
    Register new user with hashed password.

    Args:
        db: Database session
        user_in: User registration data

    Returns:
        Created User object

    Raises:
        ValueError: If email already exists
    """
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == user_in.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        # Prevent timing attacks by simulating password hashing
        verify_password_mock(user_in.password)
        raise ValueError("Email already registered")

    # Create user with hashed password
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email,
        password=hashed_password,
        name=user_in.name,
        address=user_in.address,
        role="user",
    )

    db.add(db_user)
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def login_user(db: AsyncSession, email: str, password: str) -> Optional[User]:
    """
    Verify user credentials and return user if valid.

    Args:
        db: Database session
        email: User email
        password: Plain text password

    Returns:
        User object if credentials valid, None otherwise
    """
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()

    if not user or not user.password:
        # Prevent timing attacks by simulating password verification
        # to prevent user enumeration.
        verify_password_mock(password)
        return None

    # Verify password
    if not verify_password(password, user.password):
        return None

    return user


async def register_with_token(db: AsyncSession, user_in: UserCreate) -> UserWithToken:
    """Register a user and return the API auth payload."""
    user = await register_user(db, user_in)
    payload = await build_auth_payload(db, user)
    await db.commit()
    return payload


async def login_with_token(db: AsyncSession, credentials: UserLogin) -> Optional[UserWithToken]:
    """Authenticate a user and return the API auth payload when valid."""
    user = await login_user(db, credentials.email, credentials.password)
    if not user:
        return None
    payload = await build_auth_payload(db, user)
    await db.commit()
    return payload


async def refresh_access_token(db: AsyncSession, refresh_token: str) -> Optional[UserWithToken]:
    """
    Verify a refresh token and issue a new set of tokens (rotation).
    """
    # 1. Verify token signature and expiration
    payload = verify_refresh_token(refresh_token)
    if not payload or "userId" not in payload:
        return None

    user_id = payload["userId"]

    # 2. Find the hashed token in DB
    hashed_token = hash_token(refresh_token)
    result = await db.execute(
        select(RefreshToken).where(
            RefreshToken.user_id == user_id,
            RefreshToken.token == hashed_token,
            RefreshToken.revoked == False,  # noqa: E712
            RefreshToken.expires_at > datetime.now(UTC),
        )
    )
    db_token = result.scalar_one_or_none()

    if not db_token:
        return None

    # 3. Rotation: Revoke old token
    db_token.revoked = True

    # 4. Get user
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return None

    # 5. Create new tokens
    payload = await build_auth_payload(db, user)
    await db.commit()

    return payload


async def get_user_by_email(db: AsyncSession, email: str) -> Optional[User]:
    """
    Get user by email address.

    Args:
        db: Database session
        email: User email

    Returns:
        User object or None if not found
    """
    result = await db.execute(select(User).where(User.email == email))
    return result.scalar_one_or_none()


async def get_user_by_clerk_id(db: AsyncSession, clerk_id: str) -> Optional[User]:
    """
    Get user by Clerk ID.

    Args:
        db: Database session
        clerk_id: Clerk user ID

    Returns:
        User object or None if not found
    """
    result = await db.execute(select(User).where(User.clerk_id == clerk_id))
    return result.scalar_one_or_none()
