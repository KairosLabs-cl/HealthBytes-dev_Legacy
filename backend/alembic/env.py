"""
Alembic environment configuration for HealthBytes.

Uses async engine (psycopg3) to match the application's async SQLAlchemy setup.
Run migrations with:
    alembic upgrade head
    alembic revision --autogenerate -m "description"
    alembic downgrade -1
"""

import asyncio
import logging
from logging.config import fileConfig

from sqlalchemy import pool
from sqlalchemy.engine import Connection

from alembic import context

# ---------------------------------------------------------------------------
# Import app config and all models so autogenerate can detect schema changes
# ---------------------------------------------------------------------------
from app.config import settings  # noqa: E402
from app.db.database import Base  # noqa: E402, F401

# Import all SQLAlchemy models — required for autogenerate
import app.db.schemas  # noqa: E402, F401 — Product, DietaryTag, User, UserFavorite, Order, OrderItem, CartItem
from app.db.models.address import Address  # noqa: E402, F401
from app.db.models.payment import Payment  # noqa: E402, F401

logger = logging.getLogger("alembic.env")

# ---------------------------------------------------------------------------
# Alembic Config
# ---------------------------------------------------------------------------
config = context.config

# Build the async DB URL from settings (bypasses ConfigParser % interpolation issues)
db_url = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://")

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata with all registered models for autogenerate support
target_metadata = Base.metadata


# ---------------------------------------------------------------------------
# Migration helpers
# ---------------------------------------------------------------------------


def run_migrations_offline() -> None:
    """Run migrations without a DB connection (generates SQL script)."""
    context.configure(
        url=db_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


def do_run_migrations(connection: Connection) -> None:
    context.configure(
        connection=connection,
        target_metadata=target_metadata,
        compare_type=True,
    )
    with context.begin_transaction():
        context.run_migrations()


async def run_async_migrations() -> None:
    """Run migrations using the async engine (matches app runtime)."""
    from sqlalchemy.ext.asyncio import create_async_engine

    connectable = create_async_engine(db_url, poolclass=pool.NullPool)
    async with connectable.connect() as connection:
        await connection.run_sync(do_run_migrations)

    await connectable.dispose()


def run_migrations_online() -> None:
    import sys

    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_async_migrations())


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------
if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
