"""Auth service - Authentication and user registration logic."""

from typing import Optional

from app.core.security import get_password_hash, verify_password
from app.db.schemas import User
from app.schemas.user import UserCreate
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


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
        raise ValueError("Email already registered")

    # Create user with hashed password
    hashed_password = get_password_hash(user_in.password)
    db_user = User(
        email=user_in.email, password=hashed_password, role=getattr(user_in, "role", "customer")
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

    if not user:
        return None

    # Verify password
    if not verify_password(password, user.password):
        return None

    return user


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
