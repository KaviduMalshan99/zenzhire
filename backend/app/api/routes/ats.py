from fastapi import APIRouter, Depends, File, Form, UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.ats_result import ATSResult
from app.schemas.ats import ATSResultRead, ATSHistoryItem
from app.services.ats_service import run_full_analysis
from app.services.pdf_service import extract_text_from_pdf

router = APIRouter(prefix="/ats", tags=["ats"])

FREE_LIMIT = 5


@router.post("/analyze", response_model=ATSResultRead)
async def analyze_cv(
    cv_file: Optional[UploadFile] = File(None),
    cv_text: Optional[str] = Form(None),
    job_description: Optional[str] = Form(None),
    target_role: Optional[str] = Form(None),
    target_industry: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.plan == "free":
        count = db.query(ATSResult).filter(ATSResult.user_id == current_user.id).count()
        if count >= FREE_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"Free plan limited to {FREE_LIMIT} ATS checks. Upgrade to Pro for unlimited access.",
            )

    # Resolve CV text
    raw_bytes: Optional[bytes] = None
    filename = "pasted-text"

    if cv_file and cv_file.filename:
        if not cv_file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Only PDF files are accepted.")
        raw_bytes = await cv_file.read()
        filename = cv_file.filename
        extracted = extract_text_from_pdf(raw_bytes)
        if len(extracted.strip()) < 100:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF — ensure it is not a scanned image.")
        final_text = extracted
    elif cv_text and cv_text.strip():
        final_text = cv_text.strip()
    else:
        raise HTTPException(status_code=400, detail="Provide either a PDF file or pasted CV text.")

    analysis = await run_full_analysis(
        cv_text=final_text,
        cv_bytes=raw_bytes,
        job_description=job_description or None,
        target_role=target_role or None,
        target_industry=target_industry or None,
    )

    record = ATSResult(
        user_id=current_user.id,
        cv_filename=filename,
        job_description=job_description or None,
        target_role=target_role or None,
        target_industry=target_industry or None,
        overall_score=analysis["overall_score"],
        layers=analysis["layers"],
        diagnosis=analysis.get("diagnosis", {}),
        has_job_description=bool(job_description and job_description.strip()),
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


@router.get("/history", response_model=list[ATSHistoryItem])
def get_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return (
        db.query(ATSResult)
        .filter(ATSResult.user_id == current_user.id)
        .order_by(ATSResult.created_at.desc())
        .limit(20)
        .all()
    )


@router.get("/{result_id}", response_model=ATSResultRead)
def get_result(result_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    r = db.query(ATSResult).filter(ATSResult.id == result_id, ATSResult.user_id == current_user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Result not found")
    return r
