"""User service - User management business logic."""

from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db.schemas import User
from app.schemas.user import AdminUserUpdate, UserUpdate

ALLOWED_USER_FIELDS = {"name", "address", "password", "dietary_preferences"}
ALLOWED_ADMIN_FIELDS = ALLOWED_USER_FIELDS | {"email", "role"}


async def get_user(db: AsyncSession, user_id: str | int) -> Optional[User]:
    """Get user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


async def list_users(db: AsyncSession, skip: int = 0, limit: int = 100) -> Sequence[User]:
    """List users with pagination."""
    result = await db.execute(select(User).offset(skip).limit(limit))
    return result.scalars().all()


async def get_user_for_profile(
    db: AsyncSession, user_id: int, current_user: User
) -> Optional[User]:
    """Return a user when requester is admin or owns the profile."""
    if current_user.role != "admin" and current_user.id != user_id:
        raise PermissionError("Not authorized to access this profile")

    return await get_user(db, user_id)


async def update_user(db: AsyncSession, user_id: str | int, user_in: UserUpdate) -> Optional[User]:
    """Update user information with protected fields removed."""
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()

    if not db_user:
        return None

    update_data = user_in.model_dump(exclude_unset=True)
    protected_fields = {"id", "clerk_id"}
    safe_update_data = {k: v for k, v in update_data.items() if k not in protected_fields}

    for field, value in safe_update_data.items():
        setattr(db_user, field, value)

    await db.commit()
    await db.refresh(db_user)
    return db_user


async def update_current_user(db: AsyncSession, current_user: User, user_in: UserUpdate) -> User:
    """Update fields a regular user is allowed to modify on themselves."""
    update_data = user_in.model_dump(exclude_unset=True)
    safe_update_data = {k: v for k, v in update_data.items() if k in ALLOWED_USER_FIELDS}

    if "password" in safe_update_data and safe_update_data["password"]:
        safe_update_data["password"] = get_password_hash(safe_update_data["password"])

    for key, value in safe_update_data.items():
        setattr(current_user, key, value)

    await db.commit()
    await db.refresh(current_user)
    return current_user


async def update_user_for_request(
    db: AsyncSession,
    user_id: int,
    user_in: AdminUserUpdate,
    current_user: User,
) -> Optional[User]:
    """Update a user profile when requester is admin or owns the profile."""
    is_admin = current_user.role == "admin"
    if not is_admin and current_user.id != user_id:
        raise PermissionError("Not authorized to update this profile")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return None

    update_data = user_in.model_dump(exclude_unset=True)
    allowed = ALLOWED_ADMIN_FIELDS if is_admin else ALLOWED_USER_FIELDS
    safe_update_data = {k: v for k, v in update_data.items() if k in allowed}

    if "password" in safe_update_data and safe_update_data["password"]:
        safe_update_data["password"] = get_password_hash(safe_update_data["password"])

    for key, value in safe_update_data.items():
        setattr(user, key, value)

    await db.commit()
    await db.refresh(user)
    return user


async def update_dietary_preferences(
    db: AsyncSession, user_id: int, tags: list[str]
) -> Optional[User]:
    """Update a user's dietary preferences."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    if not user:
        return None

    user.dietary_preferences = tags
    await db.commit()
    await db.refresh(user)
    return user


async def update_push_token(db: AsyncSession, user: User, token: str) -> User:
    """Store an Expo push token for a user."""
    user.expo_push_token = token
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: str | int) -> bool:
    """Delete user by ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    db_user = result.scalar_one_or_none()

    if not db_user:
        return False

    await db.delete(db_user)
    await db.commit()
    return True
