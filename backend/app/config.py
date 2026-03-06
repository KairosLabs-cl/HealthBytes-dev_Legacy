import logging
from typing import Optional

from dotenv import load_dotenv
from pydantic import ConfigDict
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

load_dotenv()


class Settings(BaseSettings):
    """Application settings"""

    # Database
    ***REDACTED_DATABASE_URL***

    # JWT (Legacy - for backwards compatibility)
    JWT_SECRET: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 43200  # 30 days like Node.js

    # Clerk Authentication
    CLERK_PUBLISHABLE_KEY: Optional[str] = None
    ***REDACTED_CLERK_SECRET_KEY***

    # Mercado Pago
    ***REDACTED_MERCADOPAGO_TOKEN***
    MERCADO_PAGO_WEBHOOK_SECRET: Optional[str] = None

    # Email (Resend)
    ***REDACTED_RESEND_KEY***
    EMAIL_FROM_ADDRESS: str = "HealthBytes <onboarding@resend.dev>"

    # URLs for callbacks (required in production — no localhost defaults)
    BACKEND_URL: Optional[str] = None
    FRONTEND_URL: Optional[str] = None

    # Environment
    ENVIRONMENT: str = "dev"
    HOST: str = "127.0.0.1"
    PORT: int = 3001
    # Default max request body size for general API requests.
    # 10 MB supports typical e-commerce JSON payloads and small media.
    # Larger per-route limits (e.g., for image/document uploads) should be
    # configured using FastAPI's upload mechanisms and not rely on this default.
    MAX_REQUEST_BODY_SIZE: int = 10 * 1024 * 1024  # 10 MB
    ENABLE_DIAGNOSTIC_ENDPOINTS: bool = False
    DEV_BYPASS_AUTH: bool = False

    # Observability
    SENTRY_DSN: Optional[str] = None  # Set in production for error tracking

    # Redis (optional — product cache)
    REDIS_URL: Optional[str] = None
    REDIS_CACHE_TTL_SECONDS: int = 300  # 5 minutes

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
                frontend_api = base64.b64decode(key_part).decode("utf-8")

                # Clean the domain: remove any trailing $, whitespace, or invalid characters
                # Only keep valid domain characters (letters, numbers, dots, hyphens)
                frontend_api = frontend_api.rstrip("$").strip()
                # Remove any non-domain characters from the end
                frontend_api = re.sub(r"[^a-zA-Z0-9.\-]+$", "", frontend_api)

                return f"https://{frontend_api}/.well-known/jwks.json"
            except Exception as e:
                logger.error("Error generating JWKS URL: %s", type(e).__name__)
        return ""

    model_config = ConfigDict(env_file=".env", case_sensitive=True, extra="ignore")


settings = Settings()


def _validate_production_config(s: Settings) -> None:
    """Raise if critical production secrets are missing when ENVIRONMENT=production."""
    if getattr(s, "ENVIRONMENT", "development") != "production":
        return
    required = {
        "***REDACTED_DATABASE_URL***
        "MERCADO_PAGO_WEBHOOK_SECRET": (
            s.MERCADO_PAGO_WEBHOOK_SECRET if hasattr(s, "MERCADO_PAGO_WEBHOOK_SECRET") else None
        ),
        "***REDACTED_CLERK_SECRET_KEY***
        "BACKEND_URL": s.BACKEND_URL,
        "FRONTEND_URL": s.FRONTEND_URL,
    }
    missing = [k for k, v in required.items() if not v]
    if missing:
        raise RuntimeError(f"Production environment requires these secrets to be set: {missing}")


_validate_production_config(settings)
