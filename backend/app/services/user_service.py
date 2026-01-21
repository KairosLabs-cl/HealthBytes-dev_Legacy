"""User service - User management business logic."""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.db.schemas import User
from app.schemas.user import UserUpdate


async def get_user(
    db: AsyncSession,
    user_id: str
) -> Optional[User]:
    """
    Get user by ID.
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        User object or None if not found
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    return result.scalar_one_or_none()


async def update_user(
    db: AsyncSession,
    user_id: str,
    user_in: UserUpdate
) -> Optional[User]:
    """
    Update user information.
    
    Args:
        db: Database session
        user_id: User ID to update
        user_in: User data to update
        
    Returns:
        Updated User object or None if not found
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        return None
    
    # Update only provided fields
    update_data = user_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_user, field, value)
    
    await db.commit()
    await db.refresh(db_user)
    return db_user


async def delete_user(
    db: AsyncSession,
    user_id: str
) -> bool:
    """
    Delete user by ID.
    
    Args:
        db: Database session
        user_id: User ID to delete
        
    Returns:
        True if deleted, False if not found
    """
    result = await db.execute(
        select(User).where(User.id == user_id)
    )
    db_user = result.scalar_one_or_none()
    
    if not db_user:
        return False
    
    await db.delete(db_user)
    await db.commit()
    return True
