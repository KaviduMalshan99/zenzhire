from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.api.routes import cv as cv_routes
from app.models.user import User
from app.models.cv_document import CVDocument, SectionType
from app.schemas.cv import CVDocumentCreate, CVSectionCreate
from app.schemas.career_mentor import (
    CareerMentorStartRequest, CareerMentorAnswerRequest, CareerMentorStepResponse,
)
from app.services.ai_service import improve_cv_text
from app.services import career_mentor

router = APIRouter(prefix="/career-mentor", tags=["career-mentor"])


def _write_section_data(cv: CVDocument, db: Session, section_type: SectionType, data: dict) -> None:
    section = next((s for s in cv.sections if s.section_type == section_type), None)
    if not section:
        raise HTTPException(status_code=500, detail=f"Expected section '{section_type.value}' missing")
    # Full reassignment (not in-place mutation) so SQLAlchemy detects the JSONB change —
    # same pattern cv.update_section uses.
    section.data = data
    db.commit()


def _write_or_add_section_data(
    cv: CVDocument, db: Session, current_user: User, section_type: SectionType, data: dict
) -> None:
    """Same idea as _write_section_data, but for section types (like
    certificates) that aren't among the CV's default sections — created on
    first use via the existing cv.add_section route, exactly like the
    Projects section already does for the has_projects branch."""
    existing = next((s for s in cv.sections if s.section_type == section_type), None)
    if existing:
        _write_section_data(cv, db, section_type, data)
    else:
        cv_routes.add_section(
            cv.id, CVSectionCreate(section_type=section_type, data=data), current_user, db,
        )


@router.post("/start", response_model=CareerMentorStepResponse, status_code=status.HTTP_201_CREATED)
def start_conversation(
    payload: CareerMentorStartRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = cv_routes.create_cv(
        CVDocumentCreate(title="My CV", template_id=payload.template_id),
        current_user,
        db,
    )

    personal_section = next(
        (s for s in cv.sections if s.section_type == SectionType.personal_details), None
    )
    if personal_section:
        personal_section.data = {
            **personal_section.data,
            "full_name": current_user.full_name,
            "email": current_user.email,
        }
        db.commit()

    return career_mentor.build_step_payload(cv.id, career_mentor.FIRST_STEP, context={})


@router.post("/answer", response_model=CareerMentorStepResponse)
async def answer_step(
    payload: CareerMentorAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    cv = cv_routes._get_cv_or_404(payload.cv_id, current_user.id, db)
    step = payload.step
    answer = payload.answer.strip()
    context = dict(payload.context)

    if step not in career_mentor.FLOW:
        raise HTTPException(status_code=400, detail="Unknown step")

    next_step = career_mentor.get_next_step(step, answer)

    if step == "exp_work":
        # Vague answer → hold off on writing/AI-generating anything yet;
        # get_next_step already routed us to the follow-up question instead.
        if next_step != "exp_work_followup":
            improved = await improve_cv_text(answer, "improve_bullet", context.get("target_role", ""))
            end_raw = context.get("exp_end", "")
            is_current = end_raw.strip().lower() == "present"
            _write_section_data(cv, db, SectionType.experience, {
                "entries": [{
                    "job_title": context.get("exp_title", ""),
                    "employer": context.get("exp_company", ""),
                    "location": "",
                    "start_date": context.get("exp_start", ""),
                    "end_date": "" if is_current else end_raw,
                    "current": is_current,
                    "bullets": [{"text": improved}],
                }],
            })
    elif step == "exp_work_followup":
        combined = f"{context.get('exp_work', '')} {answer}".strip()
        improved = await improve_cv_text(combined, "improve_bullet", context.get("target_role", ""))
        end_raw = context.get("exp_end", "")
        is_current = end_raw.strip().lower() == "present"
        _write_section_data(cv, db, SectionType.experience, {
            "entries": [{
                "job_title": context.get("exp_title", ""),
                "employer": context.get("exp_company", ""),
                "location": "",
                "start_date": context.get("exp_start", ""),
                "end_date": "" if is_current else end_raw,
                "current": is_current,
                "bullets": [{"text": improved}],
            }],
        })
    elif step == "project_work":
        if next_step != "project_work_followup":
            improved = await improve_cv_text(answer, "improve_bullet", context.get("target_role", ""))
            _write_or_add_section_data(cv, db, current_user, SectionType.projects, {
                "entries": [{
                    "title": context.get("project_name", ""),
                    "subtitle": "",
                    "description": improved,
                    "tech": [],
                }],
            })
    elif step == "project_work_followup":
        combined = f"{context.get('project_work', '')} {answer}".strip()
        improved = await improve_cv_text(combined, "improve_bullet", context.get("target_role", ""))
        _write_or_add_section_data(cv, db, current_user, SectionType.projects, {
            "entries": [{
                "title": context.get("project_name", ""),
                "subtitle": "",
                "description": improved,
                "tech": [],
            }],
        })
    elif step == "edu_dates":
        _write_section_data(cv, db, SectionType.education, {
            "entries": [{
                "degree": context.get("edu_degree", ""),
                "institution": context.get("edu_institution", ""),
                "location": "",
                "start_date": answer,
                "end_date": "",
                "description": "",
            }],
        })
    elif step == "skills":
        skill_names = [s.strip() for s in answer.split(",") if s.strip()]
        _write_section_data(cv, db, SectionType.skills, {
            "display_style": "text",
            "entries": [{"skill_name": name, "level": ""} for name in skill_names],
        })
    elif step == "certifications_list":
        cert_names = [s.strip() for s in answer.split(",") if s.strip()]
        _write_or_add_section_data(cv, db, current_user, SectionType.certificates, {
            "entries": [
                {
                    "certificate_name": name, "issuer": "", "date": "",
                    "expiry": "", "no_expiry": False, "credential_id": "", "link": "",
                }
                for name in cert_names
            ],
        })
    elif step == "languages":
        language_names = [s.strip() for s in answer.split(",") if s.strip()]
        if language_names:
            _write_section_data(cv, db, SectionType.languages, {
                "entries": [{"language": name, "level": "", "info": ""} for name in language_names],
            })
    elif step == "summary_years":
        combined = (
            f"{context.get('summary_intro', '')}. "
            f"{context.get('summary_enjoy', '')}. "
            f"{answer} years of experience."
        )
        summary = await improve_cv_text(combined, "generate_summary", context.get("target_role", ""))
        _write_section_data(cv, db, SectionType.profile_summary, {"summary": summary})

    context[step] = answer

    if next_step == "complete":
        return career_mentor.build_step_payload(cv.id, "complete", context, complete=True)

    return career_mentor.build_step_payload(cv.id, next_step, context)
