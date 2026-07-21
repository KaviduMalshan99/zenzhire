import logging
import smtplib
from email.message import EmailMessage

from app.core.config import settings

logger = logging.getLogger(__name__)


def send_email(to: str, subject: str, body: str, html_body: str | None = None) -> bool:
    """Sends a real email via Gmail SMTP. Returns False (and logs) on any failure
    instead of raising -- callers use this for notifications that must never
    block the primary action (e.g. saving a contact form submission) except
    password reset, which checks the return value since the email IS the point."""
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.error("Email not sent to %s: SMTP is not configured (SMTP_HOST/SMTP_USER/SMTP_PASSWORD missing)", to)
        return False

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = settings.smtp_from or settings.smtp_user
    msg["To"] = to
    msg.set_content(body)
    if html_body:
        msg.add_alternative(html_body, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=15) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
        return True
    except Exception:
        logger.exception("Failed to send email to %s", to)
        return False
