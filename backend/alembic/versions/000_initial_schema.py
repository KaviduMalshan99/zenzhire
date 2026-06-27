"""initial schema

Revision ID: 000_initial_schema
Revises:
Create Date: 2026-06-25

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB

revision = "000_initial_schema"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("email", sa.String(), nullable=False),
        sa.Column("full_name", sa.String(), nullable=False),
        sa.Column("hashed_password", sa.String(), nullable=False),
        sa.Column("is_active", sa.Boolean(), nullable=True),
        sa.Column("plan", sa.Enum("free", "pro", name="plantype"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "cvs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("data", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cvs_id", "cvs", ["id"])

    # cv_documents without 'customization' — added in migration 001
    op.create_table(
        "cv_documents",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column(
            "template_id",
            sa.Enum(
                "classic", "modern", "minimal", "executive",
                "tech", "creative", "academic", "gcc",
                name="templateid",
            ),
            nullable=False,
        ),
        sa.Column("is_primary", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cv_documents_id", "cv_documents", ["id"])

    op.create_table(
        "cv_sections",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("cv_id", sa.Integer(), nullable=False),
        sa.Column(
            "section_type",
            sa.Enum(
                "personal_details", "profile_summary", "experience", "education", "skills",
                "languages", "projects", "courses", "certificates", "awards", "interests",
                "publications", "organizations", "references", "declaration",
                name="sectiontype",
            ),
            nullable=False,
        ),
        sa.Column("display_order", sa.Integer(), nullable=False),
        sa.Column("is_visible", sa.Boolean(), nullable=True),
        sa.Column("data", JSONB(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.ForeignKeyConstraint(["cv_id"], ["cv_documents.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_cv_sections_id", "cv_sections", ["id"])

    op.create_table(
        "ats_results",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("cv_filename", sa.String(), nullable=False),
        sa.Column("job_description", sa.Text(), nullable=True),
        sa.Column("target_role", sa.String(), nullable=True),
        sa.Column("target_industry", sa.String(), nullable=True),
        sa.Column("overall_score", sa.Float(), nullable=False),
        sa.Column("layers", sa.JSON(), nullable=False),
        sa.Column("has_job_description", sa.Boolean(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_ats_results_id", "ats_results", ["id"])


def downgrade() -> None:
    op.drop_index("ix_ats_results_id", table_name="ats_results")
    op.drop_table("ats_results")
    op.drop_index("ix_cv_sections_id", table_name="cv_sections")
    op.drop_table("cv_sections")
    op.drop_index("ix_cv_documents_id", table_name="cv_documents")
    op.drop_table("cv_documents")
    op.drop_index("ix_cvs_id", table_name="cvs")
    op.drop_table("cvs")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
    sa.Enum(name="sectiontype").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="templateid").drop(op.get_bind(), checkfirst=True)
    sa.Enum(name="plantype").drop(op.get_bind(), checkfirst=True)
