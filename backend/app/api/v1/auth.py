import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.limiter import limiter
from app.db.database import get_db
from app.schemas.user import TokenRefresh, UserCreate, UserLogin, UserWithToken
from app.services import auth_service

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post("/register", response_model=UserWithToken, status_code=201)
@limiter.limit("10/minute")
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    POST /auth/register
    Create a new user account
    Replica of /register route from Node.js
    """
    try:
        return await auth_service.register_with_token(db, user_data)

    except ValueError:
        raise HTTPException(status_code=400, detail="Something went wrong")
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Registration failed: %s", type(e).__name__)
        await db.rollback()
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.post("/login", response_model=UserWithToken)
@limiter.limit("10/minute")
async def login(request: Request, credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    POST /auth/login
    Authenticate user and return JWT token
    Replica of /login route from Node.js
    """
    try:
        payload = await auth_service.login_with_token(db, credentials)
        if not payload:
            raise HTTPException(status_code=401, detail={"error": "Authentication failed"})

        return payload

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Login failed: %s", type(e).__name__)
        raise HTTPException(status_code=500, detail="Something went wrong")


@router.post("/refresh", response_model=UserWithToken)
@limiter.limit("5/minute")
async def refresh(
    request: Request, refresh_data: TokenRefresh, db: AsyncSession = Depends(get_db)
):
    """
    POST /auth/refresh
    Refresh access token using a refresh token
    """
    try:
        payload = await auth_service.refresh_access_token(db, refresh_data.refresh_token)
        if not payload:
            raise HTTPException(status_code=401, detail="Invalid refresh token")

        return payload

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Token refresh failed: %s", type(e).__name__)
        raise HTTPException(status_code=500, detail="Something went wrong")
