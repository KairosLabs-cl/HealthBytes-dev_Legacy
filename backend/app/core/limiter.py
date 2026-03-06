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
    # Try to get user_id from request state (set by auth middleware)
    user = getattr(request.state, "user", None)
    if user and hasattr(user, "id"):
        return f"user:{user.id}"

    # Fallback to IP for unauthenticated requests
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    client = request.client
    return client.host if client else "unknown"


limiter = Limiter(
    key_func=get_identifier,
    default_limits=["300/minute"],
    storage_uri="memory://",
)
