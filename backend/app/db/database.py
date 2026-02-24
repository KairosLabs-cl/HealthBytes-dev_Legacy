from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.config import settings

# Convert postgresql:// to postgresql+psycopg://
# Note: Using psycopg instead of asyncpg for Python 3.14 compatibility
***REDACTED_DATABASE_URL***

# SQLite (used in tests) doesn't support connection pool params
_is_sqlite = ***REDACTED_DATABASE_URL***
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
