"""add milestone to templateid enum

Revision ID: 005_add_milestone
Revises: 004_add_portrait
Create Date: 2026-07-03

"""
from alembic import op

revision = "005_add_milestone"
down_revision = "004_add_portrait"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE templateid ADD VALUE IF NOT EXISTS 'milestone'")


def downgrade() -> None:
    # Postgres doesn't support removing individual enum values.
    pass
