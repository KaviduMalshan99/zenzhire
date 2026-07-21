from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.models.contact_submission import ContactSubmission
from app.schemas.contact import ContactCreate, ContactRead
from app.services.email import send_email

router = APIRouter(prefix="/contact", tags=["contact"])


@router.post("/", response_model=ContactRead)
def submit_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    record = ContactSubmission(
        name=payload.name,
        email=payload.email,
        message=payload.message,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    notify_to = settings.contact_notify_email or settings.smtp_from or settings.smtp_user
    if notify_to:
        send_email(
            to=notify_to,
            subject=f"New contact form submission from {payload.name}",
            body=(
                f"Name: {payload.name}\n"
                f"Email: {payload.email}\n\n"
                f"Message:\n{payload.message}"
            ),
        )

    return record
