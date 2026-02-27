from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.limiter import limiter
from app.core.security import (
    create_access_token,
    get_password_hash,
    verify_password,
    verify_password_mock,
)
from app.db.database import get_db
from app.db.schemas import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, UserWithToken

router = APIRouter()


@router.post("/register", response_model=UserWithToken, status_code=201)
@limiter.limit("5/minute")
async def register(request: Request, user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    """
    POST /auth/register
    Create a new user account
    Replica of /register route from Node.js
    """
    try:
        # Check if email already exists
        result = await db.execute(select(User).where(User.email == user_data.email))
        existing_user = result.scalar_one_or_none()

        if existing_user:
            raise HTTPException(status_code=400, detail="Something went wrong")

        # Hash password
        hashed_password = get_password_hash(user_data.password)

        # Create user with default role 'user'
        user = User(
            email=user_data.email,
            password=hashed_password,
            name=user_data.name,
            address=user_data.address,
            role="user",
        )

        db.add(user)
        await db.commit()
        await db.refresh(user)

        # Generate JWT token
        token = create_access_token({"userId": user.id, "role": user.role})

        # Return user without password
        user_response = UserResponse(
            id=user.id, email=user.email, role=user.role, name=user.name, address=user.address
        )

        return {"user": user_response, "token": token}

    except HTTPException:
        raise
    except Exception as e:
        print(e)
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
        # Find user by email
        result = await db.execute(select(User).where(User.email == credentials.email))
        user = result.scalar_one_or_none()

        if not user:
<<<<<<< fix/auth-timing-attack-15259610013706666787
            # Prevent timing attacks by simulating password verification
=======
            # Run dummy verification to prevent timing attacks (User Enumeration)
            # Pass the client password so both paths encode/hash the same input.
>>>>>>> master
            verify_password_mock(credentials.password)
            raise HTTPException(status_code=401, detail={"error": "Authentication failed"})

        # Verify password
        if not verify_password(credentials.password, user.password):
            raise HTTPException(status_code=401, detail={"error": "Authentication failed"})

        # Generate JWT token
        token = create_access_token({"userId": user.id, "role": user.role})

        # Return user without password
        user_response = UserResponse(
            id=user.id, email=user.email, role=user.role, name=user.name, address=user.address
        )

        return {"token": token, "user": user_response}

    except HTTPException:
        raise
    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Something went wrong")
