import secrets
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password
from app.api.dependencies import require_admin
from app.models.user import User, PlanType
from app.models.cv_document import CVDocument
from app.models.cover_letter import CoverLetter
from app.models.contact_submission import ContactSubmission
from app.models.review import Review
from app.models.ats_result import ATSResult
from app.models.career_tip import CareerTip
from app.schemas.admin import (
    AdminStats,
    AdminContactSubmissionRead,
    AdminUserRead,
    AdminAdminRead,
    AdminCreateRequest,
    AdminResetPasswordResponse,
    AdminNotifications,
)
from app.schemas.review import ReviewRead
from app.schemas.career_tip import CareerTipCreate, CareerTipRead

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])


@router.get("/stats", response_model=AdminStats)
def get_stats(db: Session = Depends(get_db)):
    total_users = db.query(User).count()
    total_cvs = db.query(CVDocument).count()
    total_cover_letters = db.query(CoverLetter).count()

    template_counts = (
        db.query(CVDocument.template_id, func.count(CVDocument.id))
        .group_by(CVDocument.template_id)
        .all()
    )
    cvs_per_template = {template_id.value: count for template_id, count in template_counts}

    return AdminStats(
        total_users=total_users,
        total_cvs=total_cvs,
        total_cover_letters=total_cover_letters,
        cvs_per_template=cvs_per_template,
    )


@router.get("/reviews/pending", response_model=list[ReviewRead])
def list_pending_reviews(db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.approved.is_(False))
        .order_by(Review.created_at.desc())
        .all()
    )


@router.get("/reviews/approved", response_model=list[ReviewRead])
def list_approved_reviews(db: Session = Depends(get_db)):
    return (
        db.query(Review)
        .filter(Review.approved.is_(True))
        .order_by(Review.created_at.desc())
        .all()
    )


@router.post("/reviews/{review_id}/approve", response_model=ReviewRead)
def approve_review(review_id: int, db: Session = Depends(get_db)):
    review = db.query(Review).filter(Review.id == review_id).first()
    if not review:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Review not found")
    review.approved = True
    db.commit()
    db.refresh(review)
    return review


@router.get("/contact-submissions", response_model=list[AdminContactSubmissionRead])
def list_contact_submissions(db: Session = Depends(get_db)):
    return db.query(ContactSubmission).order_by(ContactSubmission.created_at.desc()).all()


@router.post("/contact-submissions/mark-viewed", status_code=status.HTTP_204_NO_CONTENT)
def mark_contact_submissions_viewed(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    current_user.contact_last_viewed_at = func.now()
    db.commit()


@router.get("/users", response_model=list[AdminUserRead])
def list_users(plan: PlanType | None = None, db: Session = Depends(get_db)):
    cv_counts = dict(
        db.query(CVDocument.user_id, func.count(CVDocument.id)).group_by(CVDocument.user_id).all()
    )
    ats_counts = dict(
        db.query(ATSResult.user_id, func.count(ATSResult.id)).group_by(ATSResult.user_id).all()
    )

    query = db.query(User)
    if plan is not None:
        query = query.filter(User.plan == plan)
    users = query.order_by(User.created_at.desc()).all()

    return [
        AdminUserRead(
            id=u.id,
            email=u.email,
            plan=u.plan,
            created_at=u.created_at,
            cv_count=cv_counts.get(u.id, 0),
            ats_count=ats_counts.get(u.id, 0),
        )
        for u in users
    ]


@router.get("/career-tips", response_model=list[CareerTipRead])
def list_career_tips(db: Session = Depends(get_db)):
    return db.query(CareerTip).order_by(CareerTip.published_at.desc()).all()


@router.post("/career-tips", response_model=CareerTipRead, status_code=status.HTTP_201_CREATED)
def create_career_tip(payload: CareerTipCreate, db: Session = Depends(get_db)):
    tip = CareerTip(image_url=payload.image_url, caption=payload.caption)
    db.add(tip)
    db.commit()
    db.refresh(tip)
    return tip


@router.delete("/career-tips/{tip_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_career_tip(tip_id: int, db: Session = Depends(get_db)):
    tip = db.query(CareerTip).filter(CareerTip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Career tip not found")
    db.delete(tip)
    db.commit()


@router.get("/admins", response_model=list[AdminAdminRead])
def list_admins(db: Session = Depends(get_db)):
    return db.query(User).filter(User.is_admin.is_(True)).order_by(User.created_at.desc()).all()


@router.post("/admins", response_model=AdminAdminRead, status_code=status.HTTP_201_CREATED)
def create_admin(payload: AdminCreateRequest, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        is_admin=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/admins/{admin_id}/reset-password", response_model=AdminResetPasswordResponse)
def reset_admin_password(admin_id: int, db: Session = Depends(get_db)):
    admin = db.query(User).filter(User.id == admin_id, User.is_admin.is_(True)).first()
    if not admin:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Admin not found")

    new_password = secrets.token_urlsafe(12)
    admin.hashed_password = hash_password(new_password)
    db.commit()

    return AdminResetPasswordResponse(email=admin.email, new_password=new_password)


@router.get("/notifications", response_model=AdminNotifications)
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    pending_reviews_count = db.query(Review).filter(Review.approved.is_(False)).count()

    latest_contact = (
        db.query(ContactSubmission.created_at)
        .order_by(ContactSubmission.created_at.desc())
        .first()
    )
    if latest_contact is None:
        new_contact_submissions = False
    elif current_user.contact_last_viewed_at is None:
        new_contact_submissions = True
    else:
        new_contact_submissions = latest_contact[0] > current_user.contact_last_viewed_at

    return AdminNotifications(
        pending_reviews_count=pending_reviews_count,
        new_contact_submissions=new_contact_submissions,
    )
