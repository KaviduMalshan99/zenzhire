"""add customization to cv_documents

Revision ID: 001_add_customization
Revises:
Create Date: 2026-06-18

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "001_add_customization"
down_revision = "000_initial_schema"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cv_documents",
        sa.Column("customization", JSONB, nullable=True),
    )


def downgrade() -> None:
    op.drop_column("cv_documents", "customization")
