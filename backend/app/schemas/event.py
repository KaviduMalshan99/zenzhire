from typing import Any, Literal
from pydantic import BaseModel

# Only known event names are accepted, so the table can't fill up with junk.
EventName = Literal[
    "pdf_downloaded",
    "cl_pdf_downloaded",
    "onboarding_started",
    "onboarding_step_completed",
    "onboarding_completed",
]


class EventCreate(BaseModel):
    event_name: EventName
    cv_id: int | None = None
    metadata: dict[str, Any] | None = None
