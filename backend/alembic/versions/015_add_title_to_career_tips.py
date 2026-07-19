"""add title to career_tips

Revision ID: 015_add_title_career_tips
Revises: 014_add_contact_viewed
Create Date: 2026-07-18

"""
from alembic import op
import sqlalchemy as sa

revision = "015_add_title_career_tips"
down_revision = "014_add_contact_viewed"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("career_tips", sa.Column("title", sa.String(), nullable=True))

    # Backfill existing rows (published before "title" existed) using the
    # first ~80 chars of their plain-text caption as a sensible default.
    op.execute(
        """
        UPDATE career_tips
        SET title = NULLIF(
            substring(trim(regexp_replace(caption, '<[^>]*>', '', 'g')) from 1 for 80),
            ''
        )
        WHERE title IS NULL
        """
    )
    op.execute("UPDATE career_tips SET title = 'Untitled Career Tip' WHERE title IS NULL")

    op.alter_column("career_tips", "title", nullable=False)


def downgrade() -> None:
    op.drop_column("career_tips", "title")
