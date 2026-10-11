from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.core.database import Base


class Event(Base):
    """Lightweight product-analytics log (e.g. "pdf_downloaded")."""

    __tablename__ = "events"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    event_name = Column(String(64), nullable=False, index=True)
    cv_id = Column(Integer, ForeignKey("cv_documents.id", ondelete="SET NULL"), nullable=True)
    # "metadata" is reserved on SQLAlchemy declarative models, so the Python
    # attribute is event_metadata while the DB column is still named metadata.
    event_metadata = Column("metadata", JSONB(none_as_null=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
