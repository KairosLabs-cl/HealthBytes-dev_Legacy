"""
Script to run the nutritional info migration.
Execute with: python run_nutrition_migration.py
"""

import asyncio
import os
from pathlib import Path
from sqlalchemy import text

# Read the SQL file
migration_path = Path(__file__).parent / "migrations" / "add_nutritional_info.sql"
SQL_MIGRATION = migration_path.read_text(encoding="utf-8")


async def run_migration():
    # Import here to avoid issues with module loading
    from app.db.database import engine

    print("🚀 Running nutritional info migration...")

    try:
        async with engine.begin() as conn:
            # Execute the migration
            await conn.execute(text(SQL_MIGRATION))
            print("✅ Migration completed successfully!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"❌ Migration failed: {e}")
    finally:
        await engine.dispose()


if __name__ == "__main__":
    if os.name == "nt":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())
    asyncio.run(run_migration())
