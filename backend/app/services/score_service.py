import math
import re
from app.models.cv_document import CVSection, SectionType

# Mirrors frontend/components/cv-builder/RightPanel.tsx's computeATSScore,
# computeSubScores and computeJobMatch -- kept in sync manually since the
# frontend versions still run client-side for instant feedback. This module
# is the source of truth for what Free vs Pro users actually receive from
# the API.

ROLE_KEYWORDS: dict[str, list[str]] = {
    "backend": ["Node.js", "Python", "PostgreSQL", "REST APIs", "Docker", "AWS", "MongoDB", "SQL"],
    "frontend": ["React", "TypeScript", "CSS", "JavaScript", "Next.js", "Tailwind"],
    "fullstack": ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    "full stack": ["React", "Node.js", "TypeScript", "PostgreSQL", "REST APIs"],
    "data scientist": ["Python", "Machine Learning", "SQL", "TensorFlow", "Pandas"],
    "data engineer": ["Python", "SQL", "Spark", "AWS", "dbt", "Airflow"],
    "devops": ["Docker", "Kubernetes", "AWS", "CI/CD", "Linux", "Terraform"],
    "mobile": ["React Native", "iOS", "Android", "Swift", "Kotlin"],
    "product manager": ["Product Roadmap", "Agile", "Jira", "User Research", "KPIs"],
    "designer": ["Figma", "UI/UX", "Sketch", "Adobe XD", "Prototyping"],
}

ACTION_VERBS = [
    "led", "managed", "built", "designed", "developed", "created", "implemented", "launched",
    "improved", "reduced", "increased", "achieved", "delivered", "coordinated", "analyzed",
    "optimized", "automated", "streamlined", "drove", "established", "generated", "negotiated",
    "spearheaded", "architected", "deployed", "migrated", "refactored",
]

_TAG_RE = re.compile(r"<[^>]+>")
_DIGIT_RE = re.compile(r"\d+")


def _round(x: float) -> int:
    """Matches JS Math.round (round-half-up) for the non-negative scores used here."""
    return int(math.floor(x + 0.5))


def _section_data(sections: list[CVSection], section_type: SectionType) -> dict:
    for s in sections:
        if s.section_type == section_type:
            return s.data or {}
    return {}


def compute_ats_score(sections: list[CVSection]) -> tuple[int, list[str]]:
    score = 0
    missing: list[str] = []

    personal = _section_data(sections, SectionType.personal_details)
    summary = _section_data(sections, SectionType.profile_summary)
    experience = _section_data(sections, SectionType.experience)
    education = _section_data(sections, SectionType.education)
    skills = _section_data(sections, SectionType.skills)
    languages = _section_data(sections, SectionType.languages)

    if personal.get("full_name"):
        score += 6
    else:
        missing.append("Full name")
    if personal.get("email"):
        score += 6
    else:
        missing.append("Email address")
    if personal.get("phone"):
        score += 4
    else:
        missing.append("Phone number")
    links = personal.get("links") or []
    if any(l.get("platform") == "LinkedIn" for l in links):
        score += 4
    else:
        missing.append("LinkedIn profile")

    sum_len = len(summary.get("summary") or "")
    if sum_len > 200:
        score += 10
    elif sum_len > 80:
        score += 6
    elif sum_len > 20:
        score += 3
    else:
        missing.append("Profile summary")

    exp_entries = experience.get("entries") or []
    if len(exp_entries) >= 3:
        score += 30
    elif len(exp_entries) == 2:
        score += 22
    elif len(exp_entries) == 1:
        score += 15
    else:
        missing.append("Work experience")

    edu_entries = education.get("entries") or []
    if len(edu_entries) >= 1:
        score += 15
    else:
        missing.append("Education")

    skill_entries = skills.get("entries") or []
    if len(skill_entries) >= 8:
        score += 15
    elif len(skill_entries) >= 4:
        score += 10
    elif len(skill_entries) >= 1:
        score += 6
    else:
        missing.append("Skills")

    lang_entries = languages.get("entries") or []
    if len(lang_entries) >= 1:
        score += 5
    else:
        missing.append("Languages")

    total_bullets = sum(len(e.get("bullets") or []) for e in exp_entries)
    if total_bullets >= 6:
        score += 5
    elif total_bullets >= 3:
        score += 3

    return min(100, score), missing


def compute_sub_scores(sections: list[CVSection], target_role: str) -> dict[str, dict]:
    exp_data = _section_data(sections, SectionType.experience)
    skill_data = _section_data(sections, SectionType.skills)
    personal = _section_data(sections, SectionType.personal_details)
    exp_entries = exp_data.get("entries") or []
    skill_entries = skill_data.get("entries") or []
    all_bullets = [b for e in exp_entries for b in (e.get("bullets") or []) if b.get("text")]

    # Content Quality
    content_score = 0
    content_tip = "Add experience bullets to improve content quality"
    if all_bullets:
        n = len(all_bullets)
        with_verb = sum(1 for b in all_bullets if b["text"].strip().lower().split(" ")[0] in ACTION_VERBS)
        with_metric = sum(1 for b in all_bullets if _DIGIT_RE.search(b["text"]))
        content_score = _round((with_verb / n) * 50 + (with_metric / n) * 50)
        lacking = n - with_metric
        content_tip = (
            f"Add numbers to {lacking} more bullet{'s' if lacking > 1 else ''}" if lacking > 0 else "Great use of metrics!"
        )

    # Keyword Match
    skill_names = [(s.get("skill_name") or "").lower() for s in skill_entries]
    keyword_score = 0
    keyword_tip = "Set a target role above for keyword matching"
    if target_role:
        role_lower = target_role.lower()
        keywords: list[str] = []
        for key, kws in ROLE_KEYWORDS.items():
            if key in role_lower:
                keywords = kws
                break
        if keywords:
            matched = [kw for kw in keywords if any(kw.lower() in sn for sn in skill_names)]
            keyword_score = _round((len(matched) / len(keywords)) * 100)
            missing_kw = [kw for kw in keywords if not any(kw.lower() in sn for sn in skill_names)]
            keyword_tip = f"Consider adding: {', '.join(missing_kw[:2])}" if missing_kw else f"Great {target_role} keyword coverage!"
        else:
            keyword_score = min(100, len(skill_entries) * 12)
            keyword_tip = "Add more role-relevant skills" if len(skill_entries) < 8 else "Good skill coverage"
    else:
        keyword_score = min(100, len(skill_entries) * 12)
        keyword_tip = "Add more skills or set a target role" if len(skill_entries) < 8 else "Set a target role for specific matching"

    # Completeness
    CORE = [
        SectionType.personal_details, SectionType.profile_summary, SectionType.experience,
        SectionType.education, SectionType.skills, SectionType.languages, SectionType.projects,
        SectionType.certificates, SectionType.awards, SectionType.references,
    ]
    filled = 0
    first_missing = ""
    for t in CORE:
        sec = next((s for s in sections if s.section_type == t), None)
        if not sec:
            if not first_missing:
                first_missing = t.value.replace("_", " ")
            continue
        d = sec.data or {}
        if t == SectionType.personal_details:
            ok = bool(d.get("full_name")) and bool(d.get("email"))
        elif t == SectionType.profile_summary:
            ok = len(_TAG_RE.sub("", d.get("summary") or "").strip()) > 30
        else:
            ok = len(d.get("entries") or []) > 0
        if ok:
            filled += 1
        elif not first_missing:
            first_missing = t.value.replace("_", " ")
    completeness_score = _round((filled / len(CORE)) * 100)
    completeness_tip = (
        f'Fill "{first_missing}" to reach {_round((filled + 1) / len(CORE) * 100)}%' if first_missing else "All core sections complete!"
    )

    # Readability
    raw_summary = _section_data(sections, SectionType.profile_summary).get("summary") or ""
    plain_summary = _TAG_RE.sub("", raw_summary).strip()
    word_count = len([w for w in re.split(r"\s+", plain_summary) if w])
    read_score, read_tip = 30, "Add a profile summary"
    if word_count > 0:
        if word_count <= 100:
            read_score, read_tip = 90, "Perfect length summary!"
        elif word_count <= 150:
            read_score, read_tip = 70, f"Summary is {word_count} words — aim for under 100"
        else:
            read_score, read_tip = 40, f"Your summary is {word_count} words — cut it down"

    # Experience Score
    experience_score = 0
    experience_tip = "Add work experience entries"
    if exp_entries:
        n = len(exp_entries)
        with_dates = sum(1 for e in exp_entries if e.get("start_date"))
        with_bullets = sum(1 for e in exp_entries if len(e.get("bullets") or []) >= 2)
        experience_score = min(100, _round((40 if n >= 3 else n * 15) + (with_dates / n) * 30 + (with_bullets / n) * 30))
        if n < 3:
            remaining = 3 - n
            experience_tip = f"Add {remaining} more experience {'entries' if remaining > 1 else 'entry'}"
        elif with_bullets < n:
            experience_tip = "Add at least 2 bullets to each job"
        else:
            experience_tip = "Great experience section!"

    # Skills Score
    skills_score = 0
    skills_tip = "Add skills to your CV"
    if skill_entries:
        n = len(skill_entries)
        with_level = sum(1 for s in skill_entries if s.get("level"))
        skills_score = min(100, _round(min(60, n * 7.5) + (with_level / n) * 40))
        if n < 8:
            skills_tip = f"Add {8 - n} more skills"
        elif with_level < n / 2:
            skills_tip = "Add proficiency levels to your skills"
        else:
            skills_tip = "Excellent skills section!"

    # Format Score
    has_photo = bool(personal.get("photo_base64") or personal.get("photo_url"))
    has_title = bool(personal.get("title"))
    has_location = bool(personal.get("location"))
    has_links = len(personal.get("links") or []) > 0
    format_points = sum(
        1 for v in [personal.get("full_name"), personal.get("email"), personal.get("phone"), has_photo, has_title, has_location, has_links] if v
    )
    format_score = _round((format_points / 7) * 100)
    if not personal.get("full_name"):
        format_tip = "Add your name"
    elif not personal.get("email"):
        format_tip = "Add your email"
    elif not has_title:
        format_tip = "Add a professional title"
    elif not has_location:
        format_tip = "Add your location"
    elif not has_photo:
        format_tip = "Add a profile photo"
    elif not has_links:
        format_tip = "Add social/portfolio links"
    else:
        format_tip = "Great header information!"

    # Impact Score
    impact_score = 0
    impact_tip = "Add experience with measurable achievements"
    if all_bullets:
        n = len(all_bullets)
        with_metric = sum(1 for b in all_bullets if _DIGIT_RE.search(b["text"]))
        with_verb = sum(1 for b in all_bullets if b["text"].strip().lower().split(" ")[0] in ACTION_VERBS)
        weak_phrases = sum(
            1 for b in all_bullets if any(w in b["text"].lower() for w in ["responsible for", "helped", "assisted", "worked on"])
        )
        impact_score = min(100, _round((with_metric / n) * 50 + (with_verb / n) * 30 + ((n - weak_phrases) / n) * 20))
        lacking = n - with_metric
        if lacking > 0:
            impact_tip = f"Add metrics to {lacking} bullet{'s' if lacking > 1 else ''}"
        elif weak_phrases > 0:
            impact_tip = f"Remove weak phrases from {weak_phrases} bullet{'s' if weak_phrases > 1 else ''}"
        else:
            impact_tip = "Excellent impact language!"

    return {
        "contentQuality": {"label": "Content Quality", "score": content_score, "tip": content_tip, "section_type": "experience"},
        "keywordMatch": {"label": "Keyword Match", "score": keyword_score, "tip": keyword_tip, "section_type": "skills"},
        "completeness": {"label": "Completeness", "score": completeness_score, "tip": completeness_tip, "section_type": None},
        "readability": {"label": "Readability", "score": read_score, "tip": read_tip, "section_type": "profile_summary"},
        "experience": {"label": "Experience", "score": experience_score, "tip": experience_tip, "section_type": "experience"},
        "skills": {"label": "Skills", "score": skills_score, "tip": skills_tip, "section_type": "skills"},
        "format": {"label": "CV Format", "score": format_score, "tip": format_tip, "section_type": "personal_details"},
        "impact": {"label": "Impact", "score": impact_score, "tip": impact_tip, "section_type": "experience"},
    }


def compute_job_match(sections: list[CVSection], job_description: str) -> int:
    if not job_description or not job_description.strip():
        return 0

    parts: list[str] = []
    for s in sections:
        d = s.data or {}
        if s.section_type == SectionType.profile_summary:
            parts.append(d.get("summary") or "")
        elif s.section_type == SectionType.skills:
            parts.append(" ".join(e.get("skill_name", "") for e in (d.get("entries") or [])))
        elif s.section_type == SectionType.experience:
            entry_strs = []
            for e in (d.get("entries") or []):
                bullets_text = " ".join(b.get("text", "") for b in (e.get("bullets") or []))
                entry_strs.append(f"{e.get('job_title', '')} {e.get('employer', '')} {bullets_text}")
            parts.append(" ".join(entry_strs))
        else:
            parts.append("")
    cv_text = " ".join(parts).lower()

    job_words = [w for w in re.split(r"\W+", job_description.lower()) if len(w) > 3]
    unique_words = list(dict.fromkeys(job_words))
    if not unique_words:
        return 0

    matched = [w for w in unique_words if w in cv_text]
    return _round((len(matched) / len(unique_words)) * 100)
