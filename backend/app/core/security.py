from datetime import UTC, datetime, timedelta

import bcrypt
from jose import JWTError, jwt

from app.config import settings


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    # Truncate to 72 bytes for bcrypt compatibility
    password_bytes = plain_password.encode("utf-8")[:72]
    return bcrypt.checkpw(password_bytes, hashed_password.encode("utf-8"))


def get_password_hash(password: str) -> str:
    """Hash a password (truncates to 72 bytes for bcrypt compatibility)"""
    # Bcrypt has a 72-byte limit, truncate if necessary
    password_bytes = password.encode("utf-8")[:72]
    return bcrypt.hashpw(password_bytes, bcrypt.gensalt()).decode("utf-8")


# Dummy hash for timing attack prevention (bcrypt hash of "dummy", work factor 12).
# IMPORTANT: This hash uses work factor 12 to match bcrypt.gensalt() default used in
# get_password_hash(). If the work factor is ever changed there (e.g. bcrypt.gensalt(rounds=N)),
# this constant must be regenerated with the same factor, otherwise the timing equalization
# breaks and the user enumeration vulnerability reappears.
# To regenerate:
# python -c "import bcrypt; print(bcrypt.hashpw(b'dummy', bcrypt.gensalt(rounds=N)).decode())"
DUMMY_HASH = "$2b$12$2CWJp6XnIbqgSd62XLhcJeOehPZYLNMnjl5iPlJTYIA6yiZZ5n5.W"


def verify_password_mock(plain_password: str) -> bool:
    """
    Simulate password verification to prevent user enumeration via timing attacks.

    Called when a login attempt is made with an email that does not exist in the DB.
    Runs a full bcrypt comparison against DUMMY_HASH so the response time is comparable
    to a real verification, making it impossible for attackers to distinguish
    "email not found" from "wrong password" by measuring latency.

    Always returns False — the result must never be trusted.
    """
    verify_password(plain_password, DUMMY_HASH)
    return False


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
