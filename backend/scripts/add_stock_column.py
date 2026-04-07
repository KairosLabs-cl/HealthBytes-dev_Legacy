"""Script to add stock column to products table."""

import asyncio
import sys

from sqlalchemy import text

from app.db.database import engine

# Fix for Windows: Use SelectorEventLoop for psycopg compatibility
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


async def check_and_add_stock_column():
    """Check if stock column exists, and add it if not."""
    async with engine.begin() as conn:
        # Check if stock column exists
        result = await conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='products' AND column_name='stock'
            """))

        exists = result.fetchone()

        if not exists:
            print("Stock column doesn't exist. Adding it now...")
            await conn.execute(text("""
                    ALTER TABLE products
                    ADD COLUMN stock INTEGER NOT NULL DEFAULT 0
                """))
            print("✅ Stock column added successfully!")
        else:
            print("✅ Stock column already exists.")

        # Show current table structure
        print("\nCurrent products table structure:")
        result = await conn.execute(text("""
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name='products'
                ORDER BY ordinal_position
            """))
        for row in result:
            print(f"  {row[0]}: {row[1]} (nullable: {row[2]}, default: {row[3]})")


if __name__ == "__main__":
    asyncio.run(check_and_add_stock_column())
