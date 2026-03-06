"""add address_id and payment_method to orders

Revision ID: fc4855b2acbc
Revises:
Create Date: 2026-02-19 16:54:04.228532

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "fc4855b2acbc"
down_revision: Union[str, None] = "0001_initial"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table: str, column: str) -> bool:
    """Check if a column already exists (safe for both PostgreSQL and SQLite)."""
    from sqlalchemy import inspect as sa_inspect

    bind = op.get_bind()
    inspector = sa_inspect(bind)
    columns = [c["name"] for c in inspector.get_columns(table)]
    return column in columns


def upgrade() -> None:
    # Skip if the initial migration already created these columns
    if _column_exists("orders", "address_id"):
        return
    op.add_column("orders", sa.Column("address_id", sa.Integer(), nullable=True))
    op.add_column("orders", sa.Column("payment_method", sa.String(length=50), nullable=True))
    op.create_index(op.f("ix_orders_address_id"), "orders", ["address_id"], unique=False)
    op.create_foreign_key(
        "fk_orders_address_id", "orders", "addresses", ["address_id"], ["id"], ondelete="SET NULL"
    )


def downgrade() -> None:
    if not _column_exists("orders", "address_id"):
        return
    op.drop_constraint("fk_orders_address_id", "orders", type_="foreignkey")
    op.drop_index(op.f("ix_orders_address_id"), table_name="orders")
    op.drop_column("orders", "payment_method")
    op.drop_column("orders", "address_id")
