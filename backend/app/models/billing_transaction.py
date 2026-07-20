from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.core.database import Base


class BillingTransaction(Base):
    """Audit trail for PAYable checkout sessions, keyed by invoice_id.

    The webhook looks up the transaction by invoice_id (rather than parsing
    it back out of the string) so a lookup failure is a normal, loggable
    "not found" instead of a parse error, and the row doubles as an
    idempotency guard against duplicate webhook deliveries.
    """

    __tablename__ = "billing_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    plan = Column(String(20), nullable=False)
    invoice_id = Column(String(64), unique=True, nullable=False, index=True)
    amount = Column(String(20), nullable=False)
    currency_code = Column(String(10), nullable=False, default="USD")
    status = Column(String(20), nullable=False, default="pending")  # pending | success | failed
    payable_order_id = Column(String(100), nullable=True)
    payable_transaction_id = Column(String(100), nullable=True)
    raw_webhook_payload = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)
