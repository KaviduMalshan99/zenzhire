from pydantic import BaseModel
from typing import Any
from datetime import datetime
from app.models.cv_document import TemplateId, SectionType


# ── Legacy schemas kept for old CV model ──────────────────────────────────────

class PersonalInfo(BaseModel):
    full_name: str = ""
    email: str = ""
    phone: str = ""
    location: str = ""
    linkedin: str = ""
    website: str = ""
    summary: str = ""


class WorkExperience(BaseModel):
    company: str = ""
    title: str = ""
    start_date: str = ""
    end_date: str = ""
    current: bool = False
    description: str = ""


class Education(BaseModel):
    institution: str = ""
    degree: str = ""
    field: str = ""
    start_date: str = ""
    end_date: str = ""
    gpa: str = ""


class CVData(BaseModel):
    personal_info: PersonalInfo = PersonalInfo()
    work_experience: list[WorkExperience] = []
    education: list[Education] = []
    skills: list[str] = []
    languages: list[str] = []
    certifications: list[str] = []


class CVCreate(BaseModel):
    title: str = "My CV"
    data: CVData


class CVUpdate(BaseModel):
    title: str | None = None
    data: CVData | None = None


class CVRead(BaseModel):
    id: int
    user_id: int
    title: str
    data: Any
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


# ── New CV Document schemas ────────────────────────────────────────────────────

class CVSectionRead(BaseModel):
    id: int
    cv_id: int
    section_type: SectionType
    display_order: int
    is_visible: bool
    data: Any
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class CVDocumentCreate(BaseModel):
    title: str = "My CV"
    template_id: TemplateId = TemplateId.classic


class CVDocumentUpdate(BaseModel):
    title: str | None = None
    template_id: TemplateId | None = None


class CVDocumentRead(BaseModel):
    id: int
    user_id: int
    title: str
    template_id: TemplateId
    is_primary: bool
    created_at: datetime
    updated_at: datetime | None
    sections: list[CVSectionRead] = []

    model_config = {"from_attributes": True}


class CVDocumentListItem(BaseModel):
    id: int
    user_id: int
    title: str
    template_id: TemplateId
    is_primary: bool
    created_at: datetime
    updated_at: datetime | None

    model_config = {"from_attributes": True}


class CVSectionCreate(BaseModel):
    section_type: SectionType
    data: Any = {}


class CVSectionUpdate(BaseModel):
    is_visible: bool | None = None
    data: Any | None = None


class ReorderItem(BaseModel):
    id: int
    display_order: int


class ReorderRequest(BaseModel):
    sections: list[ReorderItem]


class AIImproveRequest(BaseModel):
    text: str
    action: str
    context: str = ""


class AIImproveResponse(BaseModel):
    improved_text: str
