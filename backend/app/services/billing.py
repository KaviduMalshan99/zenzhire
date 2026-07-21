import base64
import hashlib
import hmac
import logging
import secrets
from datetime import datetime, timedelta, timezone

import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.billing_transaction import BillingTransaction
from app.models.user import User, PlanType
from app.schemas.billing import CheckoutRequest

logger = logging.getLogger(__name__)

CURRENCY = "USD"

PLAN_CONFIG: dict[str, dict] = {
    "monthly": {"amount": "9.99", "days": 30, "label": "ZenzHire Pro - Monthly"},
    "yearly": {"amount": "79.99", "days": 365, "label": "ZenzHire Pro - Yearly"},
    "pass7": {"amount": "2.99", "days": 7, "label": "ZenzHire Pro - 7-Day Pass"},
}


def _urls() -> dict[str, str]:
    if settings.payable_env == "sandbox":
        return {
            "auth": "https://sandboxipgpayment.payable.lk/ipg/auth/direct-api",
            "checkout": "https://sandboxipgpayment.payable.lk/ipg/sandbox/direct-api",
        }
    return {
        "auth": "https://ipgpayment.payable.lk/ipg/auth/direct-api",
        "checkout": "https://ipgpayment.payable.lk/ipg/pro/direct-api",
    }


def _sha512_upper(value: str) -> str:
    return hashlib.sha512(value.encode()).hexdigest().upper()


def _checkout_check_value(merchant_key: str, invoice_id: str, amount: str, currency_code: str, merchant_token: str) -> str:
    """UPPERCASE(SHA512[merchantKey|invoiceId|amount|currencyCode|UPPERCASE(SHA512[merchantToken])])"""
    hashed_token = _sha512_upper(merchant_token)
    raw = f"{merchant_key}|{invoice_id}|{amount}|{currency_code}|{hashed_token}"
    return _sha512_upper(raw)


def _webhook_check_value(
    merchant_key: str,
    payable_order_id: str,
    payable_transaction_id: str,
    payable_amount: str,
    currency_code: str,
    invoice_no: str,
    status_code: str,
    merchant_token: str,
) -> str:
    """UPPERCASE(SHA512[merchantKey|payableOrderId|payableTransactionId|payableAmount|currencyCode|invoiceNo|statusCode|UPPERCASE(SHA512[merchantToken])])"""
    hashed_token = _sha512_upper(merchant_token)
    raw = f"{merchant_key}|{payable_order_id}|{payable_transaction_id}|{payable_amount}|{currency_code}|{invoice_no}|{status_code}|{hashed_token}"
    return _sha512_upper(raw)


def _split_name(full_name: str) -> tuple[str, str]:
    parts = (full_name or "").strip().split(" ", 1)
    if len(parts) == 1:
        return parts[0] or "Customer", parts[0] or "Customer"
    return parts[0], parts[1]


def _get_access_token() -> str:
    basic = base64.b64encode(
        f"{settings.payable_business_key}:{settings.payable_business_token}".encode()
    ).decode()
    resp = httpx.post(
        _urls()["auth"],
        headers={"Content-Type": "application/json", "Authorization": basic},
        json={"grant_type": "client_credentials", "originDomain": settings.payable_origin_domain},
        timeout=20,
    )
    if resp.status_code != 200:
        logger.error("PAYable auth failed: %s %s", resp.status_code, resp.text[:300])
        raise HTTPException(status_code=502, detail="Payment gateway authentication failed. Please try again shortly.")
    data = resp.json()
    token = data.get("accessToken")
    if not token:
        logger.error("PAYable auth response missing accessToken: %s", data)
        raise HTTPException(status_code=502, detail="Payment gateway authentication failed. Please try again shortly.")
    return token


def create_checkout_session(user: User, payload: CheckoutRequest, db: Session) -> tuple[str, str]:
    cfg = PLAN_CONFIG[payload.plan]
    amount = cfg["amount"]
    # PAYable rejects invoiceId over 20 chars, so this must stay compact even for
    # large user ids: "ZH" + id + plan code + 8 hex chars fits ids up to 9 digits.
    plan_code = {"monthly": "M", "yearly": "Y", "pass7": "P"}[payload.plan]
    invoice_id = f"ZH{user.id}{plan_code}{secrets.token_hex(4)}"

    txn = BillingTransaction(
        user_id=user.id,
        plan=payload.plan,
        invoice_id=invoice_id,
        amount=amount,
        currency_code=CURRENCY,
        status="pending",
    )
    db.add(txn)
    db.commit()

    check_value = _checkout_check_value(
        settings.payable_merchant_key, invoice_id, amount, CURRENCY, settings.payable_merchant_token
    )
    first_name, last_name = _split_name(user.full_name)

    body = {
        "merchantKey": settings.payable_merchant_key,
        "checkValue": check_value,
        "invoiceId": invoice_id,
        "currencyCode": CURRENCY,
        "paymentType": 1,
        "amount": amount,
        "orderDescription": cfg["label"],
        "logoUrl": f"{settings.frontend_url}/logo.png",
        "returnUrl": f"{settings.backend_url}/api/v1/billing/return?invoice={invoice_id}",
        "cancelUrl": f"{settings.frontend_url}/pricing",
        "originDomain": settings.payable_origin_domain,
        "webhookUrl": settings.payable_webhook_url,
        "customerFirstName": first_name,
        "customerLastName": last_name,
        "customerEmail": user.email,
        "customerMobilePhone": payload.customer_mobile_phone,
        "billingAddressStreet": payload.billing_address_street,
        "billingAddressCity": payload.billing_address_city,
        "billingAddressPostcodeZip": payload.billing_address_postcode_zip,
        "billingAddressCountry": payload.billing_address_country,
    }

    token = _get_access_token()
    resp = httpx.post(
        _urls()["checkout"],
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {token}"},
        json=body,
        timeout=30,
    )

    if resp.status_code != 200:
        txn.status = "failed"
        db.commit()
        logger.error("PAYable checkout session creation failed: %s %s", resp.status_code, resp.text[:500])
        raise HTTPException(status_code=502, detail="Could not start checkout with the payment gateway. Please try again.")

    data = resp.json()
    payment_page = data.get("paymentPage")
    if not payment_page:
        txn.status = "failed"
        db.commit()
        logger.error("PAYable checkout response missing paymentPage: %s", data)
        raise HTTPException(status_code=502, detail="Could not start checkout with the payment gateway. Please try again.")

    return payment_page, invoice_id


def handle_webhook(payload: dict, db: Session) -> None:
    merchant_key = str(payload.get("merchantKey", ""))
    payable_order_id = str(payload.get("payableOrderId", ""))
    payable_transaction_id = str(payload.get("payableTransactionId", ""))
    payable_amount = str(payload.get("payableAmount", ""))
    payable_currency = str(payload.get("payableCurrency", ""))
    invoice_no = str(payload.get("invoiceNo", ""))
    status_code = str(payload.get("statusCode", ""))
    received_check_value = str(payload.get("checkValue", ""))

    expected_check_value = _webhook_check_value(
        merchant_key,
        payable_order_id,
        payable_transaction_id,
        payable_amount,
        payable_currency,
        invoice_no,
        status_code,
        settings.payable_merchant_token,
    )

    if not received_check_value or not hmac.compare_digest(expected_check_value, received_check_value.upper()):
        logger.warning("PAYable webhook checkValue mismatch for invoice=%s orderId=%s", invoice_no, payable_order_id)
        raise HTTPException(status_code=400, detail="Invalid checkValue")

    txn = db.query(BillingTransaction).filter(BillingTransaction.invoice_id == invoice_no).first()
    if not txn:
        logger.error("PAYable webhook: no matching billing_transaction for invoiceNo=%s (orderId=%s) -- needs manual review", invoice_no, payable_order_id)
        return

    txn.payable_order_id = payable_order_id
    txn.payable_transaction_id = payable_transaction_id
    txn.raw_webhook_payload = payload

    status_message = payload.get("statusMessage", "")

    if status_message == "SUCCESS":
        if txn.status == "success":
            logger.info("PAYable webhook: invoice=%s already processed, skipping duplicate", invoice_no)
        else:
            user = db.query(User).filter(User.id == txn.user_id).first()
            if not user:
                logger.error("PAYable webhook: user_id=%s not found for invoice=%s -- needs manual review", txn.user_id, invoice_no)
            else:
                plan_cfg = PLAN_CONFIG.get(txn.plan)
                if not plan_cfg:
                    logger.error("PAYable webhook: unknown plan '%s' on invoice=%s -- needs manual review", txn.plan, invoice_no)
                else:
                    now = datetime.now(timezone.utc)
                    base = user.pro_until if (user.pro_until and user.pro_until > now) else now
                    user.pro_until = base + timedelta(days=plan_cfg["days"])
                    user.plan = PlanType.pro
                    logger.info("PAYable webhook: extended pro_until for user_id=%s to %s (plan=%s, invoice=%s)", user.id, user.pro_until, txn.plan, invoice_no)
            txn.status = "success"
            txn.completed_at = datetime.now(timezone.utc)
    else:
        txn.status = "failed"
        logger.info("PAYable webhook: invoice=%s status=%s (not SUCCESS), marking failed", invoice_no, status_message)

    db.commit()
