import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db.database import get_db
from app.db.schemas import User
from app.middleware.auth import get_current_user, verify_admin
from app.schemas.user import DietaryPreferencesUpdate, UserResponse, UserUpdate
from app.services import user_service

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
                dietary_preferences=user.dietary_preferences or [],
            )
            for user in users
        ]
    except Exception as e:
        logger.error("Error listing users: %s", type(e).__name__)
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
            raise HTTPException(status_code=403, detail="Not authorized to access this profile")

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
        logger.error("Error getting user %s: %s", id, type(e).__name__)
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
            raise HTTPException(status_code=403, detail="Not authorized to update this profile")

        result = await db.execute(select(User).where(User.id == id))
        user = result.scalar_one_or_none()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update fields
        update_data = user_data.model_dump(exclude_unset=True)

        # Prevent privilege escalation: non-admins cannot change roles
        if current_user.role != "admin" and "role" in update_data:
            update_data.pop("role")

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
        logger.error("Error updating user %s: %s", id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/me/dietary-preferences", response_model=UserResponse)
async def update_my_dietary_preferences(
    request: DietaryPreferencesUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    PUT /users/me/dietary-preferences
    Update the authenticated user's dietary preferences.

    Used by the onboarding flow and profile settings.
    """
    try:
        user = await user_service.update_dietary_preferences(
            db=db, user_id=current_user.id, tags=request.tags
        )
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse.model_validate(user)
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error(
            "Error updating dietary preferences for user %s: %s",
            current_user.id,
            type(e).__name__,
        )
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
        logger.error("Error deleting user %s: %s", id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")
