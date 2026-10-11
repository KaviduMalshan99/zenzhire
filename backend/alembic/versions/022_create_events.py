"""create events table

Revision ID: 022_create_events
Revises: 021_add_target_role
Create Date: 2026-10-11

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "022_create_events"
down_revision = "021_add_target_role"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "events",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True),
        sa.Column("event_name", sa.String(length=64), nullable=False, index=True),
        sa.Column("cv_id", sa.Integer(), sa.ForeignKey("cv_documents.id", ondelete="SET NULL"), nullable=True),
        sa.Column("metadata", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("events")
