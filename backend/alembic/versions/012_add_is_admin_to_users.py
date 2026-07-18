"""add is_admin to users

Revision ID: 012_add_is_admin
Revises: 011_create_reviews
Create Date: 2026-07-18

"""
from alembic import op
import sqlalchemy as sa

revision = "012_add_is_admin"
down_revision = "011_create_reviews"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("is_admin", sa.Boolean(), nullable=False, server_default=sa.false()),
    )


def downgrade() -> None:
    op.drop_column("users", "is_admin")
