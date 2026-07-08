from pydantic import BaseModel, field_validator
from datetime import datetime


class ReviewCreate(BaseModel):
    name: str
    rating: int
    text: str

    @field_validator("name", "text")
    @classmethod
    def not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("must not be empty")
        return v.strip()

    @field_validator("rating")
    @classmethod
    def rating_in_range(cls, v: int) -> int:
        if v < 1 or v > 5:
            raise ValueError("rating must be between 1 and 5")
        return v


class ReviewRead(BaseModel):
    id: int
    name: str
    rating: int
    text: str
    created_at: datetime

    model_config = {"from_attributes": True}
