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
    "make_professional": (
        "Rewrite this CV text to sound more "
        "professional, confident and polished. "
        "Use formal language suitable for a senior "
        "professional CV. Return only the rewritten text."
    ),
    "make_longer": (
        "Expand this CV text to be more detailed and "
        "comprehensive. Add relevant context, impact, "
        "and supporting details. Keep it professional. "
        "Return only the expanded text."
    ),
    "fix_grammar": (
        "Fix all grammar, spelling, and punctuation "
        "errors in this text. Do not change the meaning "
        "or style. Return only the corrected text."
    ),
    "add_keywords": (
        "Add relevant ATS keywords and industry "
        "buzzwords to this text based on the role "
        "context provided. Keep it natural and "
        "professional. Return only the improved text."
    ),
    "generate_summary": (
        "Write a professional CV profile summary for "
        "this person based on the context provided. "
        "3-4 sentences. Strong opening, key skills, "
        "career goal. Return only the summary text."
    ),
    "improve_description": (
        "Improve this description to be more impactful, "
        "clear and professional for a CV. "
        "Return only the improved text."
    ),
    "add_impact": (
        "Rewrite this to emphasize the impact, results "
        "and value delivered. Add metrics if possible. "
        "Return only the improved text."
    ),
    "change_tone": (
        "Rewrite this text with the specified tone. "
        "executive = formal and authoritative. "
        "technical = precise and detail-focused. "
        "friendly = warm and approachable. "
        "Return only the rewritten text."
    ),
    "find_trending_skills": (
        "List 10 trending and in-demand skills for "
        "the role context provided. Focus on skills "
        "that appear frequently in job postings right "
        "now. Return as a comma-separated list only."
    ),
    "translate": (
        "Translate this CV text to the language "
        "specified in the context. Keep the professional "
        "tone and CV formatting intact. "
        "Return only the translated text."
    ),
    "remove_weak_words": (
        "Remove weak phrases like 'responsible for', "
        "'helped', 'assisted', 'worked on' and replace "
        "them with strong action verbs and achievement "
        "focused language. Return only the improved text."
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


async def generate_cover_letter(
    job_title: str,
    company: str,
    job_description: str,
    tone: str = "formal",
    cv_data: dict = None,
) -> str:
    tone_desc = {
        "formal": "formal, professional and respectful. Use full sentences and avoid contractions.",
        "friendly": "warm, friendly and personable while staying professional. Show enthusiasm and personality.",
        "confident": "confident, direct and assertive. Show strong conviction and leadership voice.",
    }.get(tone, "formal and professional")

    cv_context = ""
    if cv_data:
        personal = cv_data.get("personal", {})
        name = personal.get("full_name", "")
        current_title = personal.get("title", "")
        summary = cv_data.get("summary", "")
        skills = cv_data.get("skills", [])
        experience = cv_data.get("experience", [])

        exp_text = "\n".join([
            f"- {e.get('job_title', '')} at {e.get('employer', '')}"
            for e in experience[:3]
        ])
        skills_text = ", ".join(skills[:10])

        cv_context = f"""
Candidate Information:
Name: {name}
Current Title: {current_title}
Summary: {summary}
Key Skills: {skills_text}
Recent Experience:
{exp_text}
"""

    prompt = f"""You are an expert cover letter writer. Write a compelling professional cover letter.

Tone: {tone_desc}

Job Details:
- Position: {job_title}
- Company: {company}
- Job Description:
{job_description[:1000]}

{cv_context}

Write a complete cover letter with:
1. Professional greeting
2. Strong opening paragraph explaining why you want this role at this company
3. 2 paragraphs highlighting relevant experience and skills that match the job requirements
4. Closing paragraph with call to action
5. Professional sign-off

Format as plain text with paragraph breaks. Do not include subject line or date. Start directly with "Dear Hiring Manager," or similar. Keep it under 400 words.
Return only the cover letter text."""

    message = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1000,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content[0].text.strip()
