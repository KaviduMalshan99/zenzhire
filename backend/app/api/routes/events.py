from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.cv_document import CVDocument
from app.models.event import Event
from app.schemas.event import EventCreate

router = APIRouter(prefix="/events", tags=["events"])


@router.post("/", status_code=status.HTTP_204_NO_CONTENT)
def record_event(
    payload: EventCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.cv_id is not None:
        owns_cv = (
            db.query(CVDocument.id)
            .filter(CVDocument.id == payload.cv_id, CVDocument.user_id == current_user.id)
            .first()
        )
        if not owns_cv:
            raise HTTPException(status_code=404, detail="CV not found")

    db.add(Event(
        user_id=current_user.id,
        event_name=payload.event_name,
        cv_id=payload.cv_id,
        event_metadata=payload.metadata,
    ))
    db.commit()
