"""create career_tips table

Revision ID: 013_create_career_tips
Revises: 012_add_is_admin
Create Date: 2026-07-18

"""
from alembic import op
import sqlalchemy as sa

revision = "013_create_career_tips"
down_revision = "012_add_is_admin"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "career_tips",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("caption", sa.Text(), nullable=False),
        sa.Column("published_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("career_tips")
