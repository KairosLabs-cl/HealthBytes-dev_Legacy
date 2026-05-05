"""Create payments table (missing from Drizzle-created schema)

Revision ID: 20260505_create_payments
Revises: 20260505_fix_addresses
Create Date: 2026-05-05
"""

from alembic import op
import sqlalchemy as sa

revision = "20260505_create_payments"
down_revision = "20260505_fix_addresses"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # Create enum types — DO block handles "already exists" without aborting transaction
    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE paymentcurrency AS ENUM ('CLP', 'USD');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE paymentstatus AS ENUM
                ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    conn.execute(sa.text("""
        DO $$ BEGIN
            CREATE TYPE paymentprovider AS ENUM ('MERCADO_PAGO');
        EXCEPTION WHEN duplicate_object THEN NULL;
        END $$
    """))

    conn.execute(sa.text("""
        CREATE TABLE IF NOT EXISTS tienda.payments (
            id SERIAL PRIMARY KEY,
            order_id INTEGER NOT NULL REFERENCES tienda.orders(id) ON DELETE CASCADE,
            amount NUMERIC(10, 2) NOT NULL,
            currency paymentcurrency NOT NULL DEFAULT 'CLP',
            status paymentstatus NOT NULL DEFAULT 'PENDING',
            provider paymentprovider NOT NULL,
            provider_payment_id VARCHAR(255),
            provider_reference VARCHAR(255),
            error_message TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            completed_at TIMESTAMP WITH TIME ZONE
        )
    """))

    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_payments_order_id ON tienda.payments (order_id)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_payments_status ON tienda.payments (status)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_payments_provider ON tienda.payments (provider)"
    ))
    conn.execute(sa.text(
        "CREATE INDEX IF NOT EXISTS ix_payments_provider_payment_id "
        "ON tienda.payments (provider_payment_id)"
    ))


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DROP TABLE IF EXISTS tienda.payments"))
    # Only drop types if no other tables use them
    conn.execute(sa.text("DROP TYPE IF EXISTS paymentcurrency"))
    conn.execute(sa.text("DROP TYPE IF EXISTS paymentstatus"))
    conn.execute(sa.text("DROP TYPE IF EXISTS paymentprovider"))
