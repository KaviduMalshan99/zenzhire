from pydantic import BaseModel
from datetime import datetime
from typing import Any, Optional


class ATSCompatibilityDetail(BaseModel):
    has_tables: bool
    has_images: bool
    has_multiple_columns: bool
    font_issues: bool
    proper_section_headings: bool
    clean_text_extraction: bool
    file_size_ok: bool


class ATSCompatibilityLayer(BaseModel):
    score: float
    max_score: int
    percentage: float
    details: ATSCompatibilityDetail
    issues: list[str]


class SectionsDetail(BaseModel):
    has_summary: bool
    has_experience: bool
    has_education: bool
    has_skills: bool
    correct_order: bool
    contact_name: bool
    contact_email: bool
    contact_phone: bool
    contact_linkedin: bool


class SectionsLayer(BaseModel):
    score: float
    max_score: int
    percentage: float
    details: SectionsDetail
    missing_sections: list[str]
    issues: list[str]


class KeywordLayer(BaseModel):
    score: float
    max_score: int
    percentage: float
    match_percentage: float
    matched_keywords: list[str]
    missing_keywords: list[str]
    semantic_matches: list[str]
    total_jd_keywords: int
    mode: str


class BulletAnalysis(BaseModel):
    total_bullets: int
    with_action_verb: int
    with_metrics: int
    achievement_focused: int
    weak_phrases_found: list[str]


class ContentLayer(BaseModel):
    score: float
    max_score: int
    percentage: float
    bullet_analysis: BulletAnalysis
    issues: list[str]
    suggestions: list[str]


class GrammarError(BaseModel):
    message: str
    context: str
    suggestion: str
    offset: Optional[int] = None


class GrammarLayer(BaseModel):
    score: float
    max_score: int
    percentage: float
    grammar_errors: list[GrammarError]
    filler_words: list[str]
    tense_issues: list[str]
    error_count: int
    issues: list[str]


class ProfessionalDetail(BaseModel):
    has_linkedin: bool
    has_portfolio: bool
    dates_complete: bool
    has_certifications: bool
    no_employment_gaps: bool


class ProfessionalLayer(BaseModel):
    score: float
    max_score: int
    percentage: float
    details: ProfessionalDetail
    issues: list[str]


class RecruiterLayer(BaseModel):
    score: float
    max_score: int
    percentage: float
    first_impression: str
    strengths: list[str]
    red_flags: list[str]
    seniority_assessment: str
    hire_likelihood: float
    most_important_improvement: str


class ATSLayers(BaseModel):
    ats_compatibility: ATSCompatibilityLayer
    sections_structure: SectionsLayer
    keyword_match: KeywordLayer
    content_quality: ContentLayer
    language_grammar: GrammarLayer
    professional_data: ProfessionalLayer
    ai_recruiter: RecruiterLayer


class ATSResultRead(BaseModel):
    id: int
    user_id: int
    overall_score: float
    layers: Any
    cv_filename: str
    job_description: Optional[str]
    target_role: Optional[str]
    target_industry: Optional[str]
    has_job_description: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ATSHistoryItem(BaseModel):
    id: int
    cv_filename: str
    overall_score: float
    target_role: Optional[str]
    has_job_description: bool
    created_at: datetime

    model_config = {"from_attributes": True}
