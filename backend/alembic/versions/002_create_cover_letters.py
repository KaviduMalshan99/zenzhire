"""create cover_letters table

Revision ID: cover_letters_001
Revises: 001_add_customization
Create Date: 2026-06-24

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "cover_letters_001"
down_revision = "001_add_customization"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "cover_letters",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("cv_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(255), nullable=False, server_default="My Cover Letter"),
        sa.Column("template_id", sa.String(50), nullable=False, server_default="classic"),
        sa.Column("content", sa.Text(), nullable=False, server_default=""),
        sa.Column("job_title", sa.String(255), nullable=False, server_default=""),
        sa.Column("company", sa.String(255), nullable=False, server_default=""),
        sa.Column("job_description", sa.Text(), nullable=False, server_default=""),
        sa.Column("tone", sa.String(50), nullable=False, server_default="formal"),
        sa.Column("customization", JSONB(), nullable=False, server_default="{}"),
        sa.Column("created_at", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(), server_default=sa.func.now()),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["cv_id"], ["cv_documents.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_cover_letters_user_id", "cover_letters", ["user_id"])


def downgrade() -> None:
    op.drop_index("ix_cover_letters_user_id", table_name="cover_letters")
    op.drop_table("cover_letters")
