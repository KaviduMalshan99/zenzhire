from typing import Any
from pydantic import BaseModel


class CareerMentorAnswerRequest(BaseModel):
    # None until the first answer — the CV is only created then.
    cv_id: int | None = None
    step: str
    # str for text/buttons, list[str] for "list", {field: value} for "fields".
    answer: Any = None
    context: dict[str, Any] = {}


class CareerMentorBackRequest(BaseModel):
    cv_id: int | None = None
    step: str
    context: dict[str, Any] = {}


class CareerMentorFinishRequest(BaseModel):
    cv_id: int
    context: dict[str, Any]


class Progress(BaseModel):
    current: int
    total: int


class StepOption(BaseModel):
    value: str
    label: str


class StepField(BaseModel):
    name: str
    label: str
    type: str  # "text" | "checkbox"
    required: bool = False
    required_unless: str | None = None


class CareerMentorStepResponse(BaseModel):
    cv_id: int | None = None
    step: str
    question: str
    hint: str | None = None
    input_type: str  # "text" | "buttons" | "fields" | "list" | "none"
    options: list[StepOption] | None = None
    fields: list[StepField] | None = None
    optional: bool = False
    prefill: Any = None
    can_go_back: bool = False
    progress: Progress
    context: dict[str, Any] = {}
    complete: bool = False


class CareerMentorFinishResponse(BaseModel):
    cv_id: int
    template_id: str
    complete: bool = True
