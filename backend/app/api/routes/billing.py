import logging
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.billing import CheckoutRequest, CheckoutResponse
from app.services import billing as billing_service

router = APIRouter(prefix="/billing", tags=["billing"])
logger = logging.getLogger(__name__)


@router.post("/checkout", response_model=CheckoutResponse)
def create_checkout(
    payload: CheckoutRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    payment_page, invoice_id = billing_service.create_checkout_session(current_user, payload, db)
    return CheckoutResponse(payment_page=payment_page, invoice_id=invoice_id)


@router.post("/webhook")
async def payable_webhook(request: Request, db: Session = Depends(get_db)):
    """Public, unauthenticated -- called server-to-server by PAYable. Authenticity is
    proven by the checkValue digest, not by a session/token, since PAYable has neither."""
    payload = await request.json()
    billing_service.handle_webhook(payload, db)
    return JSONResponse({"Status": 200})


@router.get("/return")
def billing_return(invoice: str | None = None):
    """The customer's browser lands here after PAYable's hosted checkout page.
    Actual plan activation happens in the webhook above, not here -- the customer
    could close the tab before this loads. This just hands off to a friendly
    frontend confirmation page."""
    target = f"{settings.frontend_url}/billing/return"
    if invoice:
        target += f"?invoice={invoice}"
    return RedirectResponse(target)
