"""add nova to templateid enum

Revision ID: 009_add_nova
Revises: 008_add_aurora
Create Date: 2026-07-06

"""
from alembic import op

revision = "009_add_nova"
down_revision = "008_add_aurora"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE templateid ADD VALUE IF NOT EXISTS 'nova'")


def downgrade() -> None:
    # Postgres doesn't support removing individual enum values.
    pass
