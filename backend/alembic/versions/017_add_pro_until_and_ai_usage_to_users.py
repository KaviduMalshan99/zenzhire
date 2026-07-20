"""add pro_until and ai usage tracking to users

Revision ID: 017_add_pro_until_ai_usage
Revises: 016_add_google_oauth_users
Create Date: 2026-07-19

"""
from alembic import op
import sqlalchemy as sa

revision = "017_add_pro_until_ai_usage"
down_revision = "016_add_google_oauth_users"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("pro_until", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "users",
        sa.Column("ai_usage_count", sa.Integer(), nullable=False, server_default="0"),
    )
    op.alter_column("users", "ai_usage_count", server_default=None)
    op.add_column("users", sa.Column("ai_usage_date", sa.Date(), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "ai_usage_date")
    op.drop_column("users", "ai_usage_count")
    op.drop_column("users", "pro_until")
