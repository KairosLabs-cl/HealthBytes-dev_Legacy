import logging
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.db.schemas import User
from app.middleware.auth import get_current_user, verify_admin
from app.schemas.user import (
    AdminUserUpdate,
    DietaryPreferencesUpdate,
    PushTokenUpdate,
    UserResponse,
    UserUpdate,
)
from app.services import user_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=List[UserResponse])
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
        users = await user_service.list_users(db, skip=skip, limit=limit)

        return [UserResponse.model_validate(user) for user in users]
    except Exception as e:
        logger.error("Error listing users: %s", type(e).__name__)
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


@router.patch("/me/push-token")
async def update_push_token(
    data: PushTokenUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    PATCH /users/me/push-token
    Store Expo push notification token for the authenticated user.
    """
    try:
        await user_service.update_push_token(db, current_user, data.token)

        return {"ok": True}
    except Exception as e:
        await db.rollback()
        logger.error(
            "Error updating push token for user %s: %s",
            current_user.id,
            type(e).__name__,
        )
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
        user = await user_service.get_user_for_profile(db, id, current_user)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse.model_validate(user)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Error getting user %s: %s", id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/me", response_model=UserResponse)
async def update_me(
    user_data: UserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PUT /users/me
    Update own profile (no ID needed).
    """
    try:
        user = await user_service.update_current_user(db, current_user, user_data)
        return UserResponse.model_validate(user)
    except Exception as e:
        await db.rollback()
        logger.error("Error updating own profile user %s: %s", current_user.id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.put("/{id}", response_model=UserResponse)
async def update_user(
    id: int,
    user_data: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    PUT /users/:id
    Update user profile (Admin or Own Profile)
    """
    try:
        user = await user_service.update_user_for_request(db, id, user_data, current_user)

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        return UserResponse.model_validate(user)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Error updating user %s: %s", id, type(e).__name__)
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
        deleted = await user_service.delete_user(db, id)
        if not deleted:
            raise HTTPException(status_code=404, detail="User not found")

        return None
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        logger.error("Error deleting user %s: %s", id, type(e).__name__)
        raise HTTPException(status_code=500, detail="Internal Server Error")
