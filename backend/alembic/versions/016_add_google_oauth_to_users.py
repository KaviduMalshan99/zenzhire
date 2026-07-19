"""add google oauth fields to users

Revision ID: 016_add_google_oauth_users
Revises: 015_add_title_career_tips
Create Date: 2026-07-18

"""
from alembic import op
import sqlalchemy as sa

revision = "016_add_google_oauth_users"
down_revision = "015_add_title_career_tips"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column("users", "hashed_password", existing_type=sa.String(), nullable=True)
    op.add_column("users", sa.Column("google_id", sa.String(), nullable=True))
    op.create_index(op.f("ix_users_google_id"), "users", ["google_id"], unique=True)
    op.add_column(
        "users",
        sa.Column("auth_provider", sa.String(), nullable=False, server_default="local"),
    )
    op.alter_column("users", "auth_provider", server_default=None)


def downgrade() -> None:
    op.drop_column("users", "auth_provider")
    op.drop_index(op.f("ix_users_google_id"), table_name="users")
    op.drop_column("users", "google_id")
    op.alter_column("users", "hashed_password", existing_type=sa.String(), nullable=False)
