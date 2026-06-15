import json
import anthropic
from app.core.config import settings

client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

_ACTION_PROMPTS: dict[str, str] = {
    "improve_bullet": (
        "Improve this CV bullet point to be more impactful. Use a strong action verb, "
        "be specific, and quantify the result if possible. Return only the improved bullet text."
    ),
    "add_metrics": (
        "Add specific metrics and quantifiable achievements to this bullet point. "
        "If exact numbers are unknown, use realistic estimates (e.g., '~30%', 'a team of 5'). "
        "Return only the improved bullet text."
    ),
    "convert_to_achievement": (
        "Convert this task-focused statement into an achievement-focused bullet using the "
        "CAR framework (Challenge–Action–Result). Return only the improved bullet text."
    ),
    "generate_star": (
        "Generate a STAR-format (Situation–Task–Action–Result) bullet point based on the "
        "provided text. Keep it concise, one to two sentences. Return only the bullet text."
    ),
    "rewrite_professionally": (
        "Rewrite this text to be more professional, polished, and concise for a CV. "
        "Return only the rewritten text."
    ),
    "make_shorter": (
        "Make this text significantly shorter while keeping the key information. "
        "Return only the shortened text."
    ),
    "tailor_for_role": (
        "Tailor this CV text to be more relevant and impactful for the target role context provided. "
        "Use industry-appropriate keywords. Return only the tailored text."
    ),
    "suggest_skills": (
        "Based on the role context provided, suggest 8–12 additional relevant skills that are "
        "commonly expected for this role. Return as a comma-separated list only."
    ),
    "group_skills": (
        "Group these skills by category (e.g., Programming Languages, Frameworks, Tools, "
        "Cloud & DevOps, Databases, Soft Skills). Return as JSON: "
        '{\"groups\": [{\"category\": \"...\", \"skills\": [...]}]}'
    ),
}


async def improve_cv_text(text: str, action: str, context: str = "") -> str:
    instruction = _ACTION_PROMPTS.get(
        action, "Improve this CV text to be more professional and impactful."
    )
    context_line = f"\n\nRole/Context: {context}" if context.strip() else ""

    prompt = f"""{instruction}{context_line}

Text to improve:
{text}"""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=600,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()


async def analyze_cv_with_ai(cv_text: str, job_description: str | None) -> dict:
    jd_section = (
        f"\n\nJOB DESCRIPTION:\n{job_description}"
        if job_description
        else "\n\nNo job description provided — perform a general ATS analysis."
    )

    prompt = f"""You are an expert ATS (Applicant Tracking System) analyzer and career coach.

Analyze the following CV and return a JSON object with this exact structure:
{{
  "score": <float 0-100>,
  "feedback": {{
    "strengths": [<list of strings>],
    "improvements": [<list of strings>],
    "keywords_missing": [<list of keywords from JD missing in CV>],
    "keywords_found": [<list of relevant keywords found in CV>],
    "formatting_tips": [<list of formatting improvement tips>],
    "overall_summary": "<one paragraph summary>"
  }}
}}

CV TEXT:
{cv_text}
{jd_section}

Return ONLY the JSON object, no markdown fences, no extra text."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = message.content[0].text.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        start = raw.find("{")
        end = raw.rfind("}") + 1
        return json.loads(raw[start:end])
