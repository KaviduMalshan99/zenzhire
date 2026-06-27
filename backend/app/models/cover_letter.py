from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class CoverLetter(Base):
    __tablename__ = "cover_letters"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    cv_id = Column(Integer, ForeignKey("cv_documents.id", ondelete="SET NULL"), nullable=True)
    title = Column(String(255), nullable=False, default="My Cover Letter")
    template_id = Column(String(50), nullable=False, default="classic")
    content = Column(Text, nullable=False, default="")
    job_title = Column(String(255), nullable=False, default="")
    company = Column(String(255), nullable=False, default="")
    job_description = Column(Text, nullable=False, default="")
    tone = Column(String(50), nullable=False, default="formal")
    customization = Column(JSONB, nullable=False, default={})
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="cover_letters")
