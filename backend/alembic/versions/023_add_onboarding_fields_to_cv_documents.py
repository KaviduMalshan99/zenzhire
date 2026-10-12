"""add created_via and onboarding_generated_at to cv_documents

Revision ID: 023_add_onboarding_fields
Revises: 022_create_events
Create Date: 2026-10-11

"""
from alembic import op
import sqlalchemy as sa

revision = "023_add_onboarding_fields"
down_revision = "022_create_events"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Nullable on purpose: existing rows predate this and stay NULL ("unknown").
    op.add_column("cv_documents", sa.Column("created_via", sa.String(length=32), nullable=True))
    op.add_column(
        "cv_documents",
        sa.Column("onboarding_generated_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_column("cv_documents", "onboarding_generated_at")
    op.drop_column("cv_documents", "created_via")
