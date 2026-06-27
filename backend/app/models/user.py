from sqlalchemy import Column, Integer, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class PlanType(str, enum.Enum):
    free = "free"
    pro = "pro"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    plan = Column(SAEnum(PlanType), default=PlanType.free, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    cvs = relationship("CV", back_populates="owner", cascade="all, delete-orphan")
    cv_documents = relationship("CVDocument", back_populates="owner", cascade="all, delete-orphan")
    ats_results = relationship("ATSResult", back_populates="owner", cascade="all, delete-orphan")
    cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
