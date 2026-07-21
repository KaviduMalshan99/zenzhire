"""add password reset token and expiry to users

Revision ID: 019_add_password_reset
Revises: 018_create_billing_transactions
Create Date: 2026-07-21

"""
from alembic import op
import sqlalchemy as sa

revision = "019_add_password_reset"
down_revision = "018_create_billing_transactions"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("password_reset_token", sa.String(), nullable=True))
    op.create_index(
        op.f("ix_users_password_reset_token"), "users", ["password_reset_token"], unique=True
    )
    op.add_column("users", sa.Column("password_reset_expires", sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    op.drop_column("users", "password_reset_expires")
    op.drop_index(op.f("ix_users_password_reset_token"), table_name="users")
    op.drop_column("users", "password_reset_token")
