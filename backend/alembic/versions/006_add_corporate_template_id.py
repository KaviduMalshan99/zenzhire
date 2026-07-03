"""add corporate to templateid enum

Revision ID: 006_add_corporate
Revises: 005_add_milestone
Create Date: 2026-07-03

"""
from alembic import op

revision = "006_add_corporate"
down_revision = "005_add_milestone"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE templateid ADD VALUE IF NOT EXISTS 'corporate'")


def downgrade() -> None:
    # Postgres doesn't support removing individual enum values.
    pass
