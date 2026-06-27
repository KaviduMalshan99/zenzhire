from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CoverLetterCreate(BaseModel):
    title: str = "My Cover Letter"
    template_id: str = "classic"
    cv_id: Optional[int] = None
    job_title: str = ""
    company: str = ""


class CoverLetterUpdate(BaseModel):
    title: Optional[str] = None
    template_id: Optional[str] = None
    cv_id: Optional[int] = None
    content: Optional[str] = None
    job_title: Optional[str] = None
    company: Optional[str] = None
    job_description: Optional[str] = None
    tone: Optional[str] = None
    customization: Optional[dict] = None


class CoverLetterRead(BaseModel):
    id: int
    user_id: int
    cv_id: Optional[int]
    title: str
    template_id: str
    content: str
    job_title: str
    company: str
    job_description: str
    tone: str
    customization: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class CoverLetterListItem(BaseModel):
    id: int
    title: str
    template_id: str
    job_title: str
    company: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AIGenerateRequest(BaseModel):
    cv_id: Optional[int] = None
    job_title: str
    company: str
    job_description: str
    tone: str = "formal"
    cv_data: Optional[dict] = None


class AIGenerateResponse(BaseModel):
    content: str
