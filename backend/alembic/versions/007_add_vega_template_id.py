"""add vega to templateid enum

Revision ID: 007_add_vega
Revises: 006_add_corporate
Create Date: 2026-07-03

"""
from alembic import op

revision = "007_add_vega"
down_revision = "006_add_corporate"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE templateid ADD VALUE IF NOT EXISTS 'vega'")


def downgrade() -> None:
    # Postgres doesn't support removing individual enum values.
    pass
