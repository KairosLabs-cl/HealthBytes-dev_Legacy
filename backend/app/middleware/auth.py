import logging
from typing import Optional

import jwt
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWKClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.core.security import decode_token
from app.db.database import get_db
from app.db.schemas import User

security = HTTPBearer(auto_error=False)

logger = logging.getLogger(__name__)

# Cache for Clerk JWKS client
_clerk_jwks_client: Optional[PyJWKClient] = None
_jwks_client_warned = False
_jwks_verify_warned = False


def get_clerk_jwks_client() -> Optional[PyJWKClient]:
    """Get or create Clerk JWKS client"""
    global _clerk_jwks_client
    if _clerk_jwks_client is None and settings.clerk_jwks_url:
        _clerk_jwks_client = PyJWKClient(settings.clerk_jwks_url)
    return _clerk_jwks_client


def verify_clerk_token(token: str) -> Optional[dict]:
    """
    Verify a Clerk JWT token using JWKS.
    Returns the decoded payload or None if verification fails.

    SECURITY: Always verifies signature cryptographically. Never decodes
    without verification. If JWKS is unavailable, authentication fails
    (fail-closed).
    """
    global _jwks_client_warned, _jwks_verify_warned

    jwks_client = get_clerk_jwks_client()
    if not jwks_client:
        if not _jwks_client_warned:
            logger.warning("JWKS client not available — Clerk token verification disabled")
            _jwks_client_warned = True
        return None

    try:
        signing_key = jwks_client.get_signing_key_from_jwt(token)

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
                logger.warning("Clerk token verification failed: %s", type(e).__name__)
                _jwks_verify_warned = True
        return None


async def get_current_user(
    authorization: Optional[str] = Header(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Verify JWT token and return current user.
    Supports both Clerk tokens (JWKS-verified) and legacy JWT tokens.

    SECURITY: All tokens are cryptographically verified. The only bypass is
    DEV_BYPASS_AUTH=true in dev, which skips token checks entirely and returns
    a default test user.
    """
    # DEV_BYPASS_AUTH: opt-in bypass for local development without tokens
    if settings.ENVIRONMENT == "dev" and settings.DEV_BYPASS_AUTH:
        result = await db.execute(select(User).limit(1))
        user = result.scalar_one_or_none()
        if user:
            return user
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="DEV_BYPASS_AUTH enabled but no users in database",
        )

    token = None

    # Try to get token from HTTPBearer (format: "Bearer <token>")
    if credentials:
        token = credentials.credentials
    # If not found, try to get directly from Authorization header
    elif authorization:
        if authorization.startswith("Bearer "):
            token = authorization[7:]
        else:
            token = authorization

    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Access denied")

    # First, try to verify as Clerk token
    if settings.CLERK_PUBLISHABLE_KEY:
        clerk_payload = verify_clerk_token(token)
        if clerk_payload:
            clerk_user_id = clerk_payload.get("sub")

            if clerk_user_id:
                result = await db.execute(select(User).where(User.clerk_id == clerk_user_id))
                user = result.scalar_one_or_none()

                if user:
                    return user

                # Auto-create user from verified Clerk payload
                try:
                    email = clerk_payload.get("email") or clerk_payload.get("primary_email_address")

                    # Check for email collision before creating
                    if email:
                        existing_result = await db.execute(select(User).where(User.email == email))
                        existing_user = existing_result.scalar_one_or_none()
                        if existing_user:
                            # Email exists under different Clerk ID — update clerk_id
                            existing_user.clerk_id = clerk_user_id
                            await db.commit()
                            await db.refresh(existing_user)
                            return existing_user

                    new_user = User(
                        clerk_id=clerk_user_id,
                        email=email or f"user_{clerk_user_id[:8]}@example.com",
                        role="customer",
                    )
                    db.add(new_user)
                    await db.commit()
                    await db.refresh(new_user)
                    return new_user
                except Exception:
                    await db.rollback()
                    logger.warning("Error creating user from Clerk token")

    # Fallback: Try legacy JWT token (signature-verified via decode_token)
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
