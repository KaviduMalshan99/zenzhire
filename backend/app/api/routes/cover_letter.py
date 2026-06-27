from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.cover_letter import CoverLetter
from app.models.cv_document import CVDocument, CVSection
from app.schemas.cover_letter import (
    CoverLetterCreate,
    CoverLetterUpdate,
    CoverLetterRead,
    CoverLetterListItem,
    AIGenerateRequest,
    AIGenerateResponse,
)
from app.services.ai_service import generate_cover_letter

router = APIRouter(prefix="/cover-letter", tags=["cover-letter"])


def _get_cl_or_404(cl_id: int, user_id: int, db: Session) -> CoverLetter:
    cl = db.query(CoverLetter).filter(
        CoverLetter.id == cl_id,
        CoverLetter.user_id == user_id,
    ).first()
    if not cl:
        raise HTTPException(status_code=404, detail="Cover letter not found")
    return cl


@router.get("/", response_model=list[CoverLetterListItem])
def list_cover_letters(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return (
        db.query(CoverLetter)
        .filter(CoverLetter.user_id == current_user.id)
        .order_by(CoverLetter.updated_at.desc())
        .all()
    )


@router.post("/ai/generate", response_model=AIGenerateResponse)
async def ai_generate_cover_letter(
    payload: AIGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv_data = None
    if payload.cv_id:
        cv = db.query(CVDocument).filter(
            CVDocument.id == payload.cv_id,
            CVDocument.user_id == current_user.id,
        ).first()
        if cv:
            sections = db.query(CVSection).filter(CVSection.cv_id == cv.id).all()
            personal = next(
                (s.data for s in sections if s.section_type == "personal_details"), {}
            )
            summary = next(
                (s.data.get("summary", "") for s in sections if s.section_type == "profile_summary"),
                "",
            )
            skills = [
                e.get("skill_name", "")
                for s in sections
                if s.section_type == "skills"
                for e in s.data.get("entries", [])
            ]
            experience = [
                e
                for s in sections
                if s.section_type == "experience"
                for e in s.data.get("entries", [])
            ]
            cv_data = {
                "personal": personal,
                "summary": summary,
                "skills": skills,
                "experience": experience,
            }
    elif payload.cv_data:
        cv_data = payload.cv_data

    content = await generate_cover_letter(
        job_title=payload.job_title,
        company=payload.company,
        job_description=payload.job_description,
        tone=payload.tone,
        cv_data=cv_data,
    )
    return AIGenerateResponse(content=content)


@router.post("/", response_model=CoverLetterRead, status_code=status.HTTP_201_CREATED)
def create_cover_letter(
    payload: CoverLetterCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cl = CoverLetter(
        user_id=current_user.id,
        title=payload.title,
        template_id=payload.template_id,
        cv_id=payload.cv_id,
        job_title=payload.job_title,
        company=payload.company,
    )
    db.add(cl)
    db.commit()
    db.refresh(cl)
    return cl


@router.get("/{cl_id}", response_model=CoverLetterRead)
def get_cover_letter(
    cl_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_cl_or_404(cl_id, current_user.id, db)


@router.put("/{cl_id}", response_model=CoverLetterRead)
def update_cover_letter(
    cl_id: int,
    payload: CoverLetterUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cl = _get_cl_or_404(cl_id, current_user.id, db)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(cl, field, value)
    db.commit()
    db.refresh(cl)
    return cl


@router.delete("/{cl_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cover_letter(
    cl_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cl = _get_cl_or_404(cl_id, current_user.id, db)
    db.delete(cl)
    db.commit()
