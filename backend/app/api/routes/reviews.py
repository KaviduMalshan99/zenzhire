from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.review import Review
from app.schemas.review import ReviewCreate, ReviewRead

router = APIRouter(prefix="/reviews", tags=["reviews"])


@router.get("/", response_model=list[ReviewRead])
def list_reviews(db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.approved.is_(True))
        .order_by(Review.created_at.desc())
        .all()
    )


@router.post("/", response_model=ReviewRead)
def submit_review(payload: ReviewCreate, db: Session = Depends(get_db)):
    record = Review(
        name=payload.name,
        rating=payload.rating,
        text=payload.text,
        approved=False,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record
