import copy
import secrets
import time
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.cv_document import CVDocument, CVSection, SectionType, TemplateId, FREE_TEMPLATE_IDS
from app.schemas.cv import (
    CVDocumentCreate, CVDocumentUpdate, CVDocumentRead, CVDocumentListItem,
    CVSectionCreate, CVSectionUpdate, CVSectionRead,
    ReorderRequest, AIImproveRequest, AIImproveResponse,
    CVScoreResponse, JobMatchRequest, JobMatchResponse,
    PolishItemRequest, PolishItemResponse,
)
from app.services.ai_service import improve_cv_text
from app.services.score_service import compute_ats_score, compute_sub_scores, compute_job_match

router = APIRouter(prefix="/cv", tags=["cv"])

FREE_CV_LIMIT = 1
AI_FREE_DAILY_LIMIT = 3

# ── Default customization ──────────────────────────────────────────────────────
# Mirrors frontend/types/index.ts's DEFAULT_CUSTOMIZATION exactly. Kept in sync
# manually since the two live in separate apps/languages; the invariant this
# protects (customization is always a complete object, never {} or partial) is
# also enforced client-side via mergeCustomization() -- this is the second,
# defense-in-depth layer so a partial payload from any future/other caller
# can't silently reintroduce per-field default drift between preview and PDF.
DEFAULT_CUSTOMIZATION: dict = {
    "accentColor": "#111827",
    "fontFamily": "Arial",
    "spacing": "normal",
    "lineHeight": 1.3,
    "sectionSpacing": 20,
    "headerStyle": "centered",
    "headingStyle": "fullline",
    "skillStyle": "chips",
    "skillColumns": 2,
}


# Mirrors frontend/types/index.ts's LEGACY_SPACING_MAP (generic fallback) and
# TEMPLATE_LEGACY_SPACING (per-template ground truth, audited from each
# template's actual old marginBottom/line-height formulas). Only "classic" is
# populated so far -- add an entry as each template gets wired to
# lineHeight/sectionSpacing in a later phase.
LEGACY_SPACING_MAP: dict = {
    "compact": {"lineHeight": 1.1, "sectionSpacing": 12},
    "normal": {"lineHeight": 1.3, "sectionSpacing": 20},
    "spacious": {"lineHeight": 1.5, "sectionSpacing": 28},
}

TEMPLATE_LEGACY_SPACING: dict = {
    "classic": {
        "compact": {"lineHeight": 1.5, "sectionSpacing": 7},
        "normal": {"lineHeight": 1.5, "sectionSpacing": 8},
        "spacious": {"lineHeight": 1.5, "sectionSpacing": 10},
    },
    "creative": {
        "compact": {"lineHeight": 1.5, "sectionSpacing": 15},
        "normal": {"lineHeight": 1.5, "sectionSpacing": 20},
        "spacious": {"lineHeight": 1.5, "sectionSpacing": 27},
    },
    "minimal": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 11},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 14},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 19},
    },
    "executive": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 11},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 14},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 19},
    },
    "tech": {
        "compact": {"lineHeight": 1.5, "sectionSpacing": 11},
        "normal": {"lineHeight": 1.5, "sectionSpacing": 14},
        "spacious": {"lineHeight": 1.5, "sectionSpacing": 19},
    },
    "gcc": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 8},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 10},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 14},
    },
    "nova": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 8},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 10},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 14},
    },
    # Academic's old preset gave its Profile Summary a distinct line-height
    # (compact 1.4 / normal 1.65 / spacious 1.8) separate from the container's
    # own 1.6 -- per an explicit product decision, the new lineHeight stepper
    # now governs the whole template uniformly, so that distinct summary
    # behavior is intentionally dropped in favor of the container's value.
    "academic": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 5},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 7},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 12},
    },
    "modern": {
        "compact": {"lineHeight": 1.5, "sectionSpacing": 11},
        "normal": {"lineHeight": 1.5, "sectionSpacing": 14},
        "spacious": {"lineHeight": 1.5, "sectionSpacing": 19},
    },
    # NOTE: the original audit claimed "first section fixed 14, rest 16" for
    # Portrait, but live measurement showed that premise was stale/inaccurate
    # -- those numbers only ever fed SortableSection's dead defaultMarginBottom
    # prop. The real default floors at 10px via CSS margin collapsing with
    # SectionHeading's fixed marginTop: 10. Per an explicit product decision,
    # Portrait's sections now get a real, working sectionSpacing-driven
    # marginBottom for the first time -- 10 is the true audited default.
    "portrait": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 8},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 10},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 14},
    },
    # NOTE: the original audit claimed "summary 18, sidebar fixed 14, main
    # 16" for Milestone, but -- exactly like Portrait -- live measurement
    # showed that premise was stale/inaccurate; those numbers only ever fed
    # SortableSection's dead defaultMarginBottom prop. The real default
    # floors at 10px via CSS margin collapsing with SectionHeading's fixed
    # marginTop: 10. Milestone's sections now get a real, working
    # sectionSpacing-driven marginBottom for the first time.
    "milestone": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 8},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 10},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 14},
    },
    # Unlike Portrait/Milestone, Corporate's spacing was already real and
    # functional -- CH (Corporate's own heading component) sets a real
    # marginTop: Math.round(16 * sp), which dominates every section's
    # trailing gap via margin collapsing. Live measurement confirmed a
    # uniform 16px gap everywhere, matching the original audit for once.
    "corporate": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 12},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 16},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 22},
    },
    # Structurally identical to Corporate: Vega's own SH heading component
    # sets a real marginTop: Math.round(16 * sp), which dominates every
    # section's trailing gap via margin collapsing. Live measurement at all
    # three presets confirmed the exact same 12/16/22 progression as
    # Corporate.
    "vega": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 12},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 16},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 22},
    },
    # Same floored-at-10 mechanism as Portrait/Milestone: Aurora's main
    # column uses the shared SectionHeading (fixed marginTop: 10), and its
    # own local SidebarHeading is likewise a hardcoded marginTop: 10 --
    # neither was ever driven by the old compact/normal/spacious multiplier.
    # Live measurement confirmed the real gap floors at 10px almost
    # everywhere via margin collapsing.
    "aurora": {
        "compact": {"lineHeight": 1.6, "sectionSpacing": 8},
        "normal": {"lineHeight": 1.6, "sectionSpacing": 10},
        "spacious": {"lineHeight": 1.6, "sectionSpacing": 14},
    },
}


def _merge_customization(existing: dict | None, patch: dict | None = None, template_id: str | None = None) -> dict:
    """Fills gaps with defaults, keeps existing saved values, applies patch on top.

    `template_id`, when known, resolves a legacy (pre-lineHeight/sectionSpacing)
    saved CV to that specific template's real old appearance instead of the
    generic fallback -- see TEMPLATE_LEGACY_SPACING.
    """
    combined = {**(existing or {}), **(patch or {})}
    merged = {**DEFAULT_CUSTOMIZATION, **combined}
    if "lineHeight" not in combined and "sectionSpacing" not in combined:
        preset = combined.get("spacing", DEFAULT_CUSTOMIZATION["spacing"])
        legacy = TEMPLATE_LEGACY_SPACING.get(template_id, {}).get(preset) or LEGACY_SPACING_MAP.get(preset)
        if legacy:
            merged["lineHeight"] = legacy["lineHeight"]
            merged["sectionSpacing"] = legacy["sectionSpacing"]
    return merged


# ── Default section data ───────────────────────────────────────────────────────

_DEFAULT_DATA: dict[SectionType, dict] = {
    SectionType.personal_details: {
        "full_name": "", "title": "", "email": "", "phone": "",
        "location": "", "date_of_birth": "", "nationality": "",
        "visa_status": "", "gender": "", "driving_license": "",
        "marital_status": "", "religion": "", "nic": "",
        "photo_url": "", "links": [],
    },
    SectionType.profile_summary: {"summary": ""},
    SectionType.experience: {"entries": []},
    SectionType.education: {"entries": []},
    SectionType.skills: {"display_style": "text", "entries": []},
    SectionType.soft_skills: {"display_style": "text", "entries": []},
    SectionType.languages: {"entries": []},
    SectionType.projects: {"entries": []},
    SectionType.courses: {"entries": []},
    SectionType.certificates: {"entries": []},
    SectionType.awards: {"entries": []},
    SectionType.interests: {"entries": []},
    SectionType.publications: {"entries": []},
    SectionType.organizations: {"entries": []},
    SectionType.references: {"entries": []},
    SectionType.declaration: {
        "text": (
            "I hereby declare that all the information provided above is true and "
            "correct to the best of my knowledge and belief."
        ),
        "full_name": "", "place": "", "date": "", "signature": "",
    },
}

_DEFAULT_SECTIONS = [
    SectionType.personal_details,
    SectionType.profile_summary,
    SectionType.experience,
    SectionType.education,
    SectionType.skills,
    SectionType.languages,
]


def _get_cv_or_404(cv_id: int, user_id: int, db: Session) -> CVDocument:
    cv = db.query(CVDocument).filter(
        CVDocument.id == cv_id, CVDocument.user_id == user_id
    ).first()
    if not cv:
        raise HTTPException(status_code=404, detail="CV not found")
    return cv


def _get_section_or_404(cv_id: int, section_id: int, db: Session) -> CVSection:
    section = db.query(CVSection).filter(
        CVSection.id == section_id, CVSection.cv_id == cv_id
    ).first()
    if not section:
        raise HTTPException(status_code=404, detail="Section not found")
    return section


# ── AI endpoint (declared first to avoid conflict with /{cv_id}) ──────────────

@router.post("/ai/improve", response_model=AIImproveResponse)
async def ai_improve_text(
    payload: AIImproveRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_pro:
        if payload.is_auto_fix:
            raise HTTPException(
                status_code=403,
                detail="Auto Fix is a Pro feature. Upgrade to Pro to automatically fix CV issues.",
            )

        today = date.today()
        if current_user.ai_usage_date != today:
            current_user.ai_usage_date = today
            current_user.ai_usage_count = 0
        if current_user.ai_usage_count >= AI_FREE_DAILY_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"Free plan limited to {AI_FREE_DAILY_LIMIT} AI assists per day. Upgrade to Pro for unlimited access.",
            )
        current_user.ai_usage_count += 1
        db.commit()

    improved = await improve_cv_text(payload.text, payload.action, payload.context)
    return AIImproveResponse(improved_text=improved)


# ── "Polish Whole CV" bulk action ──────────────────────────────────────────────
# Runs fix_grammar (same improve_cv_text() call the per-section buttons use --
# no new AI logic) once per filled section/entry, sequentially from the
# frontend so the UI can show genuine per-item progress. Billing is a single
# flat usage credit for the whole run rather than one credit per section --
# metering per-section would let one click burn a Free user's entire 3/day
# limit, which is punishing rather than helpful for a bulk convenience action.
#
# The daily-limit check can only run once (on the first call of a run), but
# usage charging is enforced server-side, so the frontend can't simply "count
# once" on its own -- a modified client could otherwise flag every call as
# "already charged" and get unlimited free AI. Instead the first call (no
# batch_token) charges the usage credit and mints a short-lived batch_token;
# every subsequent call in that run must present a valid, unexpired token
# scoped to that user, so charging stays server-authoritative while later
# calls in the same run are genuinely free.
#
# Token store is an in-memory dict, not a DB table: it only needs to live a
# few minutes and this avoids a migration on launch day (see the template-enum
# migration incident). Known limitation: doesn't survive a process restart and
# isn't shared across multiple uvicorn workers -- fine for current deployment
# scale, worth revisiting if the backend is ever run with >1 worker.
_polish_batch_tokens: dict[str, tuple[int, float]] = {}
POLISH_BATCH_TTL_SECONDS = 180


def _purge_expired_polish_tokens() -> None:
    now = time.time()
    expired = [t for t, (_, exp) in _polish_batch_tokens.items() if exp < now]
    for t in expired:
        _polish_batch_tokens.pop(t, None)


def _issue_polish_batch_token(user_id: int) -> str:
    _purge_expired_polish_tokens()
    token = secrets.token_urlsafe(24)
    _polish_batch_tokens[token] = (user_id, time.time() + POLISH_BATCH_TTL_SECONDS)
    return token


def _polish_token_valid(token: str, user_id: int) -> bool:
    entry = _polish_batch_tokens.get(token)
    if not entry:
        return False
    owner_id, expiry = entry
    return owner_id == user_id and time.time() <= expiry


@router.post("/ai/polish-cv/item", response_model=PolishItemResponse)
async def polish_cv_item(
    payload: PolishItemRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if payload.batch_token:
        if not _polish_token_valid(payload.batch_token, current_user.id):
            raise HTTPException(
                status_code=403,
                detail="Polish session expired. Please restart Polish Whole CV.",
            )
        token = payload.batch_token
    else:
        if not current_user.is_pro:
            today = date.today()
            if current_user.ai_usage_date != today:
                current_user.ai_usage_date = today
                current_user.ai_usage_count = 0
            if current_user.ai_usage_count >= AI_FREE_DAILY_LIMIT:
                raise HTTPException(
                    status_code=403,
                    detail=f"Free plan limited to {AI_FREE_DAILY_LIMIT} AI assists per day. Upgrade to Pro for unlimited access.",
                )
            current_user.ai_usage_count += 1
            db.commit()
        token = _issue_polish_batch_token(current_user.id)

    try:
        improved = await improve_cv_text(payload.text, "fix_grammar", "")
        return PolishItemResponse(improved_text=improved, batch_token=token)
    except Exception:
        return PolishItemResponse(batch_token=token, error="failed")


# ── CV Document CRUD ──────────────────────────────────────────────────────────

@router.get("/", response_model=list[CVDocumentListItem])
def list_cvs(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(CVDocument).filter(CVDocument.user_id == current_user.id).all()


@router.post("/", response_model=CVDocumentRead, status_code=status.HTTP_201_CREATED)
def create_cv(
    payload: CVDocumentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_pro:
        count = db.query(CVDocument).filter(CVDocument.user_id == current_user.id).count()
        if count >= FREE_CV_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"You've reached the Free plan limit of {FREE_CV_LIMIT} CV. Upgrade to Pro for unlimited CVs.",
            )
        if payload.template_id not in FREE_TEMPLATE_IDS:
            raise HTTPException(
                status_code=403,
                detail=f"'{payload.template_id.value}' is a Pro template. Upgrade to Pro to use all 14 templates, or choose one of the 5 Free templates.",
            )

    cv = CVDocument(
        user_id=current_user.id,
        title=payload.title,
        template_id=payload.template_id,
        customization=_merge_customization(None, payload.customization, template_id=payload.template_id.value),
        is_primary=False,
    )
    db.add(cv)
    db.flush()

    for order, section_type in enumerate(_DEFAULT_SECTIONS):
        section = CVSection(
            cv_id=cv.id,
            section_type=section_type,
            display_order=order,
            is_visible=True,
            data=copy.deepcopy(_DEFAULT_DATA[section_type]),
        )
        db.add(section)

    db.commit()
    db.refresh(cv)
    return cv


@router.get("/{cv_id}", response_model=CVDocumentRead)
def get_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _get_cv_or_404(cv_id, current_user.id, db)


@router.get("/{cv_id}/score", response_model=CVScoreResponse)
def get_cv_score(
    cv_id: int,
    target_role: str = "",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = _get_cv_or_404(cv_id, current_user.id, db)
    score, missing = compute_ats_score(cv.sections)
    sub_scores = compute_sub_scores(cv.sections, target_role) if current_user.is_pro else None
    return CVScoreResponse(score=score, missing=missing, sub_scores=sub_scores)


@router.post("/{cv_id}/job-match", response_model=JobMatchResponse)
def get_job_match_score(
    cv_id: int,
    payload: JobMatchRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not current_user.is_pro:
        raise HTTPException(
            status_code=403,
            detail="Job Match Score is a Pro feature. Upgrade to Pro to see how well your CV matches a job description.",
        )
    cv = _get_cv_or_404(cv_id, current_user.id, db)
    match_score = compute_job_match(cv.sections, payload.job_description)
    return JobMatchResponse(match_score=match_score)


@router.put("/{cv_id}", response_model=CVDocumentRead)
def update_cv(
    cv_id: int,
    payload: CVDocumentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = _get_cv_or_404(cv_id, current_user.id, db)
    if payload.title is not None:
        cv.title = payload.title
    if payload.template_id is not None:
        if not current_user.is_pro and payload.template_id not in FREE_TEMPLATE_IDS:
            raise HTTPException(
                status_code=403,
                detail=f"'{payload.template_id.value}' is a Pro template. Upgrade to Pro to use all 14 templates, or choose one of the 5 Free templates.",
            )
        cv.template_id = payload.template_id
    if payload.customization is not None:
        cv.customization = _merge_customization(cv.customization, payload.customization, template_id=cv.template_id.value)
    db.commit()
    db.refresh(cv)
    return cv


@router.delete("/{cv_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = _get_cv_or_404(cv_id, current_user.id, db)
    db.delete(cv)
    db.commit()


@router.post("/{cv_id}/duplicate", response_model=CVDocumentRead, status_code=status.HTTP_201_CREATED)
def duplicate_cv(
    cv_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    source = _get_cv_or_404(cv_id, current_user.id, db)

    if not current_user.is_pro:
        count = db.query(CVDocument).filter(CVDocument.user_id == current_user.id).count()
        if count >= FREE_CV_LIMIT:
            raise HTTPException(
                status_code=403,
                detail=f"You've reached the Free plan limit of {FREE_CV_LIMIT} CV. Upgrade to Pro for unlimited CVs.",
            )

    new_cv = CVDocument(
        user_id=current_user.id,
        title=f"{source.title} (Copy)",
        template_id=source.template_id,
        is_primary=False,
    )
    db.add(new_cv)
    db.flush()

    for sec in source.sections:
        db.add(CVSection(
            cv_id=new_cv.id,
            section_type=sec.section_type,
            display_order=sec.display_order,
            is_visible=sec.is_visible,
            data=copy.deepcopy(sec.data),
        ))

    db.commit()
    db.refresh(new_cv)
    return new_cv


# ── Section CRUD ──────────────────────────────────────────────────────────────

@router.post("/{cv_id}/sections", response_model=CVSectionRead, status_code=status.HTTP_201_CREATED)
def add_section(
    cv_id: int,
    payload: CVSectionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_cv_or_404(cv_id, current_user.id, db)

    existing_types = {
        s.section_type
        for s in db.query(CVSection.section_type).filter(CVSection.cv_id == cv_id).all()
    }
    if payload.section_type in existing_types:
        raise HTTPException(status_code=400, detail="Section type already exists in this CV")

    max_order_row = (
        db.query(CVSection.display_order)
        .filter(CVSection.cv_id == cv_id)
        .order_by(CVSection.display_order.desc())
        .first()
    )
    next_order = (max_order_row[0] + 1) if max_order_row else 0

    default = copy.deepcopy(_DEFAULT_DATA.get(payload.section_type, {}))
    if payload.data:
        default.update(payload.data)

    section = CVSection(
        cv_id=cv_id,
        section_type=payload.section_type,
        display_order=next_order,
        is_visible=True,
        data=default,
    )
    db.add(section)
    db.commit()
    db.refresh(section)
    return section


@router.put("/{cv_id}/sections/{section_id}", response_model=CVSectionRead)
def update_section(
    cv_id: int,
    section_id: int,
    payload: CVSectionUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_cv_or_404(cv_id, current_user.id, db)
    section = _get_section_or_404(cv_id, section_id, db)

    if payload.is_visible is not None:
        section.is_visible = payload.is_visible
    if payload.data is not None:
        section.data = payload.data

    db.commit()
    db.refresh(section)
    return section


@router.delete("/{cv_id}/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(
    cv_id: int,
    section_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_cv_or_404(cv_id, current_user.id, db)
    section = _get_section_or_404(cv_id, section_id, db)

    if section.section_type == SectionType.personal_details:
        raise HTTPException(status_code=400, detail="Personal details section cannot be deleted")

    db.delete(section)
    db.commit()


@router.put("/{cv_id}/reorder", response_model=CVDocumentRead)
def reorder_sections(
    cv_id: int,
    payload: ReorderRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    _get_cv_or_404(cv_id, current_user.id, db)

    section_map = {
        s.id: s
        for s in db.query(CVSection).filter(CVSection.cv_id == cv_id).all()
    }
    for item in payload.sections:
        if item.id in section_map:
            section_map[item.id].display_order = item.display_order

    db.commit()
    return _get_cv_or_404(cv_id, current_user.id, db)
