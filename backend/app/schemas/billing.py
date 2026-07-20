from pydantic import BaseModel
from typing import Literal
from datetime import datetime

PlanId = Literal["monthly", "yearly", "pass7"]


class CheckoutRequest(BaseModel):
    plan: PlanId
    customer_mobile_phone: str
    billing_address_street: str
    billing_address_city: str
    billing_address_postcode_zip: str
    billing_address_country: str


class CheckoutResponse(BaseModel):
    payment_page: str
    invoice_id: str


class AdminSetProRequest(BaseModel):
    pro_until: datetime | None  # None revokes Pro access immediately


class AdminSetProResponse(BaseModel):
    user_id: int
    pro_until: datetime | None
    is_pro: bool
