"""Migration script to create payments table

Run with (from project root):
    python Tools/backend/database/migrations/create_payments_table.py
"""

import os
import sys
from pathlib import Path

# Add backend to Python path (4 levels up: migrations -> database -> backend -> Tools -> project root, then into backend/)
backend_path = Path(__file__).resolve().parents[4] / "backend"
sys.path.insert(0, str(backend_path))

from sqlalchemy import text

from app.db.database import engine


async def create_payments_table():
    """Create payments table with proper structure"""

    # Drop existing table if exists (for development only)
    drop_sql = """
    DROP TABLE IF EXISTS payments CASCADE;
    """

    # Create payments table with all columns and constraints
    create_sql = """
    CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        amount NUMERIC(10, 2) NOT NULL,
        currency VARCHAR(3) NOT NULL DEFAULT 'CLP',
        status VARCHAR(20) NOT NULL DEFAULT 'pending',
        provider VARCHAR(20) NOT NULL,
        provider_payment_id VARCHAR(255),
        provider_reference VARCHAR(255),
        error_message VARCHAR(500),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_payments_order_id ON payments(order_id);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
    CREATE INDEX IF NOT EXISTS idx_payments_provider ON payments(provider);
    CREATE INDEX IF NOT EXISTS idx_payments_provider_payment_id ON payments(provider_payment_id);

    COMMENT ON TABLE payments IS 'Payment records for orders via Mercado Pago';
    COMMENT ON COLUMN payments.provider IS 'Payment provider: mercado_pago';
    COMMENT ON COLUMN payments.status IS 'Payment status: pending, processing, completed, failed, refunded, cancelled';
    COMMENT ON COLUMN payments.currency IS 'Currency code: CLP, USD';
    COMMENT ON COLUMN payments.provider_payment_id IS 'Payment ID from provider system';
    COMMENT ON COLUMN payments.provider_reference IS 'Optional reference from provider';
    """

    async with engine.begin() as conn:
        print("🗑️  Dropping existing payments table (if exists)...")
        await conn.execute(text(drop_sql))

        print("📦 Creating payments table...")
        await conn.execute(text(create_sql))

        print("✅ Payments table created successfully!")


if __name__ == "__main__":
    import asyncio

    print("=" * 60)
    print("PAYMENT TABLE MIGRATION")
    print("=" * 60)

    asyncio.run(create_payments_table())

    print("\n" + "=" * 60)
    print("Migration completed successfully!")
    print("=" * 60)
