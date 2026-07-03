"""add portrait to templateid enum

Revision ID: 004_add_portrait
Revises: 003_add_soft_skills
Create Date: 2026-07-03

"""
from alembic import op

revision = "004_add_portrait"
down_revision = "003_add_soft_skills"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE templateid ADD VALUE IF NOT EXISTS 'portrait'")


def downgrade() -> None:
    # Postgres doesn't support removing individual enum values.
    pass
