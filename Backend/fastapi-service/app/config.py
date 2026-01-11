from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv
import os

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    DATABASE_URL: str
    
    # JWT (Legacy - for backwards compatibility)
    JWT_SECRET: str = "your-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days like Node.js
    
    # Clerk Authentication
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    CLERK_SECRET_KEY: Optional[str] = None
    
    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None
    
    # Environment
    ENVIRONMENT: str = "dev"
    HOST: str = "0.0.0.0"
    PORT: int = 3001
    
    @property
    def clerk_jwks_url(self) -> str:
        """Get Clerk JWKS URL from publishable key"""
        if self.CLERK_PUBLISHABLE_KEY:
            # Extract frontend API from publishable key
            # pk_test_xxx -> xxx is base64 of frontend API
            import base64
            try:
                key_part = self.CLERK_PUBLISHABLE_KEY.split("_")[-1]
                # Remove trailing $ if present
                if key_part.endswith("$"):
                    key_part = key_part[:-1]
                frontend_api = base64.b64decode(key_part).decode()
                return f"https://{frontend_api}/.well-known/jwks.json"
            except Exception:
                pass
        return ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

