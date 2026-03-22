"""User service - User management business logic."""

from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.schemas import User
from app.schemas.user import UserUpdate


async def get_user(db: AsyncSession, user_id: str) -> Optional[User]:
    """
    Get user by ID.

    Args:
        db: Database session
        user_id: User ID

    Returns:
        User object or None if not found
    """
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def update_user(db: AsyncSession, user_id: str, user_in: UserUpdate) -> Optional[User]:
    """
    Update user information.

    Args:
        db: Database session
        user_id: User ID to update
        user_in: User data to update

    Returns:
        Updated User object or None if not found
    """
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()

    if not db_user:
        return None

    # Update only provided fields
    update_data = user_in.model_dump(exclude_unset=True)

    # Defense in depth: explicitly drop protected fields to prevent mass assignment
    protected_fields = {"id", "clerk_id"}
    safe_update_data = {k: v for k, v in update_data.items() if k not in protected_fields}

    for field, value in safe_update_data.items():
        setattr(db_user, field, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_dietary_preferences(
    db: AsyncSession, user_id: int, tags: list[str]
) -> Optional[User]:
    """
    Update a user's dietary preferences.

    Args:
        db: Database session
        user_id: User ID to update
        tags: List of dietary tag slugs (e.g. ["sin-gluten", "vegano"])

    Returns:
        Updated User object or None if not found
    """
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        return None

    user.dietary_preferences = tags
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: str) -> bool:
    """
    Delete user by ID.

    Args:
        db: Database session
        user_id: User ID to delete

    Returns:
        True if deleted, False if not found
    """
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()

    if not db_user:
        return False

    await db.delete(db_user)
    await db.commit()
    return True
