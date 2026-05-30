"""
Script to run the dietary tags migration.
Execute with: python run_migration.py
"""

import asyncio
import os
from pathlib import Path

# Read the SQL file
migration_path = Path(__file__).parent / "migrations" / "add_dietary_tags.sql"
SQL_MIGRATION = migration_path.read_text(encoding="utf-8")


async def run_migration():
    # Import here to avoid issues with module loading
    from app.db.database import engine
    from sqlalchemy import text

    print("🚀 Running dietary tags migration...")

    async with engine.begin() as conn:
        # Execute the migration
        await conn.execute(text(SQL_MIGRATION))
        print("✅ Migration completed successfully!")

    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(run_migration())
