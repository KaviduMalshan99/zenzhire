import secrets
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import cast, func, Numeric
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import hash_password, password_strength_error
from app.api.dependencies import require_admin
from app.models.user import User, PlanType
from app.models.cv_document import CVDocument
from app.models.cover_letter import CoverLetter
from app.models.contact_submission import ContactSubmission
from app.models.review import Review
from app.models.ats_result import ATSResult
from app.models.career_tip import CareerTip
from app.models.billing_transaction import BillingTransaction
from app.services.billing import PLAN_CONFIG
from app.schemas.admin import (
    AdminStats,
    AdminContactSubmissionRead,
    AdminUserRead,
    AdminAdminRead,
    AdminCreateRequest,
    AdminResetPasswordResponse,
    AdminNotifications,
    AdminEarningsStats,
    AdminTransactionRead,
    AdminProMemberRead,
)
from app.schemas.billing import AdminSetProRequest, AdminSetProResponse
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
            pro_until=u.pro_until,
            is_pro=u.is_pro,
            created_at=u.created_at,
            cv_count=cv_counts.get(u.id, 0),
            ats_count=ats_counts.get(u.id, 0),
        )
        for u in users
    ]


@router.post("/users/{user_id}/set-pro", response_model=AdminSetProResponse)
def set_user_pro_until(user_id: int, payload: AdminSetProRequest, db: Session = Depends(get_db)):
    """Manual override for support/edge cases (refunds, goodwill extensions, chargebacks).
    Real upgrades happen via the PAYable webhook -- this exists because that flow needs
    a manual escape hatch, not as the primary path."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    user.pro_until = payload.pro_until
    if payload.pro_until is not None:
        user.plan = PlanType.pro
    db.commit()
    db.refresh(user)

    return AdminSetProResponse(user_id=user.id, pro_until=user.pro_until, is_pro=user.is_pro)


@router.get("/career-tips", response_model=list[CareerTipRead])
def list_career_tips(db: Session = Depends(get_db)):
    return db.query(CareerTip).order_by(CareerTip.published_at.desc()).all()


@router.post("/career-tips", response_model=CareerTipRead, status_code=status.HTTP_201_CREATED)
def create_career_tip(payload: CareerTipCreate, db: Session = Depends(get_db)):
    tip = CareerTip(title=payload.title, image_url=payload.image_url, caption=payload.caption)
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

    weakness = password_strength_error(payload.password)
    if weakness:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=weakness)

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


@router.get("/earnings/stats", response_model=AdminEarningsStats)
def get_earnings_stats(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    amount_expr = cast(BillingTransaction.amount, Numeric)
    success = BillingTransaction.status == "success"

    total_revenue = db.query(func.coalesce(func.sum(amount_expr), 0)).filter(success).scalar()
    revenue_this_month = (
        db.query(func.coalesce(func.sum(amount_expr), 0))
        .filter(success, BillingTransaction.created_at >= month_start)
        .scalar()
    )
    revenue_today = (
        db.query(func.coalesce(func.sum(amount_expr), 0))
        .filter(success, BillingTransaction.created_at >= day_start)
        .scalar()
    )

    plan_totals = dict(
        db.query(BillingTransaction.plan, func.coalesce(func.sum(amount_expr), 0))
        .filter(success)
        .group_by(BillingTransaction.plan)
        .all()
    )
    revenue_by_plan = {plan_id: float(plan_totals.get(plan_id, 0)) for plan_id in PLAN_CONFIG}

    total_users = db.query(User).count()
    total_pro_members = (
        db.query(User).filter(User.pro_until.isnot(None), User.pro_until > now).count()
    )
    total_free_users = total_users - total_pro_members
    conversion_rate = (total_pro_members / total_users * 100) if total_users else 0.0

    week_start = now - timedelta(days=7)
    new_signups_week = db.query(User).filter(User.created_at >= week_start).count()
    new_signups_month = db.query(User).filter(User.created_at >= month_start).count()

    return AdminEarningsStats(
        total_revenue=float(total_revenue),
        revenue_this_month=float(revenue_this_month),
        revenue_today=float(revenue_today),
        revenue_by_plan=revenue_by_plan,
        total_pro_members=total_pro_members,
        total_free_users=total_free_users,
        conversion_rate=round(conversion_rate, 2),
        new_signups_week=new_signups_week,
        new_signups_month=new_signups_month,
    )


@router.get("/earnings/transactions", response_model=list[AdminTransactionRead])
def list_earnings_transactions(
    status_filter: str | None = Query(None, alias="status"),
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(BillingTransaction, User.email).join(User, BillingTransaction.user_id == User.id)
    if status_filter:
        query = query.filter(BillingTransaction.status == status_filter)
    if search:
        query = query.filter(User.email.ilike(f"%{search}%"))
    rows = query.order_by(BillingTransaction.created_at.desc()).all()

    return [
        AdminTransactionRead(
            id=tx.id,
            user_email=email,
            plan=tx.plan,
            amount=float(tx.amount),
            currency_code=tx.currency_code,
            status=tx.status,
            created_at=tx.created_at,
        )
        for tx, email in rows
    ]


@router.get("/earnings/pro-members", response_model=list[AdminProMemberRead])
def list_pro_members(db: Session = Depends(get_db)):
    now = datetime.now(timezone.utc)
    pro_users = (
        db.query(User)
        .filter(User.pro_until.isnot(None), User.pro_until > now)
        .order_by(User.pro_until.asc())
        .all()
    )
    if not pro_users:
        return []

    user_ids = [u.id for u in pro_users]
    successful_transactions = (
        db.query(BillingTransaction)
        .filter(BillingTransaction.user_id.in_(user_ids), BillingTransaction.status == "success")
        .order_by(BillingTransaction.user_id, BillingTransaction.created_at.desc())
        .all()
    )
    latest_plan_by_user: dict[int, str] = {}
    for tx in successful_transactions:
        latest_plan_by_user.setdefault(tx.user_id, tx.plan)

    return [
        AdminProMemberRead(
            email=u.email,
            plan=latest_plan_by_user.get(u.id, "unknown"),
            pro_until=u.pro_until,
        )
        for u in pro_users
    ]
