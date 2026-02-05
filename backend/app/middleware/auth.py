import logging
from typing import Optional

import jwt
from app.config import settings
from app.core.security import decode_token
from app.db.database import get_db
from app.db.schemas import User
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

security = HTTPBearer(auto_error=False)

logger = logging.getLogger(__name__)

# Cache for Clerk JWKS client
_clerk_jwks_client: Optional[PyJWKClient] = None
_jwks_client_warned = False
_jwks_verify_warned = False
_jwks_decode_warned = False


def get_clerk_jwks_client() -> Optional[PyJWKClient]:
    """Get or create Clerk JWKS client"""
    global _clerk_jwks_client
    if _clerk_jwks_client is None and settings.clerk_jwks_url:
        _clerk_jwks_client = PyJWKClient(settings.clerk_jwks_url)
    return _clerk_jwks_client


def verify_clerk_token(token: str) -> Optional[dict]:
    """
    Verify a Clerk JWT token using JWKS
    Returns the decoded payload or None if verification fails
    """
    global _jwks_client_warned, _jwks_verify_warned, _jwks_decode_warned

    jwks_client = get_clerk_jwks_client()
    if not jwks_client:
        # If JWKS client can't be created, try to decode without verification
        # This is a fallback for development when JWKS URL is not accessible
        if settings.ENVIRONMENT == "dev":
            try:
                if not _jwks_client_warned:
                    logger.warning(
                        "JWKS client not available, decoding token without verification (dev mode only)"
                    )
                    _jwks_client_warned = True
                payload = jwt.decode(token, options={"verify_signature": False})
                # Basic validation: check if it looks like a Clerk token
                if payload.get("sub") and payload.get("iss"):
                    return payload
            except Exception as e:
                if not _jwks_decode_warned:
                    logger.warning("Failed to decode token without verification: %s", e)
                    _jwks_decode_warned = True
        return None

    try:
        # Get the signing key from Clerk's JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk doesn't always set audience
        )
        return payload
    except Exception as e:
        message = str(e)
        if "Signature has expired" not in message:
            if not _jwks_verify_warned:
                logger.warning("Clerk token verification failed: %s", e)
                _jwks_verify_warned = True
        # Fallback for development: try to decode without verification
        if settings.ENVIRONMENT == "dev":
            try:
                if not _jwks_client_warned:
                    logger.warning(
                        "JWKS verification failed, decoding token without verification (dev mode only)"
                    )
                    _jwks_client_warned = True
                payload = jwt.decode(token, options={"verify_signature": False})
                # Basic validation: check if it looks like a Clerk token
                if payload.get("sub") and payload.get("iss"):
                    return payload
            except Exception as decode_error:
                if not _jwks_decode_warned:
                    logger.warning("Failed to decode token without verification: %s", decode_error)
                    _jwks_decode_warned = True
        return None


async def get_current_user(
    authorization: Optional[str] = Header(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """
    Verify JWT token and return current user
    Supports both Clerk tokens and legacy JWT tokens
    """
    token = None

    # Try to get token from HTTPBearer (format: "Bearer <token>")
    if credentials:
        token = credentials.credentials
    # If not found, try to get directly from Authorization header (format: "<token>")
    elif authorization:
        # Remove "Bearer " prefix if present
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access denied")

    user_id = None
    clerk_user_id = None

    # First, try to verify as Clerk token
    if settings.CLERK_PUBLISHABLE_KEY:
        clerk_payload = verify_clerk_token(token)
        if clerk_payload:
            # Clerk tokens have 'sub' as the user ID
            clerk_user_id = clerk_payload.get("sub")

            if clerk_user_id:
                # Look up user by clerk_id first, then create if not exists
                result = await db.execute(select(User).where(User.clerk_id == clerk_user_id))
                user = result.scalar_one_or_none()

                if user:
                    return user

                # If no user found by clerk_id, try to decode token without verification
                # and create user if needed (for development when JWKS fails)
                try:
                    # Decode without verification to get user info
                    decoded = jwt.decode(token, options={"verify_signature": False})
                    email = decoded.get("email") or decoded.get("primary_email_address")

                    # Create new user with Clerk ID
                    new_user = User(
                        clerk_id=clerk_user_id,
                        email=email or f"user_{clerk_user_id[:8]}@example.com",
                        role="customer",
                    )
                    db.add(new_user)
                    await db.commit()
                    await db.refresh(new_user)
                    return new_user
                except Exception as e:
                    logger.warning("Error creating user from Clerk token: %s", e)
                    # Fall through to try legacy JWT

    # Fallback: Try legacy JWT token
    payload = decode_token(token)

    if payload:
        user_id = payload.get("userId")
        if user_id:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                return user

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access denied")


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    """
    Optional version - returns None if no valid token
    """
    try:
        return await get_current_user(authorization, credentials, db)
    except HTTPException:
        return None


async def verify_seller(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that current user has seller role
    Replica of verifySeller middleware from Node.js
    """
    if current_user.role != "seller":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access denied")
    return current_user


async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that current user has admin role
    """
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access denied")
    return current_user
