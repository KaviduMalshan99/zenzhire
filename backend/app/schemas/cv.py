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
    customization: Any | None = None
    target_role: str | None = None


class CVDocumentUpdate(BaseModel):
    title: str | None = None
    template_id: TemplateId | None = None
    customization: Any | None = None
    target_role: str | None = None


class CVDocumentRead(BaseModel):
    id: int
    user_id: int
    title: str
    template_id: TemplateId
    is_primary: bool
    customization: Any | None = None
    target_role: str | None = None
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
    is_auto_fix: bool = False


class AIImproveResponse(BaseModel):
    improved_text: str


class PolishItemRequest(BaseModel):
    text: str
    # Omitted on the first call of a "Polish Whole CV" run (that call is the one
    # that gets charged against the daily AI limit). Every subsequent call in the
    # same run passes back the batch_token issued by that first call so the
    # whole multi-section run is billed as a single usage credit.
    batch_token: str | None = None


class PolishItemResponse(BaseModel):
    improved_text: str | None = None
    batch_token: str
    error: str | None = None


class SubScoreItem(BaseModel):
    label: str
    score: int
    tip: str
    section_type: str | None = None


class CVScoreResponse(BaseModel):
    score: int
    missing: list[str]
    sub_scores: dict[str, SubScoreItem] | None = None


class JobMatchRequest(BaseModel):
    job_description: str


class JobMatchResponse(BaseModel):
    match_score: int
