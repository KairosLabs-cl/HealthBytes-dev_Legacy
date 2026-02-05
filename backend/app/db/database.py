from app.config import settings
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Convert postgresql:// to postgresql+psycopg://
# Note: Using psycopg instead of asyncpg for Python 3.14 compatibility
***REDACTED_DATABASE_URL***

engine = create_async_engine(***REDACTED_DATABASE_URL***

AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()


# Dependency for database session injection
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
