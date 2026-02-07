from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from app.config import settings

# Convert postgresql:// to postgresql+psycopg://
# Note: Using psycopg instead of asyncpg for Python 3.14 compatibility
DATABASE_URL = settings.DATABASE_URL.replace(
    "postgresql://", "postgresql+psycopg://"
)

engine = create_async_engine(
    DATABASE_URL, 
    echo=True if settings.ENVIRONMENT == "dev" else False,
    pool_size=20,          # Optimized for Supavisor
    max_overflow=10,       # Allow some burst connections
    pool_pre_ping=True,    # Robust connection handling
    pool_recycle=3600      # Avoid stale connections
)

AsyncSessionLocal = sessionmaker(
    engine, 
    class_=AsyncSession, 
    expire_on_commit=False
)

Base = declarative_base()


# Dependency for database session injection
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
