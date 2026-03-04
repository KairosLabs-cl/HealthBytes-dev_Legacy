"""add_vendor_name_to_products

Revision ID: a3f1e2d4b5c6
Revises: 35d20be20a0a
Create Date: 2026-03-04 13:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a3f1e2d4b5c6'
down_revision: Union[str, None] = '35d20be20a0a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Skip if column already exists
    from sqlalchemy import inspect as sa_inspect
    bind = op.get_bind()
    inspector = sa_inspect(bind)
    cols = [c["name"] for c in inspector.get_columns("products")]
    if "vendor_name" in cols:
        return

    op.add_column('products', sa.Column('vendor_name', sa.String(255), nullable=True))


def downgrade() -> None:
    op.drop_column('products', 'vendor_name')
