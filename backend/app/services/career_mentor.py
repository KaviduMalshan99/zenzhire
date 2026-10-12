"""Career Mentor quick-start — step engine.

Pure, DB-free logic for the short scripted onboarding: which question comes
next (including the yes/no experience branch and one optional follow-up on a
very thin answer), going back a step, validating answers, progress, and how
the answers map onto CV sections. The route layer
(app/api/routes/career_mentor.py) does the DB writes and the one AI call at
the end; this module never talks to the DB or the AI.

The answers live in a `context` dict ({step_id: normalized answer}) that the
client sends back on every request. CV sections are always rebuilt from the
whole context (cv_content), never patched step by step, so re-answering a step
or switching branches can't leave stale data behind.
"""
from html import escape
from typing import Any

FIRST_STEP = "target_role"
COMPLETE = "complete"

MAX_TEXT = 200
MAX_LONG_TEXT = 1000
MAX_LIST_ITEMS = 30
MAX_LIST_ITEM = 60

CAREER_STAGES: list[tuple[str, str]] = [
    ("student", "Still studying"),
    ("graduate", "Fresh graduate"),
    ("junior", "1-3 years experience"),
    ("experienced", "3+ years experience"),
    ("career_change", "Changing careers"),
]
STAGE_LABELS = dict(CAREER_STAGES)
EARLY_STAGES = {"student", "graduate"}

# Free template picked automatically from career_stage (user can change it later).
STAGE_TEMPLATES: dict[str, str] = {
    "student": "nova",          # simple single column, short content doesn't look empty
    "graduate": "academic",     # "Inline": elegant, works for any industry
    "junior": "corporate",      # "Halo": polished, modern professional look
    "experienced": "classic",   # traditional and ATS-safe, suits corporate roles
    "career_change": "corporate",  # two-column body keeps skills visible next to experience
}
DEFAULT_TEMPLATE = "classic"  # used from the first answer until career_stage is known

_YES_NO = [{"value": "yes", "label": "Yes"}, {"value": "no", "label": "No"}]

FLOW: dict[str, dict] = {
    "target_role": {
        "question": "What job are you aiming for? (e.g. \"Software Engineer\" or \"Accountant\")",
        "input_type": "text",
    },
    "career_stage": {
        "question": "Where are you in your career right now?",
        "input_type": "buttons",
        "options": [{"value": v, "label": label} for v, label in CAREER_STAGES],
    },
    "has_experience": {
        "question": "Have you had any work experience?",
        "input_type": "buttons",
        "options": _YES_NO,
    },
    "exp_role": {
        "question": "What was your job title, and where did you work?",
        "input_type": "fields",
        "fields": [
            {"name": "job_title", "label": "Job title", "type": "text", "required": True},
            {"name": "company", "label": "Company", "type": "text", "required": True},
        ],
    },
    "exp_dates": {
        "question": "When did you start, and when did it end?",
        "input_type": "fields",
        "fields": [
            {"name": "start_date", "label": "Start date", "type": "text", "required": True},
            {"name": "end_date", "label": "End date", "type": "text", "required": True,
             "required_unless": "current"},
            {"name": "current", "label": "I still work here", "type": "checkbox"},
        ],
    },
    "exp_work": {
        "question": "What did you do in this job?",
        "hint": "A few words is fine.",
        "input_type": "text",
        "max_length": MAX_LONG_TEXT,
    },
    "exp_work_followup": {
        "question": "Thanks! Can you add one more detail, like a task you did often or a tool you used?",
        "hint": "You can skip this.",
        "input_type": "text",
        "optional": True,
        "max_length": MAX_LONG_TEXT,
    },
    "project_name": {
        "question": "No problem, let's add a project instead. What was the project called?",
        "input_type": "text",
    },
    "project_work": {
        "question": "What did you do in this project?",
        "hint": "A few words is fine.",
        "input_type": "text",
        "max_length": MAX_LONG_TEXT,
    },
    "project_work_followup": {
        "question": "Thanks! Can you add one more detail, like what you built or a tool you used?",
        "hint": "You can skip this.",
        "input_type": "text",
        "optional": True,
        "max_length": MAX_LONG_TEXT,
    },
    "education": {
        "question": "What is your highest qualification, and where did you study?",
        "input_type": "fields",
        "fields": [
            {"name": "qualification", "label": "Qualification (e.g. BSc in IT, A/Levels)", "type": "text",
             "required": True},
            {"name": "institute", "label": "School, college or university", "type": "text", "required": True},
        ],
    },
    "edu_year": {
        "question": "What year did you finish?",
        "input_type": "fields",
        "fields": [
            {"name": "year", "label": "Year", "type": "text", "required": True,
             "required_unless": "still_studying"},
            {"name": "still_studying", "label": "I'm still studying", "type": "checkbox"},
        ],
    },
    "skills": {
        "question": "What are your main skills? Add a few.",
        "hint": "For example: Excel, customer service, Python.",
        "input_type": "list",
    },
    "contact": {
        "question": "How can employers reach you?",
        "input_type": "fields",
        "fields": [
            {"name": "phone", "label": "Phone number", "type": "text"},
            {"name": "city", "label": "City", "type": "text"},
        ],
    },
    "goal": {
        "question": "In one sentence, what do you want to do next in your career?",
        "hint": "Optional. This helps write your summary. You can skip it.",
        "input_type": "text",
        "optional": True,
        "max_length": 300,
    },
}

_COMPLETE_NODE = {
    "question": "That's everything! I'm putting your CV together now.",
    "input_type": "none",
}

# Same question in spirit, wording adjusted to the career_stage answer. Anything
# not listed falls back to FLOW's default text.
_STAGE_QUESTION_OVERRIDES: dict[str, dict[str, str]] = {
    "has_experience": {
        "student": "Have you had any work experience? Internships and part-time jobs count too.",
        "graduate": "Have you had any work experience? Internships and part-time jobs count too.",
        "career_change": "Have you had any work experience? Any field counts, even if it's different "
                         "from the job you want now.",
    },
    "exp_work": {
        "student": "What did you do there? Even small tasks count.",
        "graduate": "What did you do there? Even small tasks count.",
        "experienced": "What were your main responsibilities there?",
    },
    "project_name": {
        "student": "No problem, let's add a project instead. It can be from school, university or your "
                   "own time. What was it called?",
        "graduate": "No problem, let's add a project instead. It can be from university or your own "
                    "time. What was it called?",
    },
    "edu_year": {
        "student": "What year do you expect to finish?",
    },
    "skills": {
        "student": "What skills have you picked up so far, from classes, projects or on your own? Add a few.",
        "graduate": "What skills have you picked up so far, from classes, projects or on your own? Add a few.",
    },
}

_START = ["target_role", "career_stage", "has_experience"]
_EXPERIENCE_BRANCH = ["exp_role", "exp_dates", "exp_work"]
_PROJECT_BRANCH = ["project_name", "project_work"]
_END = ["education", "edu_year", "skills", "contact", "goal"]
FOLLOWUPS = {"exp_work": "exp_work_followup", "project_work": "project_work_followup"}
_FOLLOWUP_BASE = {v: k for k, v in FOLLOWUPS.items()}

VAGUE_WORD_COUNT = 3


class AnswerError(ValueError):
    """The answer can't be accepted (wrong shape, missing required field...).
    The message is safe to show to the user."""


# ── Path / navigation ─────────────────────────────────────────────────────────

def is_vague(answer: Any) -> bool:
    """Only a really thin answer (one or two words) gets the optional follow-up —
    the question itself says a few words is fine."""
    return isinstance(answer, str) and len(answer.split()) < VAGUE_WORD_COUNT


def main_steps(context: dict) -> list[str]:
    """The numbered steps for the branch implied by context. Before has_experience
    is answered this assumes the (longer) experience branch."""
    branch = _PROJECT_BRANCH if context.get("has_experience") == "no" else _EXPERIENCE_BRANCH
    return _START + branch + _END


def active_steps(context: dict) -> list[str]:
    """main_steps plus any follow-up the answers so far have triggered."""
    steps: list[str] = []
    for step in main_steps(context):
        steps.append(step)
        followup = FOLLOWUPS.get(step)
        if followup and step in context and is_vague(context[step]):
            steps.append(followup)
    return steps


def progress_for(step: str, context: dict) -> tuple[int, int]:
    """Follow-ups share their base step's number so they don't change the total."""
    order = main_steps(context)
    total = len(order)
    if step == COMPLETE:
        return total, total
    return order.index(_FOLLOWUP_BASE.get(step, step)) + 1, total


def next_step(step: str, context: dict) -> str:
    """Call with context that already includes this step's answer."""
    steps = active_steps(context)
    idx = steps.index(step)
    return steps[idx + 1] if idx + 1 < len(steps) else COMPLETE


def previous_step(step: str, context: dict) -> str | None:
    steps = active_steps(context)
    if step == COMPLETE:
        return steps[-1]
    if step not in steps:
        return None
    idx = steps.index(step)
    return steps[idx - 1] if idx > 0 else None


def prune_context(context: dict) -> dict:
    """Drop answers for steps that are no longer on the path (e.g. the experience
    answers after has_experience was changed to "no")."""
    keep = set(active_steps(context))
    return {k: v for k, v in context.items() if k in keep}


def clean_context(context: Any) -> dict:
    """Re-validate a context sent back by the client: unknown keys are dropped,
    every answer is normalized again (so it can't be the wrong shape), and
    answers off the current path are pruned."""
    if not isinstance(context, dict):
        raise AnswerError("Invalid answers.")
    cleaned = {step: normalize_answer(step, context[step]) for step in FLOW if step in context}
    return prune_context(cleaned)


def check_can_answer(step: str, context: dict) -> None:
    """The step must be on the current path and every step before it answered."""
    if step not in FLOW:
        raise AnswerError("Unknown step.")
    steps = active_steps(context)
    if step not in steps:
        raise AnswerError("That question isn't part of your current path.")
    missing = [s for s in steps[: steps.index(step)] if s not in context]
    if missing:
        raise AnswerError("Please answer the earlier questions first.")


def is_complete(context: dict) -> bool:
    return all(step in context for step in active_steps(context))


def apply_answer(step: str, raw_answer: Any, context: dict) -> tuple[dict, str]:
    """Validate + store one answer (replacing any earlier answer to the same step)
    and return (new_context, next_step_id)."""
    check_can_answer(step, context)
    new_context = dict(context)
    new_context[step] = normalize_answer(step, raw_answer)
    new_context = prune_context(new_context)
    return new_context, next_step(step, new_context)


# ── Answer validation ─────────────────────────────────────────────────────────

def _clean_text(value: Any, max_length: int, label: str = "answer") -> str:
    if value is None:
        return ""
    if not isinstance(value, (str, int, float)) or isinstance(value, bool):
        raise AnswerError(f"Please type your {label} as text.")
    text = str(value).strip()
    if len(text) > max_length:
        raise AnswerError(f"Your {label} is too long. Please keep it under {max_length} characters.")
    return text


def normalize_answer(step: str, raw: Any) -> Any:
    node = FLOW[step]
    input_type = node["input_type"]
    optional = node.get("optional", False)

    if input_type == "text":
        text = _clean_text(raw, node.get("max_length", MAX_TEXT))
        if not text and not optional:
            raise AnswerError("Please type an answer.")
        return text

    if input_type == "buttons":
        choice = _clean_text(raw, MAX_TEXT).lower()
        for option in node["options"]:
            if choice in (option["value"], option["label"].lower()):
                return option["value"]
        raise AnswerError("Please pick one of the options.")

    if input_type == "fields":
        if not isinstance(raw, dict):
            raise AnswerError("Please fill in the fields.")
        values: dict[str, Any] = {}
        for field in node["fields"]:
            if field["type"] == "checkbox":
                values[field["name"]] = bool(raw.get(field["name"]))
            else:
                values[field["name"]] = _clean_text(raw.get(field["name"]), MAX_TEXT, field["label"].lower())
        for field in node["fields"]:
            if not field.get("required") or values[field["name"]]:
                continue
            unless = field.get("required_unless")
            if unless and values.get(unless):
                continue
            raise AnswerError(f"Please fill in: {field['label']}.")
        # "I still work here" means there is no end date.
        if values.get("current"):
            values["end_date"] = ""
        return values

    if input_type == "list":
        if isinstance(raw, str):
            items = raw.replace("\n", ",").split(",")
        elif isinstance(raw, list):
            items = raw
        else:
            raise AnswerError("Please list your skills.")
        cleaned: list[str] = []
        seen: set[str] = set()
        for item in items:
            text = _clean_text(item, MAX_LIST_ITEM, "skill")
            if text and text.lower() not in seen:
                seen.add(text.lower())
                cleaned.append(text)
        if len(cleaned) > MAX_LIST_ITEMS:
            raise AnswerError(f"Please add at most {MAX_LIST_ITEMS} skills.")
        if not cleaned and not optional:
            raise AnswerError("Please add at least one skill.")
        return cleaned

    raise AnswerError("This step doesn't take an answer.")


# ── Payload for the client ────────────────────────────────────────────────────

def question_for(step: str, context: dict) -> str:
    if step == COMPLETE:
        return _COMPLETE_NODE["question"]
    overrides = _STAGE_QUESTION_OVERRIDES.get(step, {})
    return overrides.get(context.get("career_stage", ""), FLOW[step]["question"])


def build_step_payload(cv_id: int | None, step: str, context: dict) -> dict:
    node = _COMPLETE_NODE if step == COMPLETE else FLOW[step]
    current, total = progress_for(step, context)
    return {
        "cv_id": cv_id,
        "step": step,
        "question": question_for(step, context),
        "hint": node.get("hint"),
        "input_type": node["input_type"],
        "options": node.get("options"),
        "fields": node.get("fields"),
        "optional": node.get("optional", False),
        # The earlier answer to this step, so the client can prefill it after Back.
        "prefill": context.get(step),
        "can_go_back": previous_step(step, context) is not None,
        "progress": {"current": current, "total": total},
        "context": context,
        "complete": step == COMPLETE,
    }


# ── Answers → CV content ──────────────────────────────────────────────────────

def template_for_stage(stage: str | None) -> str:
    return STAGE_TEMPLATES.get(stage or "", DEFAULT_TEMPLATE)


def _join_answers(base: str, extra: str) -> str:
    base, extra = (base or "").strip(), (extra or "").strip()
    if not extra:
        return base
    if base and base[-1] not in ".!?":
        base += "."
    return f"{base} {extra}".strip()


def work_text(context: dict) -> str:
    """The user's own words about their job or project (base + optional follow-up)."""
    if context.get("has_experience") == "no":
        return _join_answers(context.get("project_work", ""), context.get("project_work_followup", ""))
    return _join_answers(context.get("exp_work", ""), context.get("exp_work_followup", ""))


def summary_facts(context: dict) -> dict[str, Any]:
    """Every fact the summary is allowed to use — nothing else is sent to the AI."""
    role = context.get("exp_role") or {}
    edu = context.get("education") or {}
    edu_year = context.get("edu_year") or {}
    facts: dict[str, Any] = {
        "target_role": context.get("target_role", ""),
        "career_stage": STAGE_LABELS.get(context.get("career_stage", ""), ""),
        "qualification": edu.get("qualification", ""),
        "institute": edu.get("institute", ""),
        "still_studying": bool(edu_year.get("still_studying")),
        "year_finished": edu_year.get("year", ""),
        "skills": context.get("skills") or [],
        "career_goal": context.get("goal", ""),
    }
    if context.get("has_experience") == "no":
        facts["project_name"] = context.get("project_name", "")
        facts["project_work"] = work_text(context)
    else:
        facts["job_title"] = role.get("job_title", "")
        facts["company"] = role.get("company", "")
        facts["still_works_there"] = bool((context.get("exp_dates") or {}).get("current"))
        facts["job_work"] = work_text(context)
    return facts


def _bullets_html(lines: list[str]) -> str:
    lines = [line.strip() for line in lines if line and line.strip()]
    if not lines:
        return ""
    return "<ul>" + "".join(f"<li><p>{escape(line)}</p></li>" for line in lines) + "</ul>"


def cv_content(context: dict, polished: dict | None = None) -> dict[str, Any]:
    """Section data the quick-start owns, rebuilt from the whole context.

    `polished` (from the final AI step) may hold "bullets" (experience),
    "project_description" and "summary"; without it the user's own words are used,
    so a CV abandoned half way still shows what they typed."""
    polished = polished or {}
    has_experience = context.get("has_experience")
    content: dict[str, Any] = {
        "target_role": context.get("target_role", ""),
        "personal_details": {
            "title": context.get("target_role", ""),
            "phone": (context.get("contact") or {}).get("phone", ""),
            "location": (context.get("contact") or {}).get("city", ""),
        },
    }

    experience_entries = []
    role = context.get("exp_role")
    if has_experience != "no" and role:
        dates = context.get("exp_dates") or {}
        bullets = polished.get("bullets") or [work_text(context)]
        experience_entries.append({
            "id": "onboarding-experience",
            "job_title": role.get("job_title", ""),
            "employer": role.get("company", ""),
            "employer_link": "",
            "location": "",
            "start_date": dates.get("start_date", ""),
            "end_date": dates.get("end_date", ""),
            "current": bool(dates.get("current")),
            "description": _bullets_html(bullets),
        })
    content["experience"] = {"entries": experience_entries}

    project_entries = []
    if has_experience == "no" and context.get("project_name"):
        description = polished.get("project_description") or work_text(context)
        project_entries.append({
            "id": "onboarding-project",
            "title": context.get("project_name", ""),
            "subtitle": "",
            "start_date": "",
            "end_date": "",
            "description": f"<p>{escape(description)}</p>" if description else "",
            "link": "",
            "tech": [],
        })
    content["projects"] = {"entries": project_entries}

    education_entries = []
    edu = context.get("education")
    if edu:
        edu_year = context.get("edu_year") or {}
        year = edu_year.get("year", "")
        if edu_year.get("still_studying"):
            end_date = f"Expected {year}" if year else "Present"
        else:
            end_date = year
        education_entries.append({
            "id": "onboarding-education",
            "degree": edu.get("qualification", ""),
            "institution": edu.get("institute", ""),
            "institution_link": "",
            "location": "",
            "start_date": "",
            "end_date": end_date,
            "score_type": "",
            "score_value": "",
            "description": "",
        })
    content["education"] = {"entries": education_entries}

    content["skills"] = {
        "display_style": "text",
        "entries": [
            {"id": f"onboarding-skill-{i}", "skill_name": name, "level": "", "subskills": ""}
            for i, name in enumerate(context.get("skills") or [])
        ],
    }

    if "summary" in polished:
        content["profile_summary"] = {"summary": polished["summary"]}
    return content


# ── The one free AI generation ────────────────────────────────────────────────

def generation_block_reason(created_via: str | None, generated_at: Any) -> str | None:
    """None if this CV may use the quick-start's free AI generation, otherwise a
    message for the user. (Ownership is checked by the route before this.)"""
    if created_via != "onboarding":
        return ("This CV wasn't made with the quick-start, so the free quick-start AI "
                "can't be used on it. You can still use Zeni in the CV builder.")
    if generated_at is not None:
        return ("The free quick-start AI has already been used for this CV. You can keep "
                "improving it with Zeni in the CV builder.")
    return None
