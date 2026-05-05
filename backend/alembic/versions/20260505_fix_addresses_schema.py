"""Fix addresses table: rename state->region, fix is_default type, add missing columns

Revision ID: 20260505_fix_addresses
Revises: f1a2b3c4d5e6
Create Date: 2026-05-05
"""

from alembic import op
import sqlalchemy as sa

revision = "20260505_fix_addresses"
down_revision = "f1a2b3c4d5e6"
branch_labels = None
depends_on = None


def upgrade() -> None:
    conn = op.get_bind()

    # 1. Rename state -> region (copy data, preserve existing rows)
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses RENAME COLUMN state TO region"
    ))

    # 2. Add missing columns
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ADD COLUMN IF NOT EXISTS label VARCHAR(50)"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ADD COLUMN IF NOT EXISTS street_number VARCHAR(20)"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ADD COLUMN IF NOT EXISTS recipient_name VARCHAR(100)"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ADD COLUMN IF NOT EXISTS phone VARCHAR(20)"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE"
    ))

    # 3. Fix is_default: integer -> boolean
    # Cast existing values (0=false, anything else=true)
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ALTER COLUMN is_default TYPE BOOLEAN USING (is_default::boolean)"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ALTER COLUMN is_default SET DEFAULT false"
    ))

    # 4. postal_code was nullable in old schema - ensure consistent with model
    conn.execute(sa.text(
        "UPDATE tienda.addresses SET postal_code = '' WHERE postal_code IS NULL"
    ))

    # 5. region was nullable - match model (nullable=False means existing NULLs need defaults)
    conn.execute(sa.text(
        "UPDATE tienda.addresses SET region = '' WHERE region IS NULL"
    ))


def downgrade() -> None:
    conn = op.get_bind()

    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses DROP COLUMN IF EXISTS label"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses DROP COLUMN IF EXISTS street_number"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses DROP COLUMN IF EXISTS recipient_name"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses DROP COLUMN IF EXISTS phone"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses DROP COLUMN IF EXISTS is_active"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses DROP COLUMN IF EXISTS updated_at"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses RENAME COLUMN region TO state"
    ))
    conn.execute(sa.text(
        "ALTER TABLE tienda.addresses ALTER COLUMN is_default TYPE INTEGER USING (is_default::integer)"
    ))
