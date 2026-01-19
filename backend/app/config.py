from pydantic_settings import BaseSettings
from typing import Optional
from dotenv import load_dotenv

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""
    
    # Database
    ***REDACTED_DATABASE_URL***
    
    # JWT (Legacy - for backwards compatibility)
    JWT_SECRET: str = "your-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days like Node.js
    
    # Clerk Authentication
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    ***REDACTED_CLERK_SECRET_KEY***
    
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
            import re
            try:
                # Remove any whitespace and get the last part after the last underscore
                key_clean = self.CLERK_PUBLISHABLE_KEY.strip()
                key_part = key_clean.split("_")[-1]
                
                # Remove trailing $ if present (sometimes Clerk keys have this)
                if key_part.endswith("$"):
                    key_part = key_part[:-1]
                
                # Decode base64 to get the frontend API domain
                frontend_api = base64.b64decode(key_part).decode('utf-8')
                
                # Clean the domain: remove any trailing $, whitespace, or invalid characters
                # Only keep valid domain characters (letters, numbers, dots, hyphens)
                frontend_api = frontend_api.rstrip('$').strip()
                # Remove any non-domain characters from the end
                frontend_api = re.sub(r'[^a-zA-Z0-9.\-]+$', '', frontend_api)
                
                return f"https://{frontend_api}/.well-known/jwks.json"
            except Exception as e:
                print(f"Error generating JWKS URL: {e}")
                if 'key_part' in locals():
                    print(f"Publishable key part: {key_part}")
                if 'frontend_api' in locals():
                    print(f"Decoded frontend API: {frontend_api}")
                pass
        return ""
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

