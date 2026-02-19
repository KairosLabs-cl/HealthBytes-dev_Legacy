"""
Shared rate limiter instance.

Import this in routers to apply per-endpoint limits:

    from app.core.limiter import limiter

    @router.post("/login")
    @limiter.limit("5/minute")
    async def login(request: Request, ...):
        ...

Global default (120/minute) is applied via SlowAPIMiddleware in main.py.
Stricter per-endpoint limits override the global default.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["120/minute"],
    storage_uri="memory://",
)
