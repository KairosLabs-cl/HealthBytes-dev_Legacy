"""
Shared rate limiter instance.

Import this in routers to apply per-endpoint limits:

    from app.core.limiter import limiter

    @router.post("/login")
    @limiter.limit("5/minute")
    async def login(request: Request, ...):
        ...

Global default (300/minute) is applied via SlowAPIMiddleware in main.py.
This limit is per user_id (when authenticated) or per IP (when not).
Stricter per-endpoint limits override the global default for sensitive operations.
"""

from fastapi import Request
from slowapi import Limiter

from app.config import settings


def get_identifier(request: Request) -> str:
    """
    Identify rate limit by user_id when authenticated, otherwise by IP.

    This allows:
    - Authenticated users: 300 req/min per user (sufficient for active usage)
    - Anonymous users: 300 req/min per IP (for browsing without auth)
    - Sensitive endpoints: Override with stricter limits (e.g., 5/minute for login)

    Why 300/minute?
    A typical user flow in the app:
    - App load: ~10 requests (auth, products, cart, favorites)
    - Navigation: ~3 requests per page
    - Adding to cart: ~2 requests per item
    - Search/filter: ~2 requests per action

    Active usage can easily generate 40-60 requests/minute.
    300/minute = 5 req/second allows comfortable headroom without enabling abuse.
    """
    user = getattr(request.state, "user", None)
    if user and hasattr(user, "id"):
        return f"user:{user.id}"

    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    client = request.client
    return client.host if client else "unknown"


storage_uri = settings.REDIS_URL if settings.REDIS_URL else "memory://"

# Enforce Redis in production for persistent rate limiting
if settings.ENVIRONMENT == "production":
    if not settings.REDIS_URL or settings.REDIS_URL.startswith("memory://"):
        raise RuntimeError(
            "Production environment requires a valid REDIS_URL for rate limiting. "
            "In-memory storage is not supported for production deployments."
        )

limiter = Limiter(
    key_func=get_identifier,
    default_limits=["300/minute"],
    storage_uri=storage_uri,
)
