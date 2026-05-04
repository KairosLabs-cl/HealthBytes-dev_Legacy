"""add_discount_percentage_to_products

Revision ID: f1a2b3c4d5e6
Revises: e8a94c5631e6
Create Date: 2026-04-27 12:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "f1a2b3c4d5e6"
down_revision: Union[str, None] = "e8a94c5631e6"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("products", sa.Column("discount_percentage", sa.Integer(), nullable=True))


def downgrade() -> None:
    op.drop_column("products", "discount_percentage")
