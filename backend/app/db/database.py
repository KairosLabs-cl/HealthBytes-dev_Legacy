import logging

import redis.asyncio as aioredis
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# Convert postgresql:// to postgresql+psycopg://
# Note: Using psycopg instead of asyncpg for Python 3.14 compatibility
***REDACTED_DATABASE_URL***

# SQLite (used in tests) doesn't support connection pool params
# Check for any SQLite variant (sqlite://, sqlite+aiosqlite://, sqlite+pysqlite://)
_is_sqlite = "sqlite" in ***REDACTED_DATABASE_URL***
_pool_kwargs = (
    {}
    if _is_sqlite
    else {
        "pool_size": 20,
        "max_overflow": 10,
        "pool_pre_ping": True,
        "pool_recycle": 3600,
    }
)

engine = create_async_engine(
    ***REDACTED_DATABASE_URL***
    echo=True if settings.ENVIRONMENT == "dev" else False,
    **_pool_kwargs,
)

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


# Dependency for database session injection
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


# Redis client for caching
_redis_logger = logging.getLogger(__name__)
_redis_client: "aioredis.Redis | None" = None


async def get_redis() -> "aioredis.Redis | None":
    """
    Returns a connected Redis client if REDIS_URL is configured.
    Returns None if Redis is unavailable — callers must handle this gracefully.
    """
    global _redis_client
    if not settings.REDIS_URL:
        return None
    if _redis_client is None:
        try:
            _redis_client = aioredis.from_url(
                settings.REDIS_URL,
                encoding="utf-8",
                decode_responses=True,
                socket_connect_timeout=2,
            )
            await _redis_client.ping()
            _redis_logger.info("Redis connected: %s", settings.REDIS_URL)
        except Exception as exc:
            _redis_logger.warning("Redis unavailable — cache disabled: %s", exc)
            _redis_client = None
    return _redis_client
