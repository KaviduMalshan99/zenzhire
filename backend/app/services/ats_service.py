"""
7-layer CV analysis engine for ZenzHire ATS Checker.

Layer weights:
  1. ATS Compatibility     — 20 pts
  2. Sections & Structure  — 10 pts
  3. Keyword & Skill Match — 25 pts
  4. Content Quality       — 20 pts
  5. Language & Grammar    — 10 pts
  6. Professional Data     —  5 pts
  7. AI Recruiter Sim      — 10 pts
  Total                    — 100 pts
"""

import re
import json
from typing import Optional
import fitz
import anthropic
from app.core.config import settings

_ai_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

# ── lazy model handles ─────────────────────────────────────────────────────────

_sentence_model = None
_language_tool = None


def _get_sentence_model():
    global _sentence_model
    if _sentence_model is None:
        try:
            from sentence_transformers import SentenceTransformer
            _sentence_model = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception:
            pass
    return _sentence_model


def _get_language_tool():
    global _language_tool
    if _language_tool is None:
        try:
            import language_tool_python
            _language_tool = language_tool_python.LanguageTool("en-US")
        except Exception:
            pass
    return _language_tool


# ── constants ──────────────────────────────────────────────────────────────────

ACTION_VERBS = {
    "accelerated", "achieved", "analyzed", "architected", "automated", "built",
    "championed", "collaborated", "configured", "consolidated", "coordinated",
    "created", "delivered", "deployed", "designed", "developed", "devised",
    "directed", "drove", "engineered", "established", "evaluated", "executed",
    "facilitated", "formulated", "generated", "identified", "implemented",
    "improved", "increased", "initiated", "integrated", "launched", "led",
    "managed", "mentored", "migrated", "negotiated", "optimized", "oversaw",
    "partnered", "pioneered", "produced", "reduced", "refactored", "researched",
    "resolved", "revamped", "saved", "secured", "spearheaded", "streamlined",
    "supervised", "trained", "transformed", "utilized",
}

WEAK_PHRASES = [
    "responsible for", "helped with", "worked on", "assisted with",
    "involved in", "participated in", "part of a team", "duties included",
    "tasked with", "was in charge of", "helped to", "tried to", "attempted to",
]

FILLER_WORDS = [
    "basically", "very", "really", "just", "quite", "actually",
    "literally", "obviously", "clearly", "simply", "various", "numerous",
]

SECTION_RE = {
    "summary": r"\b(summary|objective|profile|about me|professional summary|career objective|overview)\b",
    "experience": r"\b(experience|work history|employment|work experience|professional experience|career history)\b",
    "education": r"\b(education|academic|qualifications?|degrees?|academic background)\b",
    "skills": r"\b(skills?|technical skills?|competenc(?:y|ies)|expertise|technologies|tools?)\b",
    "certifications": r"\b(certifications?|certificates?|credentials?|licenses?|accreditations?)\b",
}

INDUSTRY_SKILLS: dict[str, list[str]] = {
    "software engineer":   ["Python", "JavaScript", "Java", "SQL", "Git", "Docker", "AWS", "REST APIs", "React"],
    "data scientist":      ["Python", "R", "Machine Learning", "SQL", "TensorFlow", "pandas", "Statistics", "Scikit-learn"],
    "product manager":     ["Agile", "Scrum", "Roadmap", "User Research", "Analytics", "A/B Testing", "Stakeholder Management"],
    "devops engineer":     ["Docker", "Kubernetes", "CI/CD", "Jenkins", "AWS", "Terraform", "Linux", "Python"],
    "data engineer":       ["Python", "SQL", "Spark", "ETL", "Airflow", "AWS", "Kafka", "Data Pipelines"],
    "frontend developer":  ["JavaScript", "React", "TypeScript", "HTML", "CSS", "Redux", "REST APIs", "Webpack"],
    "backend developer":   ["Python", "Java", "Node.js", "SQL", "REST APIs", "Microservices", "Docker", "PostgreSQL"],
    "ux designer":         ["Figma", "User Research", "Prototyping", "Wireframing", "Usability Testing", "Adobe XD"],
    "marketing manager":   ["SEO", "Google Analytics", "Content Marketing", "Social Media", "CRM", "Email Marketing"],
    "financial analyst":   ["Excel", "Financial Modeling", "SQL", "Budgeting", "Forecasting", "Bloomberg", "Tableau"],
    "project manager":     ["Agile", "Scrum", "Risk Management", "Stakeholder Management", "JIRA", "Budget Management"],
    "cybersecurity":       ["Penetration Testing", "SIEM", "Firewalls", "Risk Assessment", "Python", "Network Security"],
}

METRIC_RE = re.compile(
    r"\b\d+\s*[\%\+x]|\$[\d,]+|\b\d[\d,]*\s*"
    r"(users?|customers?|clients?|people|team|members?|percent|million|billion|k\b|"
    r"projects?|hours?|days?|weeks?|months?|years?)\b",
    re.IGNORECASE,
)


# ── layer 1: ATS compatibility ─────────────────────────────────────────────────

def _layer_ats_compatibility(cv_text: str, cv_bytes: Optional[bytes]) -> dict:
    score = 20.0
    issues: list[str] = []
    details = {
        "has_tables": False,
        "has_images": False,
        "has_multiple_columns": False,
        "font_issues": False,
        "proper_section_headings": True,
        "clean_text_extraction": True,
        "file_size_ok": True,
    }

    if cv_bytes:
        try:
            doc = fitz.open(stream=cv_bytes, filetype="pdf")
            kb = len(cv_bytes) / 1024
            if kb > 5000:
                details["file_size_ok"] = False
                score -= 3
                issues.append(f"File too large ({kb:.0f} KB) — keep under 5 MB.")

            fonts: set[str] = set()
            for page in doc:
                # tables
                try:
                    if page.find_tables().tables:
                        details["has_tables"] = True
                except Exception:
                    pass
                # images
                if page.get_images():
                    details["has_images"] = True
                # fonts & columns
                page_dict = page.get_text("dict")
                for block in page_dict.get("blocks", []):
                    for line in block.get("lines", []):
                        for span in line.get("spans", []):
                            fonts.add(span.get("font", ""))

                blocks = page.get_text("blocks")
                if blocks:
                    buckets = set(int(b[0] / 120) for b in blocks)
                    if len(buckets) >= 3:
                        details["has_multiple_columns"] = True

            doc.close()

            if details["has_tables"]:
                score -= 3
                issues.append("Tables detected — ATS systems often cannot parse table content.")
            if details["has_images"]:
                score -= 2
                issues.append("Images detected — remove photos and graphics for ATS compatibility.")
            if details["has_multiple_columns"]:
                score -= 3
                issues.append("Multi-column layout detected — use a single-column format.")
            if len(fonts) > 3:
                details["font_issues"] = True
                score -= 2
                issues.append(f"{len(fonts)} fonts detected — keep to 1-2 fonts maximum.")
        except Exception:
            issues.append("PDF structure could not be fully analysed.")

    if len(cv_text.strip()) < 200:
        details["clean_text_extraction"] = False
        score -= 4
        issues.append("Very little text extracted — ensure the PDF is not image-based or scanned.")

    if not re.search(r"\b(experience|education|skills|summary)\b", cv_text, re.I):
        details["proper_section_headings"] = False
        score -= 3
        issues.append("Standard section headings not found — add clear section titles.")

    score = round(max(0.0, score), 1)
    return {
        "score": score,
        "max_score": 20,
        "percentage": round(score / 20 * 100, 1),
        "details": details,
        "issues": issues,
    }


# ── layer 2: sections & structure ──────────────────────────────────────────────

def _layer_sections(cv_text: str) -> dict:
    tl = cv_text.lower()
    issues: list[str] = []
    missing: list[str] = []
    score = 0.0

    has_summary = bool(re.search(SECTION_RE["summary"], tl))
    has_experience = bool(re.search(SECTION_RE["experience"], tl))
    has_education = bool(re.search(SECTION_RE["education"], tl))
    has_skills = bool(re.search(SECTION_RE["skills"], tl))

    if has_summary:
        score += 1.5
    else:
        missing.append("Summary / Objective")

    if has_experience:
        score += 2.0
    else:
        missing.append("Work Experience")

    if has_education:
        score += 2.0
    else:
        missing.append("Education")

    if has_skills:
        score += 2.0
    else:
        missing.append("Skills")

    def _pos(pattern: str) -> int:
        m = re.search(pattern, tl)
        return m.start() if m else 999_999

    pos_s = _pos(SECTION_RE["summary"])
    pos_e = _pos(SECTION_RE["experience"])
    pos_d = _pos(SECTION_RE["education"])
    correct_order = pos_s < pos_e and pos_e < pos_d

    if correct_order:
        score += 1.0
    else:
        issues.append("Recommended order: Summary → Experience → Education → Skills")

    has_name = len(cv_text.split("\n")[0].strip()) > 2
    has_email = bool(re.search(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", cv_text))
    has_phone = bool(re.search(r"(\+?[\d\s\-\(\)]{7,15})", cv_text))
    has_linkedin = bool(re.search(r"linkedin\.com/in/", cv_text, re.I))

    if has_name:
        score += 0.5
    else:
        issues.append("Name not detected at top of CV")

    if has_email:
        score += 0.5
    else:
        issues.append("Email address not found")

    if has_phone:
        score += 0.5
    else:
        issues.append("Phone number not found")

    if missing:
        issues = [f"Missing section: {s}" for s in missing] + issues

    score = round(min(10.0, score), 1)
    return {
        "score": score,
        "max_score": 10,
        "percentage": round(score / 10 * 100, 1),
        "details": {
            "has_summary": has_summary,
            "has_experience": has_experience,
            "has_education": has_education,
            "has_skills": has_skills,
            "correct_order": correct_order,
            "contact_name": has_name,
            "contact_email": has_email,
            "contact_phone": has_phone,
            "contact_linkedin": has_linkedin,
        },
        "missing_sections": missing,
        "issues": issues,
    }


# ── layer 3: keyword & skill match ────────────────────────────────────────────

def _extract_jd_keywords(jd: str) -> list[str]:
    stop = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
        "of", "with", "by", "from", "as", "is", "are", "was", "were", "be",
        "been", "have", "has", "had", "do", "does", "did", "will", "would",
        "could", "should", "may", "might", "you", "we", "our", "your", "this",
        "that", "these", "those", "who", "which", "what", "work", "experience",
        "years", "year", "strong", "excellent", "good", "must", "required",
        "preferred", "team", "role", "position", "candidate", "ability",
    }
    seen: set[str] = set()
    result: list[str] = []

    def _add(k: str) -> None:
        k = k.strip()
        if len(k) > 2 and k.lower() not in seen and k.lower() not in stop:
            seen.add(k.lower())
            result.append(k)

    for m in re.findall(r"\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)+\b", jd):
        _add(m)
    for m in re.findall(r"\b[A-Z]{2,8}\b", jd):
        _add(m)
    for m in re.findall(r"\b[\w]+\.(?:js|py|net|rb|go|io)\b|C\+\+|C#|\.NET", jd):
        _add(m)
    for m in re.findall(r"\b[a-zA-Z]{4,}\b", jd):
        _add(m)

    return result[:50]


def _match_keywords(cv_text: str, keywords: list[str]) -> tuple[list[str], list[str], list[str]]:
    cv_lower = cv_text.lower()
    matched, missing, semantic = [], [], []

    model = _get_sentence_model()
    if model:
        try:
            from sentence_transformers import util
            cv_sents = [s.strip() for s in re.split(r"[.\n]", cv_text) if len(s.strip()) > 20]
            if cv_sents:
                cv_emb = model.encode(cv_sents, convert_to_tensor=True)
                for kw in keywords:
                    if kw.lower() in cv_lower:
                        matched.append(kw)
                    else:
                        kw_emb = model.encode(kw, convert_to_tensor=True)
                        score = float(util.cos_sim(kw_emb, cv_emb)[0].max())
                        if score > 0.52:
                            semantic.append(f"{kw} (semantic)")
                            matched.append(kw)
                        else:
                            missing.append(kw)
                return matched, missing, semantic
        except Exception:
            pass

    # fallback: exact match
    for kw in keywords:
        (matched if kw.lower() in cv_lower else missing).append(kw)
    return matched, missing, []


def _layer_keywords(
    cv_text: str,
    job_description: Optional[str],
    target_role: Optional[str],
    target_industry: Optional[str],
) -> dict:
    if job_description and len(job_description.strip()) > 50:
        kws = _extract_jd_keywords(job_description)
        matched, missing, semantic = _match_keywords(cv_text, kws)
        total = len(kws)
        pct = (len(matched) / total * 100) if total else 0
        score = round(pct / 100 * 25, 1)
        return {
            "score": score,
            "max_score": 25,
            "percentage": round(score / 25 * 100, 1),
            "match_percentage": round(pct, 1),
            "matched_keywords": matched[:25],
            "missing_keywords": missing[:25],
            "semantic_matches": semantic[:10],
            "total_jd_keywords": total,
            "mode": "jd_match",
        }

    # industry coverage fallback
    role_key = None
    if target_role:
        rl = target_role.lower()
        for key in INDUSTRY_SKILLS:
            if key in rl or rl in key:
                role_key = key
                break

    expected = INDUSTRY_SKILLS.get(role_key or "", [
        "Communication", "Problem Solving", "Teamwork", "Leadership", "Project Management",
    ])
    cv_lower = cv_text.lower()
    matched_ind = [s for s in expected if s.lower() in cv_lower]
    missing_ind = [s for s in expected if s.lower() not in cv_lower]
    pct = (len(matched_ind) / len(expected) * 100) if expected else 50
    # max 20 without JD (job description gives the extra 5 pts)
    score = round(pct / 100 * 20, 1)
    return {
        "score": score,
        "max_score": 25,
        "percentage": round(score / 25 * 100, 1),
        "match_percentage": round(pct, 1),
        "matched_keywords": matched_ind,
        "missing_keywords": missing_ind,
        "semantic_matches": [],
        "total_jd_keywords": len(expected),
        "mode": "industry_coverage",
    }


# ── layer 4: content quality ──────────────────────────────────────────────────

def _layer_content_quality(cv_text: str) -> dict:
    # Extract bullet-like lines
    bullets: list[str] = []
    for line in cv_text.split("\n"):
        line = line.strip()
        m = re.match(r"^[•\-\*►▸▪◦‣⋅]\s*(.+)$", line)
        if m:
            bullets.append(m.group(1).strip())
        elif re.match(r"^\d+\.\s+.+$", line):
            bullets.append(re.sub(r"^\d+\.\s+", "", line))

    if not bullets:
        bullets = [
            l.strip() for l in cv_text.split("\n")
            if 40 < len(l.strip()) < 300
            and not re.search(SECTION_RE["experience"] + "|" + SECTION_RE["skills"], l.lower())
        ][:25]

    total = len(bullets)
    if total == 0:
        return {
            "score": 10.0,
            "max_score": 20,
            "percentage": 50.0,
            "bullet_analysis": {
                "total_bullets": 0,
                "with_action_verb": 0,
                "with_metrics": 0,
                "achievement_focused": 0,
                "weak_phrases_found": [],
            },
            "issues": ["No bullet points detected — use bullet points to describe achievements clearly."],
            "suggestions": ["Format experience with bullet points starting with action verbs."],
        }

    with_action = 0
    with_metrics = 0
    achievement_focused = 0
    weak_found: set[str] = set()
    ach_words = {
        "improved", "increased", "reduced", "saved", "achieved", "delivered",
        "exceeded", "grew", "generated", "cut", "boosted", "doubled",
    }

    for bullet in bullets:
        words = bullet.split()
        if words and words[0].lower().rstrip(".,;:") in ACTION_VERBS:
            with_action += 1
        if METRIC_RE.search(bullet):
            with_metrics += 1
            achievement_focused += 1
        bl = bullet.lower()
        for ph in WEAK_PHRASES:
            if ph in bl:
                weak_found.add(ph)
        if any(w in bl for w in ach_words):
            achievement_focused += 1

    achievement_focused = min(achievement_focused, total)

    action_r = with_action / total
    metric_r = with_metrics / total
    ach_r = achievement_focused / total
    weak_r = len(weak_found) / max(total, 1)

    score = action_r * 8 + metric_r * 7 + ach_r * 3 + (1 - min(weak_r, 1)) * 2
    score = round(min(20.0, max(0.0, score)), 1)

    issues, suggestions = [], []
    if with_action < total * 0.7:
        n = total - with_action
        issues.append(f"{n} bullet{'s' if n != 1 else ''} do not start with a strong action verb.")
        suggestions.append("Start each bullet with a past-tense action verb: Led, Built, Increased, Reduced…")
    if with_metrics < total * 0.4:
        issues.append(f"Only {with_metrics}/{total} bullets contain measurable results.")
        suggestions.append("Add numbers: percentages, dollar amounts, team sizes, timeframes.")
    if weak_found:
        quoted = ", ".join(f'"{p}"' for p in list(weak_found)[:3])
        issues.append(f"Weak language detected: {quoted}")
        suggestions.append("Replace passive phrases with active achievement statements.")

    return {
        "score": score,
        "max_score": 20,
        "percentage": round(score / 20 * 100, 1),
        "bullet_analysis": {
            "total_bullets": total,
            "with_action_verb": with_action,
            "with_metrics": with_metrics,
            "achievement_focused": achievement_focused,
            "weak_phrases_found": list(weak_found),
        },
        "issues": issues,
        "suggestions": suggestions,
    }


# ── layer 5: language & grammar ────────────────────────────────────────────────

def _layer_grammar(cv_text: str) -> dict:
    grammar_errors: list[dict] = []
    filler_found: list[str] = []
    tense_issues: list[str] = []
    issues: list[str] = []

    tl = cv_text.lower()

    # filler words
    for fw in FILLER_WORDS:
        cnt = len(re.findall(r"\b" + fw + r"\b", tl))
        if cnt:
            filler_found.append(f"{fw} ({cnt}×)")

    # tense consistency in experience section
    exp_m = re.search(
        r"(experience|employment|work history)(.*?)(education|skills|certifications|$)",
        tl, re.DOTALL,
    )
    if exp_m:
        exp = exp_m.group(2)
        pres = len(re.findall(r"\b(manage|develop|lead|handle|create|build|maintain)\b", exp))
        past = len(re.findall(r"\b(managed|developed|led|handled|created|built|maintained)\b", exp))
        if pres > 2 and past > 2:
            tense_issues.append("Mixed present and past tenses in experience section.")
            issues.append("Use consistent past tense for previous roles.")

    # language_tool_python (requires Java)
    lt = _get_language_tool()
    if lt:
        try:
            sample = cv_text[:3000]
            for match in lt.check(sample)[:15]:
                grammar_errors.append({
                    "message": match.message,
                    "context": (match.context or "")[:100],
                    "suggestion": match.replacements[0] if match.replacements else "",
                    "offset": match.offset,
                })
        except Exception:
            pass

    # fallback: pyspellchecker
    if not grammar_errors:
        try:
            from spellchecker import SpellChecker
            spell = SpellChecker()
            words = re.findall(r"\b[a-zA-Z]{3,}\b", cv_text)
            check = [w.lower() for w in words if not w[0].isupper()]
            for bad in list(spell.unknown(check[:300]))[:10]:
                fix = spell.correction(bad)
                if fix and fix != bad:
                    grammar_errors.append({
                        "message": f"Possible spelling error: '{bad}'",
                        "context": bad,
                        "suggestion": fix,
                        "offset": None,
                    })
        except Exception:
            pass

    cnt = len(grammar_errors)
    if cnt == 0:
        score = 10.0
    elif cnt <= 2:
        score = 8.0
    elif cnt <= 5:
        score = 6.0
    elif cnt <= 10:
        score = 4.0
    else:
        score = 2.0

    if filler_found:
        score = max(0.0, score - 1.0)
        issues.append(f"Filler words: {', '.join(filler_found[:5])}")
    if tense_issues:
        score = max(0.0, score - 1.0)
    if cnt:
        issues.append(f"{cnt} grammar/spelling issue{'s' if cnt != 1 else ''} detected.")

    return {
        "score": round(score, 1),
        "max_score": 10,
        "percentage": round(score / 10 * 100, 1),
        "grammar_errors": grammar_errors,
        "filler_words": filler_found,
        "tense_issues": tense_issues,
        "error_count": cnt,
        "issues": issues,
    }


# ── layer 6: professional data ────────────────────────────────────────────────

def _layer_professional(cv_text: str) -> dict:
    issues: list[str] = []
    score = 0.0

    has_linkedin = bool(re.search(r"linkedin\.com/in/[\w\-]+", cv_text, re.I))
    has_portfolio = bool(re.search(
        r"github\.com/[\w\-]+|behance\.net|dribbble\.com|portfolio|[\w\-]+\.dev\b|[\w\-]+\.io\b",
        cv_text, re.I,
    ))

    date_re = (
        r"\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?"
        r"|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{4}\b"
        r"|\b\d{1,2}/\d{4}\b|\b\d{4}\s*[-–]\s*(\d{4}|present|current)\b"
    )
    dates_complete = len(re.findall(date_re, cv_text, re.I)) >= 2

    has_certs = bool(re.search(r"certif|certificate|certified|credentials?|license|accredit", cv_text, re.I))

    years = sorted({int(y) for y in re.findall(r"\b(20\d{2})\b", cv_text)})
    no_gaps = True
    for i in range(len(years) - 1):
        if years[i + 1] - years[i] > 2:
            no_gaps = False
            break

    if has_linkedin:
        score += 1.5
    else:
        issues.append("No LinkedIn URL — add linkedin.com/in/yourprofile")

    if has_portfolio:
        score += 1.0
    else:
        issues.append("No portfolio or GitHub link — add relevant online presence")

    if dates_complete:
        score += 1.0
    else:
        issues.append("Incomplete or missing dates in experience/education")

    if has_certs:
        score += 1.0
    else:
        issues.append("No certifications listed — add relevant certifications if applicable")

    if no_gaps:
        score += 0.5
    else:
        issues.append("Potential employment gap detected — address briefly if present")

    return {
        "score": round(score, 1),
        "max_score": 5,
        "percentage": round(score / 5 * 100, 1),
        "details": {
            "has_linkedin": has_linkedin,
            "has_portfolio": has_portfolio,
            "dates_complete": dates_complete,
            "has_certifications": has_certs,
            "no_employment_gaps": no_gaps,
        },
        "issues": issues,
    }


# ── layer 7: AI recruiter simulation ──────────────────────────────────────────

async def _layer_ai_recruiter(
    cv_text: str,
    target_role: Optional[str],
    target_industry: Optional[str],
) -> dict:
    role = target_role or "the role"
    industry = target_industry or "their industry"

    prompt = f"""You are a senior recruiter with 10+ years of experience across {industry}.

Read this CV and respond with ONLY a JSON object (no markdown, no commentary):

{{
  "first_impression": "<gut reaction in one sentence — what you think in the first 6 seconds>",
  "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
  "red_flags": ["<flag 1>", "<flag 2>", "<flag 3>"],
  "seniority_assessment": "<Junior (0-2 yrs) | Mid-level (3-5 yrs) | Senior (6-10 yrs) | Staff/Principal (10+ yrs)>",
  "hire_likelihood": <integer 0-100>,
  "most_important_improvement": "<the single highest-impact change the candidate could make>"
}}

Target role: {role}

CV:
{cv_text[:4000]}"""

    try:
        msg = _ai_client.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=700,
            messages=[{"role": "user", "content": prompt}],
        )
        raw = msg.content[0].text.strip()
        data = json.loads(raw[raw.find("{") : raw.rfind("}") + 1])

        pct = float(data.get("hire_likelihood", 50))
        if pct >= 80:
            score = 10.0
        elif pct >= 65:
            score = 8.0
        elif pct >= 50:
            score = 6.0
        elif pct >= 35:
            score = 4.0
        else:
            score = 2.0

        return {
            "score": score,
            "max_score": 10,
            "percentage": round(score / 10 * 100, 1),
            "first_impression": data.get("first_impression", ""),
            "strengths": data.get("strengths", [])[:3],
            "red_flags": data.get("red_flags", [])[:3],
            "seniority_assessment": data.get("seniority_assessment", ""),
            "hire_likelihood": pct,
            "most_important_improvement": data.get("most_important_improvement", ""),
        }
    except Exception as exc:
        return {
            "score": 5.0,
            "max_score": 10,
            "percentage": 50.0,
            "first_impression": "AI analysis unavailable.",
            "strengths": [],
            "red_flags": [],
            "seniority_assessment": "Unknown",
            "hire_likelihood": 50.0,
            "most_important_improvement": str(exc)[:120],
        }


# ── overall score ──────────────────────────────────────────────────────────────

def _overall(layers: dict) -> float:
    total = sum(layers[k]["score"] for k in layers)
    return round(total, 1)


# ── public entry point ─────────────────────────────────────────────────────────

async def run_full_analysis(
    cv_text: str,
    cv_bytes: Optional[bytes],
    job_description: Optional[str],
    target_role: Optional[str],
    target_industry: Optional[str],
) -> dict:
    l1 = _layer_ats_compatibility(cv_text, cv_bytes)
    l2 = _layer_sections(cv_text)
    l3 = _layer_keywords(cv_text, job_description, target_role, target_industry)
    l4 = _layer_content_quality(cv_text)
    l5 = _layer_grammar(cv_text)
    l6 = _layer_professional(cv_text)
    l7 = await _layer_ai_recruiter(cv_text, target_role, target_industry)

    layers = {
        "ats_compatibility": l1,
        "sections_structure": l2,
        "keyword_match": l3,
        "content_quality": l4,
        "language_grammar": l5,
        "professional_data": l6,
        "ai_recruiter": l7,
    }
    return {"overall_score": _overall(layers), "layers": layers}
