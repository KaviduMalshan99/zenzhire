"""add target_role to cv_documents

Revision ID: 021_add_target_role
Revises: 020_add_personal_details
Create Date: 2026-07-30

"""
from alembic import op
import sqlalchemy as sa

revision = "021_add_target_role"
down_revision = "020_add_personal_details"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cv_documents",
        sa.Column("target_role", sa.String(), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("cv_documents", "target_role")
