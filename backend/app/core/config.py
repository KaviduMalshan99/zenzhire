from pathlib import Path

from pydantic import model_validator
from pydantic_settings import BaseSettings
from functools import lru_cache

ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


DEFAULT_SECRET_KEY = "change-this-secret-key-in-production"
PLACEHOLDER_SECRET_KEYS = {DEFAULT_SECRET_KEY, "your-super-secret-key-change-this"}
MIN_SECRET_KEY_LENGTH = 32


class Settings(BaseSettings):
    app_name: str = "ZenzHire API"
    debug: bool = False
    environment: str = "development"

    database_url: str = "postgresql://postgres:password@localhost:5432/zenzhire"

    secret_key: str = DEFAULT_SECRET_KEY
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 days

    anthropic_api_key: str = ""
    anthropic_model: str = "claude-sonnet-4-6"

    cors_origins: list[str] = ["http://localhost:3000"]

    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/v1/auth/google/callback"
    frontend_url: str = "http://localhost:3000"
    backend_url: str = "http://localhost:8000"

    payable_env: str = "sandbox"
    payable_merchant_key: str = ""
    payable_merchant_token: str = ""
    payable_business_key: str = ""
    payable_business_token: str = ""
    payable_origin_domain: str = ""
    payable_webhook_url: str = ""

    smtp_host: str = ""
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from: str = ""
    contact_notify_email: str = ""

    @model_validator(mode="after")
    def check_secret_key_in_production(self):
        if self.environment.lower() == "production" and (
            self.secret_key in PLACEHOLDER_SECRET_KEYS
            or len(self.secret_key) < MIN_SECRET_KEY_LENGTH
        ):
            raise RuntimeError(
                "Refusing to start: ENVIRONMENT=production but SECRET_KEY is a placeholder "
                f"or shorter than {MIN_SECRET_KEY_LENGTH} characters. Set a strong random SECRET_KEY in .env "
                "(e.g. python -c \"import secrets; print(secrets.token_urlsafe(64))\")."
            )
        return self

    class Config:
        env_file = str(ENV_FILE)
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
