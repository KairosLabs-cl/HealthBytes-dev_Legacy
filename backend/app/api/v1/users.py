from fastapi import APIRouter, Depends, HTTPException, Query
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.db.database import get_db
from app.db.schemas import User
from app.schemas.user import UserResponse, UserUpdate
from app.middleware.auth import get_current_user, verify_admin
from app.core.security import get_password_hash

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_admin),
):
    """
    GET /users
    List all users (Admin only)
    """
    try:
        result = await db.execute(select(User).offset(skip).limit(limit))
        users = result.scalars().all()

        return [
            UserResponse(
                id=user.id,
                email=user.email,
                role=user.role,
                name=user.name,
                address=user.address,
            )
            for user in users
        ]
    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.get("/{id}", response_model=UserResponse)
async def get_user_by_id(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    GET /users/:id
    Get user by ID (Admin or Own Profile)
    """
    try:
        # Check permissions: Admin or Own Profile
        if current_user.role != "admin" and current_user.id != id:
            raise HTTPException(
                status_code=403, detail="Not authorized to access this profile"
            )

        result = await db.execute(select(User).where(User.id == id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            name=user.name,
            address=user.address,
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting user {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/{id}", response_model=UserResponse)
async def update_user(
    id: int,
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PUT /users/:id
    Update user profile (Admin or Own Profile)
    """
    try:
        # Check permissions: Admin or Own Profile
        if current_user.role != "admin" and current_user.id != id:
            raise HTTPException(
                status_code=403, detail="Not authorized to update this profile"
            )

        result = await db.execute(select(User).where(User.id == id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields
        update_data = user_data.dict(exclude_unset=True)

        # Hash password if provided
        if "password" in update_data and update_data["password"]:
            update_data["password"] = get_password_hash(update_data["password"])

        for key, value in update_data.items():
            setattr(user, key, value)

        await db.commit()
        await db.refresh(user)

        return UserResponse(
            id=user.id,
            email=user.email,
            role=user.role,
            name=user.name,
            address=user.address,
        )
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error updating user {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.delete("/{id}", status_code=204)
async def delete_user(
    id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(verify_admin),
):
    """
    DELETE /users/:id
    Delete a user (Admin only)
    """
    try:
        result = await db.execute(select(User).where(User.id == id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        await db.delete(user)
        await db.commit()

        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(f"Error deleting user {id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
