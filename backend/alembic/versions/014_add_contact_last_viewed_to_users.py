"""add contact_last_viewed_at to users

Revision ID: 014_add_contact_viewed
Revises: 013_create_career_tips
Create Date: 2026-07-18

"""
from alembic import op
import sqlalchemy as sa

revision = "014_add_contact_viewed"
down_revision = "013_create_career_tips"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("contact_last_viewed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("users", "contact_last_viewed_at")
