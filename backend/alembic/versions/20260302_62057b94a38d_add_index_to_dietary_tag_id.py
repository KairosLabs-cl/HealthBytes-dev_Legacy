"""Add index to dietary_tag_id

Revision ID: 62057b94a38d
Revises: a1b2c3d4e5f6
Create Date: 2026-03-02 11:06:21.381034

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '62057b94a38d'
down_revision: Union[str, None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_index(op.f('ix_product_dietary_tags_dietary_tag_id'), 'product_dietary_tags', ['dietary_tag_id'], unique=False, if_not_exists=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_product_dietary_tags_dietary_tag_id'), table_name='product_dietary_tags', if_exists=True)
