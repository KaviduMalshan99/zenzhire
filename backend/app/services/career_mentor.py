"""Career Mentor conversational onboarding — step engine.

Pure, DB-free logic describing the fixed conversation (branching, plus one
optional "dig deeper" follow-up round on vague experience/project answers).
The route layer (app/api/routes/career_mentor.py) is responsible for
actually writing answers into CV sections and calling the AI service; this
module only knows what question comes next, whether an answer needs a
follow-up before it's detailed enough to use, and how far through the
conversation the user is.
"""

FIRST_STEP = "target_role"

FLOW: dict[str, dict] = {
    "target_role": {
        "question": "What job or role are you aiming for? Be as specific as you can "
                     "(e.g. \"Frontend Developer\" or \"Registered Nurse\").",
        "input_type": "text",
    },
    "career_stage": {
        "question": "Which best describes where you're at right now?",
        "input_type": "buttons",
        "options": ["Student", "Graduate", "Experienced Professional"],
    },
    "has_experience": {
        "question": "Have you had any paid work experience, including internships?",
        "input_type": "buttons",
        "options": ["Yes", "No"],
    },
    "exp_company": {"question": "What company or organization did you work for?", "input_type": "text"},
    "exp_title": {"question": "What was your job title there?", "input_type": "text"},
    "exp_start": {"question": "When did you start? (e.g. \"Jan 2023\")", "input_type": "text"},
    "exp_end": {"question": "When did that end? (or type \"Present\" if it's your current role)", "input_type": "text"},
    "exp_work": {
        "question": "What did you actually build or work on day to day? Mention any "
                     "tools, technologies, or results if you can.",
        "input_type": "text",
    },
    "exp_work_followup": {
        "question": "Can you tell me a bit more? What tools did you use, or was there "
                     "a specific result you're proud of?",
        "input_type": "text",
    },
    "has_projects": {
        "question": "Have you done any internships or personal projects?",
        "input_type": "buttons",
        "options": ["Yes", "No"],
    },
    "project_name": {"question": "What's the project or internship called?", "input_type": "text"},
    "project_work": {
        "question": "What did you actually build or work on? Mention any tools, "
                     "technologies, or outcomes if you can.",
        "input_type": "text",
    },
    "project_work_followup": {
        "question": "Got it — can you add a bit more detail? What tools did you use, "
                     "or what was the outcome?",
        "input_type": "text",
    },
    "edu_institution": {"question": "What school or university did you attend?", "input_type": "text"},
    "edu_degree": {
        "question": "What degree or qualification did you study for? (e.g. \"BSc Computer Science\")",
        "input_type": "text",
    },
    "edu_dates": {
        "question": "When did you study there? (e.g. \"2019 - 2023\", or your expected graduation)",
        "input_type": "text",
    },
    "skills": {
        "question": "What tools, technologies, or abilities do you use most in your work? "
                     "List a few, separated by commas.",
        "input_type": "text",
    },
    "has_certifications": {
        "question": "Do you have any certifications?",
        "input_type": "buttons",
        "options": ["Yes", "No"],
    },
    "certifications_list": {
        "question": "What certification(s)? List a few.",
        "input_type": "text",
    },
    "languages": {
        "question": "What languages do you speak? (e.g. \"English, Sinhala\")",
        "input_type": "text",
    },
    "summary_intro": {
        "question": "If you had 10 seconds to introduce yourself professionally, what would you say?",
        "input_type": "text",
    },
    "summary_enjoy": {
        "question": "What kind of work or projects do you enjoy most?",
        "input_type": "text",
    },
    "summary_years": {
        "question": "About how many years of experience do you have in this field?",
        "input_type": "text",
    },
    "complete": {
        "question": "Your CV is ready! Let's take a look.",
        "input_type": "none",
    },
}

# Small, targeted wording variants keyed by the "career_stage" answer — same
# question in spirit, tone shifted to be more encouraging/project-focused for
# Students and more achievement/impact-focused for Experienced Professionals.
# "Graduate" and anything unrecognized fall back to FLOW's own default text.
_STAGE_QUESTION_OVERRIDES: dict[str, dict[str, str]] = {
    "exp_work": {
        "Student": "What did you actually do in that role? Even small tasks count — "
                   "mention any tools you used or things you learned.",
        "Experienced Professional": "What did you achieve in that role? Mention any "
                                     "tools, technologies, or measurable results if you can.",
    },
    "project_work": {
        "Student": "What did you build or contribute to? Mention any tools or "
                    "technologies you used — even a class project counts.",
        "Experienced Professional": "What did you build or lead, and what was the "
                                     "impact? Mention tools, technologies, or results if you can.",
    },
    "summary_intro": {
        "Student": "If you had 10 seconds to introduce yourself to a hiring manager, "
                    "what would you say about yourself and what you're learning?",
        "Experienced Professional": "If you had 10 seconds to introduce yourself to a "
                                     "hiring manager, what would you highlight about your career so far?",
    },
    "skills": {
        "Student": "What tools, technologies, or skills have you picked up so far — "
                    "from classes, projects, or self-study? List a few.",
        "Experienced Professional": "What tools, technologies, or abilities do you rely "
                                     "on most in your work? List a few.",
    },
}

# Steps whose answer is only ever accumulated into `context` — never written
# directly to a CV section by themselves (either because they feed a later
# combined write, like exp_company, or because they're pure routing signals,
# like has_experience/has_certifications).
CONTEXT_ONLY_STEPS = {
    "target_role", "career_stage", "has_experience",
    "exp_company", "exp_title", "exp_start", "exp_end",
    "has_projects", "project_name",
    "edu_institution", "edu_degree",
    "has_certifications",
    "summary_intro", "summary_enjoy",
}

_COMMON_PREFIX = ["target_role", "career_stage", "has_experience"]
_BRANCH_A = ["exp_company", "exp_title", "exp_start", "exp_end", "exp_work"]
_BRANCH_B_PROJECT = ["has_projects", "project_name", "project_work"]
_BRANCH_B_DECLINE = ["has_projects"]
_EDU_SKILLS = ["edu_institution", "edu_degree", "edu_dates", "skills"]
_CERT_YES = ["certifications_list"]
_SUMMARY_SUFFIX = ["summary_intro", "summary_enjoy", "summary_years"]


def is_vague(answer: str) -> bool:
    """An experience/project answer is too thin to generate a good CV bullet
    from if it's short (under ~15 words) or has no concrete detail at all
    (no number of any kind — team size, %, quantity, etc)."""
    words = answer.split()
    if len(words) < 15:
        return True
    return not any(ch.isdigit() for ch in answer)


def _step_order(context: dict) -> list[str]:
    """The full ordered step sequence implied by context so far. Before a
    branch point is answered, assumes the longer path so the progress bar
    doesn't have to jump backward once it does. The optional follow-up steps
    are never part of this order — they re-use their base step's progress
    slot (see progress_for) so a follow-up round doesn't inflate the total."""
    has_experience = (context.get("has_experience") or "").strip().lower()
    has_projects = (context.get("has_projects") or "").strip().lower()
    has_certifications = (context.get("has_certifications") or "").strip().lower()

    if has_experience == "no" and has_projects == "no":
        branch = _BRANCH_B_DECLINE
    elif has_experience == "no":
        branch = _BRANCH_B_PROJECT
    else:
        branch = _BRANCH_A

    cert_branch = [] if has_certifications == "no" else _CERT_YES

    return (
        _COMMON_PREFIX + branch + _EDU_SKILLS
        + ["has_certifications"] + cert_branch + ["languages"]
        + _SUMMARY_SUFFIX
    )


def progress_for(step: str, context: dict) -> tuple[int, int]:
    order = _step_order(context)
    total = len(order)
    lookup_step = step[: -len("_followup")] if step.endswith("_followup") else step
    try:
        current = order.index(lookup_step) + 1
    except ValueError:
        current = total  # "complete" or any terminal state
    return current, total


def get_next_step(step: str, answer: str) -> str:
    normalized = answer.strip().lower()
    if step == "has_experience":
        return "exp_company" if normalized == "yes" else "has_projects"
    if step == "has_projects":
        return "project_name" if normalized == "yes" else "edu_institution"
    if step == "has_certifications":
        return "certifications_list" if normalized == "yes" else "languages"
    if step == "exp_work" and is_vague(answer):
        return "exp_work_followup"
    if step == "project_work" and is_vague(answer):
        return "project_work_followup"

    linear_next = {
        "target_role": "career_stage",
        "career_stage": "has_experience",
        "exp_company": "exp_title",
        "exp_title": "exp_start",
        "exp_start": "exp_end",
        "exp_end": "exp_work",
        "exp_work": "edu_institution",
        "exp_work_followup": "edu_institution",
        "project_name": "project_work",
        "project_work": "edu_institution",
        "project_work_followup": "edu_institution",
        "edu_institution": "edu_degree",
        "edu_degree": "edu_dates",
        "edu_dates": "skills",
        "skills": "has_certifications",
        "certifications_list": "languages",
        "languages": "summary_intro",
        "summary_intro": "summary_enjoy",
        "summary_enjoy": "summary_years",
        "summary_years": "complete",
    }
    return linear_next[step]


def question_for(step: str, context: dict) -> str:
    stage = context.get("career_stage", "")
    overrides = _STAGE_QUESTION_OVERRIDES.get(step)
    if overrides and stage in overrides:
        return overrides[stage]
    return FLOW[step]["question"]


def build_step_payload(cv_id: int, step: str, context: dict, complete: bool = False) -> dict:
    node = FLOW[step]
    current, total = progress_for(step, context)
    return {
        "cv_id": cv_id,
        "step": step,
        "question": question_for(step, context),
        "input_type": node["input_type"],
        "options": node.get("options"),
        "progress": {"current": current, "total": total},
        "context": context,
        "complete": complete,
    }
