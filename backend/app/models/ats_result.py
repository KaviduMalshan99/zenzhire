from sqlalchemy import Column, Integer, String, Float, ForeignKey, JSON, DateTime, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class ATSResult(Base):
    __tablename__ = "ats_results"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    cv_filename = Column(String, nullable=False)
    job_description = Column(Text, nullable=True)
    target_role = Column(String, nullable=True)
    target_industry = Column(String, nullable=True)
    overall_score = Column(Float, nullable=False)
    layers = Column(JSON, nullable=False, default=dict)
    has_job_description = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    owner = relationship("User", back_populates="ats_results")
