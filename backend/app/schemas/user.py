from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.models.user import PlanType


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str


class UsageStats(BaseModel):
    cv_count: int
    cv_limit: int | None
    ats_count: int
    ats_limit: int | None
    ai_usage_count: int
    ai_usage_limit: int | None
    active_plan: str | None


class UserRead(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    is_admin: bool
    plan: PlanType
    pro_until: datetime | None
    is_pro: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRead
