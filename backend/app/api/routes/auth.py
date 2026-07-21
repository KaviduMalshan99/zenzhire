import secrets
from datetime import date, datetime, timedelta, timezone
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password, create_access_token, password_strength_error,
    generate_reset_token, PASSWORD_RESET_TOKEN_EXPIRE_MINUTES,
)
from app.models.user import User
from app.models.cv_document import CVDocument
from app.models.ats_result import ATSResult
from app.models.billing_transaction import BillingTransaction
from app.schemas.user import (
    UserCreate, UserLogin, UserRead, TokenResponse,
    ForgotPasswordRequest, ResetPasswordRequest, ChangePasswordRequest, UsageStats,
)
from app.api.dependencies import get_current_user
from app.api.routes.cv import FREE_CV_LIMIT, AI_FREE_DAILY_LIMIT
from app.api.routes.ats import FREE_LIMIT as ATS_FREE_LIMIT
from app.services.email import send_email

router = APIRouter(prefix="/auth", tags=["auth"])

GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth"
GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://www.googleapis.com/oauth2/v3/userinfo"
GOOGLE_STATE_COOKIE = "google_oauth_state"


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    weakness = password_strength_error(payload.password)
    if weakness:
        raise HTTPException(status_code=400, detail=weakness)

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserRead.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token(user.id)
    return TokenResponse(access_token=token, user=UserRead.model_validate(user))


GENERIC_FORGOT_PASSWORD_MESSAGE = "If that email exists, we've sent a password reset link."


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)):
    """Never reveals whether the email exists -- always returns the same
    generic message, regardless of the lookup/send outcome below."""
    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        user.password_reset_token = generate_reset_token()
        user.password_reset_expires = datetime.now(timezone.utc) + timedelta(
            minutes=PASSWORD_RESET_TOKEN_EXPIRE_MINUTES
        )
        db.commit()

        reset_link = f"{settings.frontend_url}/reset-password?token={user.password_reset_token}"
        send_email(
            to=user.email,
            subject="Reset your ZenzHire password",
            body=(
                f"Hi {user.full_name},\n\n"
                f"We received a request to reset your ZenzHire password. Click the link below "
                f"to choose a new one. This link expires in {PASSWORD_RESET_TOKEN_EXPIRE_MINUTES} minutes.\n\n"
                f"{reset_link}\n\n"
                "If you didn't request this, you can safely ignore this email."
            ),
        )

    return {"message": GENERIC_FORGOT_PASSWORD_MESSAGE}


@router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.password_reset_token == payload.token).first()
    if (
        not user
        or not user.password_reset_expires
        or user.password_reset_expires < datetime.now(timezone.utc)
    ):
        raise HTTPException(
            status_code=400,
            detail="This password reset link is invalid or has expired. Please request a new one.",
        )

    weakness = password_strength_error(payload.new_password)
    if weakness:
        raise HTTPException(status_code=400, detail=weakness)

    user.hashed_password = hash_password(payload.new_password)
    user.password_reset_token = None
    user.password_reset_expires = None
    db.commit()

    return {"message": "Password reset successful. You can now log in with your new password."}


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.hashed_password or not verify_password(
        payload.current_password, current_user.hashed_password
    ):
        raise HTTPException(status_code=401, detail="Current password is incorrect")

    weakness = password_strength_error(payload.new_password)
    if weakness:
        raise HTTPException(status_code=400, detail=weakness)

    current_user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return {"message": "Password changed successfully."}


@router.get("/usage-stats", response_model=UsageStats)
def usage_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    is_pro = current_user.is_pro

    cv_count = db.query(CVDocument).filter(CVDocument.user_id == current_user.id).count()
    ats_count = db.query(ATSResult).filter(ATSResult.user_id == current_user.id).count()

    # ai_usage_count only reflects today's usage if the lazy daily-reset (in cv.py's
    # ai_improve_text) has already run today -- otherwise it's still yesterday's value.
    ai_usage_count = current_user.ai_usage_count if current_user.ai_usage_date == date.today() else 0

    active_plan = None
    if is_pro:
        latest = (
            db.query(BillingTransaction)
            .filter(BillingTransaction.user_id == current_user.id, BillingTransaction.status == "success")
            .order_by(BillingTransaction.completed_at.desc())
            .first()
        )
        if latest:
            active_plan = latest.plan

    return UsageStats(
        cv_count=cv_count,
        cv_limit=None if is_pro else FREE_CV_LIMIT,
        ats_count=ats_count,
        ats_limit=None if is_pro else ATS_FREE_LIMIT,
        ai_usage_count=ai_usage_count,
        ai_usage_limit=None if is_pro else AI_FREE_DAILY_LIMIT,
        active_plan=active_plan,
    )


@router.get("/google/login")
def google_login():
    state = secrets.token_urlsafe(24)
    params = {
        "client_id": settings.google_client_id,
        "redirect_uri": settings.google_redirect_uri,
        "response_type": "code",
        "scope": "openid email profile",
        "state": state,
        "access_type": "online",
        "prompt": "select_account",
    }
    response = RedirectResponse(f"{GOOGLE_AUTH_URL}?{urlencode(params)}")
    response.set_cookie(
        GOOGLE_STATE_COOKIE,
        state,
        max_age=600,
        httponly=True,
        samesite="lax",
    )
    return response


@router.get("/google/callback")
def google_callback(
    request: Request,
    db: Session = Depends(get_db),
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
):
    def fail(reason: str) -> RedirectResponse:
        redirect = RedirectResponse(f"{settings.frontend_url}/login?error={reason}")
        redirect.delete_cookie(GOOGLE_STATE_COOKIE)
        return redirect

    cookie_state = request.cookies.get(GOOGLE_STATE_COOKIE)
    if error or not code or not state or not cookie_state or state != cookie_state:
        return fail("google_auth_failed")

    token_resp = httpx.post(
        GOOGLE_TOKEN_URL,
        data={
            "code": code,
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "redirect_uri": settings.google_redirect_uri,
            "grant_type": "authorization_code",
        },
    )
    if token_resp.status_code != 200:
        return fail("google_auth_failed")
    google_access_token = token_resp.json().get("access_token")

    userinfo_resp = httpx.get(
        GOOGLE_USERINFO_URL,
        headers={"Authorization": f"Bearer {google_access_token}"},
    )
    if userinfo_resp.status_code != 200:
        return fail("google_auth_failed")

    info = userinfo_resp.json()
    email = info.get("email")
    if not email or not info.get("email_verified"):
        return fail("google_email_unverified")

    google_id = info.get("sub")
    full_name = info.get("name") or email.split("@")[0]

    user = db.query(User).filter(User.email == email).first()
    if user:
        if not user.google_id:
            user.google_id = google_id
            db.commit()
            db.refresh(user)
    else:
        user = User(
            email=email,
            full_name=full_name,
            hashed_password=None,
            google_id=google_id,
            auth_provider="google",
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    if not user.is_active:
        return fail("account_disabled")

    token = create_access_token(user.id)
    redirect = RedirectResponse(f"{settings.frontend_url}/auth/callback#token={token}")
    redirect.delete_cookie(GOOGLE_STATE_COOKIE)
    return redirect
