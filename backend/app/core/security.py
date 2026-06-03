import uuid
from datetime import UTC, datetime, timedelta
from typing import Optional

import bcrypt
import jwt
from jwt.exceptions import InvalidTokenError

from app.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Truncate to 72 bytes for bcrypt compatibility
    password_bytes = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))


# Dummy hash for timing attack mitigation (bcrypt hash of "dummy_password")
DUMMY_PASSWORD_HASH = b"$2b$12$VSqOIz9EJj/KYyG1GmblI.p4wGOpcsBE9ioEu0hYCcnsWcMFfFED."


def verify_password_mock(password: str) -> bool:
    """
    Simulate password verification for timing attack mitigation.
    Uses a dummy hash to ensure the operation takes the same amount of time
    as a real verification.
    """
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, DUMMY_PASSWORD_HASH)


def get_password_hash(password: str) -> str:
    """Hash a password (truncates to 72 bytes for bcrypt compatibility)"""
    # Bcrypt has a 72-byte limit, truncate if necessary
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict) -> str:
    """
    Create JWT access token
    Replica of generateUserToken from Node.js
    Uses same secret 'your-secret' and 60m expiration
    """
    to_encode = data.copy()
    now = datetime.now(UTC)
    expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "iat": now, "jti": str(uuid.uuid4())})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def create_refresh_token(data: dict) -> str:
    """
    Create JWT refresh token with longer expiration (30 days)
    """
    to_encode = data.copy()
    now = datetime.now(UTC)
    expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "iat": now, "jti": str(uuid.uuid4())})

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode JWT token (Access or Refresh)"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except InvalidTokenError:
        return None


def verify_refresh_token(token: str) -> Optional[dict]:
    """
    Verify a JWT refresh token signature and expiration.
    Returns decoded payload if valid.
    """
    return decode_token(token)
