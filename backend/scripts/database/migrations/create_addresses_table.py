"""
Create addresses table migration

Usage (from project root):
    python Tools/backend/database/migrations/create_addresses_table.py

This creates the addresses table for shipping/billing addresses.
"""

import asyncio
import sys
from pathlib import Path

# Add backend to path (4 levels up: migrations -> database -> backend -> Tools -> project root, then into backend/)
backend_path = Path(__file__).resolve().parents[4] / "backend"
sys.path.append(str(backend_path))

from sqlalchemy import text
from app.db.database import engine, Base
from app.db.models.address import Address  # Import to register model


async def create_addresses_table():
    """Create addresses table"""

    create_table_sql = """
    CREATE TABLE IF NOT EXISTS addresses (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR NOT NULL,
        label VARCHAR(50),
        street VARCHAR(255) NOT NULL,
        street_number VARCHAR(20),
        city VARCHAR(100) NOT NULL,
        region VARCHAR(100) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(2) DEFAULT 'CL',
        recipient_name VARCHAR(100),
        phone VARCHAR(20),
        is_default BOOLEAN DEFAULT FALSE,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE
    );
    
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_addresses_user_id ON addresses(user_id);
    CREATE INDEX IF NOT EXISTS idx_addresses_is_default ON addresses(is_default) WHERE is_default = TRUE;
    CREATE INDEX IF NOT EXISTS idx_addresses_is_active ON addresses(is_active);
    """

    print("🚀 Creating addresses table...")

    async with engine.begin() as conn:
        await conn.execute(text(create_table_sql))
        print("✅ Addresses table created successfully!")

        # Verify table exists
        result = await conn.execute(
            text(
                """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'addresses'
        """
            )
        )

        if result.scalar():
            print("✅ Verified: addresses table exists")
        else:
            print("❌ Error: addresses table not found after creation")


async def rollback_addresses_table():
    """Drop addresses table (rollback)"""

    print("⚠️  Rolling back addresses table...")

    async with engine.begin() as conn:
        await conn.execute(text("DROP TABLE IF EXISTS addresses CASCADE;"))
        print("✅ Addresses table dropped")


async def main():
    """Main migration function"""
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "rollback":
        await rollback_addresses_table()
    else:
        await create_addresses_table()

    print("\n📝 Migration complete!")


if __name__ == "__main__":
    # Fix for Windows
    if sys.platform == "win32":
        asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

    asyncio.run(main())
