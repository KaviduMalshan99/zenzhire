"""add soft_skills to sectiontype enum

Revision ID: 003_add_soft_skills
Revises: ats_diagnosis_001
Create Date: 2026-07-02

"""
from alembic import op

revision = "003_add_soft_skills"
down_revision = "ats_diagnosis_001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE sectiontype ADD VALUE IF NOT EXISTS 'soft_skills'")


def downgrade() -> None:
    # Postgres doesn't support removing individual enum values.
    pass
