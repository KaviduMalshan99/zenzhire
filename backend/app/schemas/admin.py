from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import PlanType


class AdminStats(BaseModel):
    total_users: int
    total_cvs: int
    total_cover_letters: int
    cvs_per_template: dict[str, int]


class AdminContactSubmissionRead(BaseModel):
    id: int
    name: str
    email: str
    message: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminUserRead(BaseModel):
    id: int
    email: str
    plan: PlanType
    pro_until: datetime | None
    is_pro: bool
    created_at: datetime
    cv_count: int
    ats_count: int

    model_config = {"from_attributes": True}


class AdminAdminRead(BaseModel):
    id: int
    email: str
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class AdminCreateRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class AdminResetPasswordResponse(BaseModel):
    email: str
    new_password: str


class AdminNotifications(BaseModel):
    pending_reviews_count: int
    new_contact_submissions: bool
