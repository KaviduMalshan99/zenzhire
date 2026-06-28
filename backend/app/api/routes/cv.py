import copy
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.models.cv_document import CVDocument, CVSection, SectionType, TemplateId
from app.schemas.cv import (
    CVDocumentCreate, CVDocumentUpdate, CVDocumentRead, CVDocumentListItem,
    CVSectionCreate, CVSectionUpdate, CVSectionRead,
    ReorderRequest, AIImproveRequest, AIImproveResponse,
)
from app.services.ai_service import improve_cv_text

router = APIRouter(prefix="/cv", tags=["cv"])

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
):
    improved = await improve_cv_text(payload.text, payload.action, payload.context)
    return AIImproveResponse(improved_text=improved)


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
    cv = CVDocument(
        user_id=current_user.id,
        title=payload.title,
        template_id=payload.template_id,
        customization=payload.customization or {},
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
        cv.template_id = payload.template_id
    if payload.customization is not None:
        cv.customization = payload.customization
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
