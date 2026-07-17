from pydantic import BaseModel
from app.models.cv_document import TemplateId


class CareerMentorStartRequest(BaseModel):
    template_id: TemplateId = TemplateId.classic


class CareerMentorAnswerRequest(BaseModel):
    cv_id: int
    step: str
    answer: str
    context: dict = {}


class Progress(BaseModel):
    current: int
    total: int


class CareerMentorStepResponse(BaseModel):
    cv_id: int
    step: str
    question: str
    input_type: str  # "text" | "buttons"
    options: list[str] | None = None
    progress: Progress
    context: dict = {}
    complete: bool = False
