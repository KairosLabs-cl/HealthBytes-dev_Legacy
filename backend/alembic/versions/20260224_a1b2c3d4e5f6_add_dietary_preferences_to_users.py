"""add dietary_preferences to users

Revision ID: a1b2c3d4e5f6
Revises: fc4855b2acbc
Create Date: 2026-02-24 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "a1b2c3d4e5f6"
down_revision: Union[str, None] = "fc4855b2acbc"
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
    # Skip if the initial migration already created this column
    if _column_exists("users", "dietary_preferences"):
        return
    op.add_column(
        "users",
        sa.Column("dietary_preferences", sa.JSON(), nullable=True),
    )


def downgrade() -> None:
    if not _column_exists("users", "dietary_preferences"):
        return
    op.drop_column("users", "dietary_preferences")
