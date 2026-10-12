import asyncio
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, update
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.api.routes import cv as cv_routes
from app.models.user import User
from app.models.cv_document import CVDocument, CVSection, SectionType, TemplateId
from app.models.event import Event
from app.schemas.cv import CVDocumentCreate
from app.schemas.career_mentor import (
    CareerMentorAnswerRequest, CareerMentorBackRequest, CareerMentorFinishRequest,
    CareerMentorStepResponse, CareerMentorFinishResponse,
)
from app.services import ai_service, career_mentor
from app.services.career_mentor import AnswerError

router = APIRouter(prefix="/career-mentor", tags=["career-mentor"])
logger = logging.getLogger(__name__)

ONBOARDING = "onboarding"


def _track(db: Session, user_id: int, event_name: str, cv_id: int | None = None, metadata: dict | None = None) -> None:
    """Analytics must never break the flow: always called after the real work is
    committed, and any failure is logged and rolled back."""
    try:
        db.add(Event(user_id=user_id, event_name=event_name, cv_id=cv_id, event_metadata=metadata))
        db.commit()
    except Exception:
        db.rollback()
        logger.warning("Could not record event %s", event_name, exc_info=True)


def _get_onboarding_cv(cv_id: int, current_user: User, db: Session) -> CVDocument:
    cv = cv_routes._get_cv_or_404(cv_id, current_user.id, db)
    if cv.created_via != ONBOARDING:
        raise HTTPException(status_code=400, detail="This CV wasn't created with the quick-start.")
    if cv.onboarding_generated_at is not None:
        raise HTTPException(
            status_code=409,
            detail="The quick-start for this CV is already finished. You can edit it in the CV builder.",
        )
    return cv


def _clean_context(context: dict) -> dict:
    try:
        return career_mentor.clean_context(context)
    except AnswerError as e:
        raise HTTPException(status_code=400, detail=str(e))


def _apply_template(cv: CVDocument, template_id: str) -> None:
    cv.template_id = TemplateId(template_id)
    cv.customization = cv_routes._merge_customization(
        None, cv_routes.template_picker_customization(template_id), template_id=template_id,
    )


def _sync_cv(cv: CVDocument, context: dict, db: Session, polished: dict | None = None) -> None:
    """Rewrite every section the quick-start owns from the whole context, so a
    re-answered step or a switched branch never leaves old data behind."""
    content = career_mentor.cv_content(context, polished)
    cv.target_role = content.pop("target_role") or None

    template_id = career_mentor.template_for_stage(context.get("career_stage"))
    if cv.template_id.value != template_id:
        _apply_template(cv, template_id)

    sections = {s.section_type: s for s in cv.sections}
    next_order = max((s.display_order for s in cv.sections), default=-1) + 1
    for key, data in content.items():
        section_type = SectionType(key)
        section = sections.get(section_type)
        if section is None:
            if not data.get("entries") and not data.get("summary"):
                continue
            db.add(CVSection(cv_id=cv.id, section_type=section_type, display_order=next_order,
                             is_visible=True, data=data))
            next_order += 1
        elif section_type == SectionType.personal_details:
            # Keep the prefilled name/email (and anything else) — only set our fields.
            section.data = {**(section.data or {}), **data}
        else:
            # Full reassignment (not in-place mutation) so SQLAlchemy sees the JSONB change.
            section.data = data
    db.commit()


@router.post("/start", response_model=CareerMentorStepResponse)
def start_conversation(current_user: User = Depends(get_current_user)):
    # Nothing is created here: the CV is only created when the first answer comes in,
    # so opening and leaving the quick-start doesn't use up a Free CV slot.
    return career_mentor.build_step_payload(None, career_mentor.FIRST_STEP, {})


@router.post("/answer", response_model=CareerMentorStepResponse)
def answer_step(
    payload: CareerMentorAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate before touching the DB, so a bad first answer creates nothing.
    context = _clean_context(payload.context)
    try:
        context, next_step = career_mentor.apply_answer(payload.step, payload.answer, context)
    except AnswerError as e:
        raise HTTPException(status_code=400, detail=str(e))

    started = payload.cv_id is None
    if started:
        template_id = career_mentor.DEFAULT_TEMPLATE
        cv = cv_routes.create_cv_document(
            CVDocumentCreate(
                title="My CV",
                template_id=template_id,
                customization=cv_routes.template_picker_customization(template_id),
            ),
            current_user, db, created_via=ONBOARDING,
        )
    else:
        cv = _get_onboarding_cv(payload.cv_id, current_user, db)

    _sync_cv(cv, context, db)

    if started:
        _track(db, current_user.id, "onboarding_started", cv.id)
    _track(db, current_user.id, "onboarding_step_completed", cv.id, {"step": payload.step})

    return career_mentor.build_step_payload(cv.id, next_step, context)


@router.post("/back", response_model=CareerMentorStepResponse)
def go_back(
    payload: CareerMentorBackRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Returns the previous question with its earlier answer as `prefill`. Nothing
    changes until that step is answered again (via /answer, which replaces it)."""
    if payload.cv_id is not None:
        _get_onboarding_cv(payload.cv_id, current_user, db)
    if payload.step != career_mentor.COMPLETE and payload.step not in career_mentor.FLOW:
        raise HTTPException(status_code=400, detail="Unknown step.")

    context = _clean_context(payload.context)
    previous = career_mentor.previous_step(payload.step, context)
    if previous is None:
        raise HTTPException(status_code=400, detail="This is the first question, there's nothing to go back to.")
    return career_mentor.build_step_payload(payload.cv_id, previous, context)


async def _generate(context: dict) -> dict:
    """The quick-start's AI work: polish the job (or project) text and write the
    summary, both in parallel, using only the user's own answers."""
    target_role = context.get("target_role", "")
    work = career_mentor.work_text(context)
    if context.get("has_experience") == "no":
        work_call = ai_service.polish_onboarding_project(context.get("project_name", ""), work, target_role)
    else:
        role = context.get("exp_role") or {}
        work_call = ai_service.polish_onboarding_experience(
            role.get("job_title", ""), role.get("company", ""), work, target_role,
        )
    work_result, summary = await asyncio.gather(
        work_call, ai_service.write_onboarding_summary(career_mentor.summary_facts(context)),
    )
    key = "project_description" if context.get("has_experience") == "no" else "bullets"
    return {key: work_result, "summary": summary}


@router.post("/finish", response_model=CareerMentorFinishResponse)
async def finish_conversation(
    payload: CareerMentorFinishRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = cv_routes._get_cv_or_404(payload.cv_id, current_user.id, db)
    reason = career_mentor.generation_block_reason(cv.created_via, cv.onboarding_generated_at)
    if reason:
        raise HTTPException(status_code=403 if cv.created_via != ONBOARDING else 409, detail=reason)

    context = _clean_context(payload.context)
    if not career_mentor.is_complete(context):
        raise HTTPException(status_code=400, detail="Please answer all the questions first.")

    # Claim the one free generation atomically, so a double tap (or two tabs) can't
    # run it twice. Released again below if the AI call fails, so the user can retry.
    claim_filter = (
        CVDocument.id == cv.id,
        CVDocument.user_id == current_user.id,
        CVDocument.created_via == ONBOARDING,
        CVDocument.onboarding_generated_at.is_(None),
    )
    claimed = db.execute(
        update(CVDocument).where(*claim_filter).values(onboarding_generated_at=func.now())
    ).rowcount
    db.commit()
    if not claimed:
        raise HTTPException(status_code=409, detail=career_mentor.generation_block_reason(ONBOARDING, True))

    try:
        polished = await _generate(context)
    except Exception:
        logger.exception("Quick-start AI generation failed for CV %s", cv.id)
        db.execute(update(CVDocument).where(CVDocument.id == cv.id).values(onboarding_generated_at=None))
        db.commit()
        raise HTTPException(
            status_code=502,
            detail="Zeni couldn't finish your CV just now. Your answers are saved, please try again.",
        )

    db.refresh(cv)
    _sync_cv(cv, context, db, polished)
    _track(db, current_user.id, "onboarding_completed", cv.id)
    return {"cv_id": cv.id, "template_id": cv.template_id.value, "complete": True}
