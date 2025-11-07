from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against a hash"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a password"""
    return pwd_context.hash(password)


def create_access_token(data: dict) -> str:
    """
    Create JWT access token
    Replica of generateUserToken from Node.js
    Uses same secret 'your-secret' and 30d expiration
    """
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
    )
    to_encode.update({"exp": expire})
    
    # Use 'your-secret' to match Node.js JWT_SECRET
    # In production, should use settings.JWT_SECRET
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.JWT_SECRET,  # Using 'your-secret' like Node.js
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def decode_token(token: str) -> dict:
    """Decode JWT token"""
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET,  # Using 'your-secret' like Node.js
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError:
        return None
