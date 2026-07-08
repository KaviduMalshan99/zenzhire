from pydantic import BaseModel, EmailStr, field_validator


class ContactCreate(BaseModel):
    name: str
    email: EmailStr
    message: str

    @field_validator("name", "message")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be empty")
        return v.strip()


class ContactRead(BaseModel):
    id: int
    name: str
    email: str
    message: str

    model_config = {"from_attributes": True}
