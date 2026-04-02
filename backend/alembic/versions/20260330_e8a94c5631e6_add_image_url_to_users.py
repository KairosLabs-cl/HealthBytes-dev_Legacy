"""add_image_url_to_users

Revision ID: e8a94c5631e6
Revises: db783410c233
Create Date: 2026-03-30 17:19:22.439066

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "e8a94c5631e6"
down_revision: Union[str, None] = "db783410c233"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("users", sa.Column("image_url", sa.String(length=500), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "image_url")
