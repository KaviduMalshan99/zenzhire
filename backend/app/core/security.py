import secrets
from datetime import datetime, timedelta, timezone
from typing import Any
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

PASSWORD_MIN_LENGTH = 8
PASSWORD_MIN_CATEGORIES = 3
PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 60


def generate_reset_token() -> str:
    return secrets.token_urlsafe(32)


def password_strength_error(password: str) -> str | None:
    """Returns a specific rejection message, or None if the password is strong
    enough: at least PASSWORD_MIN_LENGTH characters, and at least
    PASSWORD_MIN_CATEGORIES of {uppercase, lowercase, number, special char}.
    Never trust the frontend's copy of this same rule — this is the check
    that actually decides what gets stored."""
    if len(password) < PASSWORD_MIN_LENGTH:
        return f"Password must be at least {PASSWORD_MIN_LENGTH} characters long."

    categories = [
        ("an uppercase letter", any(c.isupper() for c in password)),
        ("a lowercase letter", any(c.islower() for c in password)),
        ("a number", any(c.isdigit() for c in password)),
        ("a special character", any(not c.isalnum() for c in password)),
    ]
    satisfied = sum(1 for _, ok in categories if ok)
    if satisfied < PASSWORD_MIN_CATEGORIES:
        missing = ", ".join(name for name, ok in categories if not ok)
        return (
            f"Password is too weak. Add {missing} "
            f"(needs at least {PASSWORD_MIN_CATEGORIES} of: uppercase letter, "
            f"lowercase letter, number, special character)."
        )
    return None


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(subject: Any, expires_delta: timedelta | None = None) -> str:
    expire = datetime.now(timezone.utc) + (
        expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
    )
    payload = {"sub": str(subject), "exp": expire}
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload.get("sub")
    except JWTError:
        return None
