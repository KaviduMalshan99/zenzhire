"""add personal_details to cover_letters

Revision ID: 020_add_personal_details
Revises: 019_add_password_reset
Create Date: 2026-07-22

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "020_add_personal_details"
down_revision = "019_add_password_reset"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "cover_letters",
        sa.Column("personal_details", JSONB(), nullable=False, server_default="{}"),
    )


def downgrade() -> None:
    op.drop_column("cover_letters", "personal_details")
