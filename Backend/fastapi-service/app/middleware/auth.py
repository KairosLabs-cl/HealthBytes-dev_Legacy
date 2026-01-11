from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import httpx
import jwt
from jwt import PyJWKClient

from app.utils.security import decode_token
from app.db.database import get_db
from app.db.schemas import User
from app.config import settings

security = HTTPBearer(auto_error=False)

# Cache for Clerk JWKS client
_clerk_jwks_client: Optional[PyJWKClient] = None


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
    jwks_client = get_clerk_jwks_client()
    if not jwks_client:
        return None
    
    try:
        # Get the signing key from Clerk's JWKS
        signing_key = jwks_client.get_signing_key_from_jwt(token)
        
        # Decode and verify the token
        payload = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_aud": False}  # Clerk doesn't always set audience
        )
        return payload
    except Exception as e:
        print(f"Clerk token verification failed: {e}")
        return None


async def get_current_user(
    authorization: Optional[str] = Header(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access denied"
        )
    
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
                result = await db.execute(
                    select(User).where(User.clerk_id == clerk_user_id)
                )
                user = result.scalar_one_or_none()
                
                if user:
                    return user
                
                # If no user found by clerk_id, we might need to create one
                # For now, we'll try legacy lookup or fail
    
    # Fallback: Try legacy JWT token
    payload = decode_token(token)
    
    if payload:
        user_id = payload.get("userId")
        if user_id:
            result = await db.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                return user
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Access denied"
    )


async def get_current_user_optional(
    authorization: Optional[str] = Header(None),
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: AsyncSession = Depends(get_db)
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
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access denied"
        )
    return current_user


async def verify_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    Verify that current user has admin role
    """
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access denied"
        )
    return current_user
