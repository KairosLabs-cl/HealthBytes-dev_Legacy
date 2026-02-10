from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Convert postgresql:// to postgresql+psycopg://
# Note: Using psycopg instead of asyncpg for Python 3.14 compatibility
***REDACTED_DATABASE_URL***

engine = create_async_engine(
    ***REDACTED_DATABASE_URL***
    echo=True if settings.ENVIRONMENT == "dev" else False,
    pool_size=20,          # Optimized for Supavisor
    max_overflow=10,       # Allow some burst connections
    pool_pre_ping=True,    # Robust connection handling
    pool_recycle=3600      # Avoid stale connections
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
