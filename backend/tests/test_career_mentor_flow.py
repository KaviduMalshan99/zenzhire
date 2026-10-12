"""Tests for the quick-start step engine (app/services/career_mentor.py).
Pure logic only — no DB, no AI."""
from datetime import datetime, timezone

import pytest

from app.models.cv_document import FREE_TEMPLATE_IDS
from app.services import career_mentor as cm
from app.services.career_mentor import COMPLETE, FIRST_STEP, AnswerError

WITH_EXPERIENCE = {
    "target_role": "Junior Accountant",
    "career_stage": "graduate",
    "has_experience": "yes",
    "exp_role": {"job_title": "Accounts Intern", "company": "ABC Holdings"},
    "exp_dates": {"start_date": "Jan 2024", "end_date": "Jun 2024", "current": False},
    "exp_work": "Prepared invoices and did bank reconciliations",
    "education": {"qualification": "BSc in Accounting", "institute": "University of Colombo"},
    "edu_year": {"year": "2024", "still_studying": False},
    "skills": ["Excel", "QuickBooks"],
    "contact": {"phone": "0771234567", "city": "Colombo"},
    "goal": "",
}

NO_EXPERIENCE = {
    "target_role": "Frontend Developer",
    "career_stage": "student",
    "has_experience": "no",
    "project_name": "Library app",
    "project_work": "Built a React app to track borrowed books",
    "education": {"qualification": "BSc in IT", "institute": "SLIIT"},
    "edu_year": {"year": "2027", "still_studying": True},
    "skills": "React, JavaScript, git",
    "contact": {"phone": "", "city": "Kandy"},
    "goal": "Get my first developer job",
}


def walk(answers: dict, context: dict | None = None, step: str = FIRST_STEP):
    """Answer every question in order; returns (context, [(step, progress), ...])."""
    context = dict(context or {})
    seen = []
    while step != COMPLETE:
        seen.append((step, cm.progress_for(step, context)))
        context, step = cm.apply_answer(step, answers[step], context)
    return context, seen


# ── Both branches reach the end ───────────────────────────────────────────────

def test_experience_branch_reaches_the_end():
    context, seen = walk(WITH_EXPERIENCE)
    assert [s for s, _ in seen] == [
        "target_role", "career_stage", "has_experience",
        "exp_role", "exp_dates", "exp_work",
        "education", "edu_year", "skills", "contact", "goal",
    ]
    assert cm.is_complete(context)
    content = cm.cv_content(context)
    assert content["experience"]["entries"][0]["employer"] == "ABC Holdings"
    assert content["projects"]["entries"] == []


def test_no_experience_branch_reaches_the_end():
    context, seen = walk(NO_EXPERIENCE)
    assert [s for s, _ in seen] == [
        "target_role", "career_stage", "has_experience",
        "project_name", "project_work",
        "education", "edu_year", "skills", "contact", "goal",
    ]
    assert cm.is_complete(context)
    content = cm.cv_content(context)
    assert content["experience"]["entries"] == []
    assert content["projects"]["entries"][0]["title"] == "Library app"
    assert [e["skill_name"] for e in content["skills"]["entries"]] == ["React", "JavaScript", "git"]
    assert content["skills"]["_title"] == "Skills"
    assert content["education"]["entries"][0]["end_date"] == "Expected 2027"


def test_not_complete_until_last_question():
    context, _ = walk({**WITH_EXPERIENCE})
    del context["goal"]
    assert not cm.is_complete(context)


# ── Progress ──────────────────────────────────────────────────────────────────

def test_progress_experience_branch_counts_1_to_11():
    _, seen = walk(WITH_EXPERIENCE)
    assert [p for _, p in seen] == [(i, 11) for i in range(1, 12)]


def test_progress_no_experience_branch_counts_1_to_10():
    _, seen = walk(NO_EXPERIENCE)
    # Before has_experience is answered the longer path (11) is assumed.
    assert [p for _, p in seen[:3]] == [(1, 11), (2, 11), (3, 11)]
    assert [p for _, p in seen[3:]] == [(i, 10) for i in range(4, 11)]


def test_progress_complete_is_full():
    context, _ = walk(NO_EXPERIENCE)
    assert cm.progress_for(COMPLETE, context) == (10, 10)


def test_followup_on_thin_answer_keeps_its_progress_slot():
    answers = {**WITH_EXPERIENCE, "exp_work": "Invoices", "exp_work_followup": "Used Excel daily"}
    context, seen = walk(answers)
    steps = [s for s, _ in seen]
    assert steps[steps.index("exp_work") + 1] == "exp_work_followup"
    progress = dict(seen)
    assert progress["exp_work"] == progress["exp_work_followup"] == (6, 11)
    assert progress["goal"] == (11, 11)
    assert cm.work_text(context) == "Invoices. Used Excel daily"


def test_followup_can_be_skipped():
    answers = {**WITH_EXPERIENCE, "exp_work": "Invoices", "exp_work_followup": ""}
    context, _ = walk(answers)
    assert cm.is_complete(context)
    assert cm.work_text(context) == "Invoices"


# ── Back + re-answer ──────────────────────────────────────────────────────────

def test_back_returns_previous_step_with_prefill():
    context, _ = walk(WITH_EXPERIENCE)
    previous = cm.previous_step(COMPLETE, context)
    assert previous == "goal"
    assert cm.previous_step("education", context) == "exp_work"
    assert cm.previous_step(FIRST_STEP, context) is None
    payload = cm.build_step_payload(1, "exp_role", context)
    assert payload["prefill"] == {"job_title": "Accounts Intern", "company": "ABC Holdings"}
    assert payload["can_go_back"] is True
    assert cm.build_step_payload(None, FIRST_STEP, {})["can_go_back"] is False


def test_reanswer_replaces_old_answer():
    context, _ = walk(WITH_EXPERIENCE)
    context, nxt = cm.apply_answer("exp_role", {"job_title": "Audit Trainee", "company": "XYZ"}, context)
    assert nxt == "exp_dates"
    assert context["exp_role"] == {"job_title": "Audit Trainee", "company": "XYZ"}
    entry = cm.cv_content(context)["experience"]["entries"][0]
    assert (entry["job_title"], entry["employer"]) == ("Audit Trainee", "XYZ")


def test_switching_yes_to_no_removes_experience():
    # Walk to exp_work, then go back to has_experience and answer "no".
    context = {}
    step = FIRST_STEP
    while step != "exp_work":
        context, step = cm.apply_answer(step, WITH_EXPERIENCE[step], context)
    assert cm.cv_content(context)["experience"]["entries"]  # entry exists from exp_role
    step = cm.previous_step(step, context)   # exp_dates
    step = cm.previous_step(step, context)   # exp_role
    step = cm.previous_step(step, context)   # has_experience
    assert step == "has_experience"

    context, nxt = cm.apply_answer("has_experience", "no", context)
    assert nxt == "project_name"
    assert not {"exp_role", "exp_dates", "exp_work"} & context.keys()
    assert cm.cv_content(context)["experience"]["entries"] == []
    assert cm.progress_for(nxt, context) == (4, 10)

    context, _ = walk(NO_EXPERIENCE, context, step=nxt)
    assert cm.is_complete(context)
    assert cm.cv_content(context)["experience"]["entries"] == []


def test_switching_no_to_yes_removes_project():
    context, _ = walk(NO_EXPERIENCE)
    context, nxt = cm.apply_answer("has_experience", "yes", context)
    assert nxt == "exp_role"
    assert not {"project_name", "project_work"} & context.keys()
    assert cm.cv_content(context)["projects"]["entries"] == []
    assert not cm.is_complete(context)  # the experience questions are now unanswered


def test_detailed_reanswer_drops_followup():
    answers = {**WITH_EXPERIENCE, "exp_work": "Invoices", "exp_work_followup": "Used Excel"}
    context, _ = walk(answers)
    context, nxt = cm.apply_answer("exp_work", "Prepared invoices and checked payments", context)
    assert nxt == "education"
    assert "exp_work_followup" not in context


# ── Guards / validation ───────────────────────────────────────────────────────

def test_cannot_skip_ahead_or_answer_off_path():
    with pytest.raises(AnswerError):
        cm.apply_answer("skills", ["Excel"], {})
    context, _ = walk(WITH_EXPERIENCE)
    with pytest.raises(AnswerError):
        cm.apply_answer("project_name", "Library app", context)
    with pytest.raises(AnswerError):
        cm.apply_answer("not_a_step", "x", context)


def test_answer_validation():
    with pytest.raises(AnswerError):
        cm.normalize_answer("target_role", "   ")
    with pytest.raises(AnswerError):
        cm.normalize_answer("career_stage", "astronaut")
    with pytest.raises(AnswerError):
        cm.normalize_answer("exp_dates", {"start_date": "2024", "end_date": ""})
    with pytest.raises(AnswerError):
        cm.normalize_answer("skills", [])
    assert cm.normalize_answer("career_stage", "Fresh graduate") == "graduate"
    assert cm.normalize_answer("exp_dates", {"start_date": "2024", "end_date": "2025", "current": True}) == {
        "start_date": "2024", "end_date": "", "current": True,
    }
    assert cm.normalize_answer("contact", {}) == {"phone": "", "city": ""}
    assert cm.normalize_answer("skills", "Excel, excel, , Word") == ["Excel", "Word"]


def test_clean_context_drops_junk_and_bad_shapes():
    context, _ = walk(WITH_EXPERIENCE)
    assert cm.clean_context({**context, "evil": "x"}) == context
    with pytest.raises(AnswerError):
        cm.clean_context({**context, "exp_role": "not a dict"})


def test_stage_wording_mentions_internships_for_early_stages():
    for stage in ("student", "graduate"):
        question = cm.question_for("has_experience", {"career_stage": stage})
        assert "Internships" in question and "part-time" in question


# ── Template mapping ──────────────────────────────────────────────────────────

def test_every_stage_maps_to_a_free_template():
    free = {t.value for t in FREE_TEMPLATE_IDS}
    for stage, _ in cm.CAREER_STAGES:
        assert cm.template_for_stage(stage) in free
    assert cm.template_for_stage(None) == cm.DEFAULT_TEMPLATE in free


# ── AI free once ──────────────────────────────────────────────────────────────

def test_ai_once_rule():
    assert cm.generation_block_reason("onboarding", None) is None
    # After the first generation, a second one is blocked.
    assert cm.generation_block_reason("onboarding", datetime.now(timezone.utc)) is not None
    # Builder CVs and old rows can never use it.
    assert cm.generation_block_reason("builder", None) is not None
    assert cm.generation_block_reason(None, None) is not None


def test_polished_text_replaces_raw_text():
    context, _ = walk(WITH_EXPERIENCE)
    content = cm.cv_content(context, {"bullets": ["Prepared invoices", "Reconciled bank accounts"],
                                      "summary": "Accounting graduate."})
    assert content["experience"]["entries"][0]["description"] == (
        "<ul><li><p>Prepared invoices</p></li><li><p>Reconciled bank accounts</p></li></ul>"
    )
    assert content["profile_summary"] == {"summary": "Accounting graduate."}
    assert "profile_summary" not in cm.cv_content(context)
