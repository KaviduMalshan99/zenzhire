"""add aurora to templateid enum

Revision ID: 008_add_aurora
Revises: 007_add_vega
Create Date: 2026-07-06

"""
from alembic import op

revision = "008_add_aurora"
down_revision = "007_add_vega"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE templateid ADD VALUE IF NOT EXISTS 'aurora'")


def downgrade() -> None:
    # Postgres doesn't support removing individual enum values.
    pass
