from pathlib import Path

from pydantic_settings import BaseSettings
from functools import lru_cache

ENV_FILE = Path(__file__).resolve().parent.parent.parent / ".env"


class Settings(BaseSettings):
    app_name: str = "ZenzHire API"
    debug: bool = False

    database_url: str = "postgresql://postgres:password@localhost:5432/zenzhire"

    secret_key: str = "change-this-secret-key-in-production"
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

    class Config:
        env_file = str(ENV_FILE)
        extra = "ignore"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
