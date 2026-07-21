import secrets
from urllib.parse import urlencode

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, password_strength_error
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserRead, TokenResponse
from app.api.dependencies import get_current_user

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


@router.get("/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


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
