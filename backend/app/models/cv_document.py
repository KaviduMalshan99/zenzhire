from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base


class TemplateId(str, enum.Enum):
    classic = "classic"
    modern = "modern"
    minimal = "minimal"
    executive = "executive"
    tech = "tech"
    creative = "creative"
    academic = "academic"
    gcc = "gcc"


class SectionType(str, enum.Enum):
    personal_details = "personal_details"
    profile_summary = "profile_summary"
    experience = "experience"
    education = "education"
    skills = "skills"
    languages = "languages"
    projects = "projects"
    courses = "courses"
    certificates = "certificates"
    awards = "awards"
    interests = "interests"
    publications = "publications"
    organizations = "organizations"
    references = "references"
    declaration = "declaration"


class CVDocument(Base):
    __tablename__ = "cv_documents"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False, default="My CV")
    template_id = Column(SAEnum(TemplateId), default=TemplateId.classic, nullable=False)
    is_primary = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    owner = relationship("User", back_populates="cv_documents")
    sections = relationship(
        "CVSection",
        back_populates="cv",
        cascade="all, delete-orphan",
        order_by="CVSection.display_order",
    )


class CVSection(Base):
    __tablename__ = "cv_sections"

    id = Column(Integer, primary_key=True, index=True)
    cv_id = Column(Integer, ForeignKey("cv_documents.id"), nullable=False)
    section_type = Column(SAEnum(SectionType), nullable=False)
    display_order = Column(Integer, default=0, nullable=False)
    is_visible = Column(Boolean, default=True)
    data = Column(JSONB, nullable=False, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    cv = relationship("CVDocument", back_populates="sections")
