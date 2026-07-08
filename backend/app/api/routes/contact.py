from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.contact_submission import ContactSubmission
from app.schemas.contact import ContactCreate, ContactRead

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
    return record
