from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.career_tip import CareerTip
from app.schemas.career_tip import CareerTipRead

router = APIRouter(prefix="/career-tips", tags=["career-tips"])


@router.get("/", response_model=list[CareerTipRead])
def list_published_career_tips(db: Session = Depends(get_db)):
    return db.query(CareerTip).order_by(CareerTip.published_at.desc()).all()
