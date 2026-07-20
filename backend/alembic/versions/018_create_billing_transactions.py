"""create billing_transactions table

Revision ID: 018_create_billing_transactions
Revises: 017_add_pro_until_ai_usage
Create Date: 2026-07-19

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "018_create_billing_transactions"
down_revision = "017_add_pro_until_ai_usage"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "billing_transactions",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("plan", sa.String(length=20), nullable=False),
        sa.Column("invoice_id", sa.String(length=64), nullable=False, unique=True, index=True),
        sa.Column("amount", sa.String(length=20), nullable=False),
        sa.Column("currency_code", sa.String(length=10), nullable=False, server_default="USD"),
        sa.Column("status", sa.String(length=20), nullable=False, server_default="pending"),
        sa.Column("payable_order_id", sa.String(length=100), nullable=True),
        sa.Column("payable_transaction_id", sa.String(length=100), nullable=True),
        sa.Column("raw_webhook_payload", postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("billing_transactions")
