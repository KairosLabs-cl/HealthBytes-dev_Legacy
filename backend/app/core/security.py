from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt

from app.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Truncate to 72 bytes for bcrypt compatibility
    password_bytes = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))


def verify_password_mock() -> bool:
    """
    Simulate password verification for timing attack mitigation.
    Uses a dummy hash to ensure the operation takes the same amount of time
    as a real verification.
    """
    # Dummy hash generated with 12 rounds (default for bcrypt)
    # $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.60rScphF.1kFBZGD/k/yB2.
    dummy_hash = b"$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxwKc.60rScphF.1kFBZGD/k/yB2."
    password_bytes = b"dummy_password"
    return bcrypt.checkpw(password_bytes, dummy_hash)


def get_password_hash(password: str) -> str:
    """Hash a password (truncates to 72 bytes for bcrypt compatibility)"""
    # Bcrypt has a 72-byte limit, truncate if necessary
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


def create_access_token(data: dict) -> str:
    """
    Create JWT access token
    Replica of generateUserToken from Node.js
    Uses same secret 'your-secret' and 30d expiration
    """
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})

    # Use 'your-secret' to match Node.js JWT_SECRET
    # In production, should use settings.JWT_SECRET
    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET,  # Using 'your-secret' like Node.js
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,  # Using 'your-secret' like Node.js
            algorithms=[settings.JWT_ALGORITHM],
        )
        return payload
    except JWTError:
        return None
