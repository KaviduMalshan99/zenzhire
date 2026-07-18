from pydantic import BaseModel
from datetime import datetime


class CareerTipCreate(BaseModel):
    image_url: str
    caption: str


class CareerTipRead(BaseModel):
    id: int
    image_url: str
    caption: str
    published_at: datetime
    created_at: datetime

    model_config = {"from_attributes": True}
