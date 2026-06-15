export type PlanType = "free" | "pro";

// ── CV Builder ────────────────────────────────────────────────────────────────

export type TemplateId =
  | "classic" | "modern" | "minimal" | "executive"
  | "tech" | "creative" | "academic" | "gcc";

export type SectionType =
  | "personal_details" | "profile_summary" | "experience" | "education"
  | "skills" | "languages" | "projects" | "courses" | "certificates"
  | "awards" | "interests" | "publications" | "organizations"
  | "references" | "declaration";

export const SECTION_LABELS: Record<SectionType, string> = {
  personal_details: "Personal Details",
  profile_summary: "Profile Summary",
  experience: "Experience",
  education: "Education",
  skills: "Skills",
  languages: "Languages",
  projects: "Projects",
  courses: "Courses",
  certificates: "Certificates",
  awards: "Awards",
  interests: "Interests",
  publications: "Publications",
  organizations: "Organizations",
  references: "References",
  declaration: "Declaration",
};

export type SaveStatus = "idle" | "saving" | "saved";

export const OPTIONAL_SECTIONS: SectionType[] = [
  "profile_summary", "experience", "education", "skills", "languages",
  "projects", "courses", "certificates", "awards", "interests",
  "publications", "organizations", "references", "declaration",
];

export const REPEATABLE_SECTION_TYPES: SectionType[] = [
  "experience", "education", "projects", "courses",
  "certificates", "awards", "publications", "organizations",
];

export interface CVSection {
  id: number;
  cv_id: number;
  section_type: SectionType;
  display_order: number;
  is_visible: boolean;
  data: Record<string, any>;
  created_at: string;
  updated_at: string | null;
}

export interface CVDocument {
  id: number;
  user_id: number;
  title: string;
  template_id: TemplateId;
  is_primary: boolean;
  created_at: string;
  updated_at: string | null;
  sections: CVSection[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  plan: PlanType;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface PersonalInfo {
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  summary: string;
}

export interface WorkExperience {
  company: string;
  title: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  start_date: string;
  end_date: string;
  gpa: string;
}

export interface CVData {
  personal_info: PersonalInfo;
  work_experience: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: string[];
  certifications: string[];
}

export interface CV {
  id: number;
  user_id: number;
  title: string;
  data: CVData;
  created_at: string;
  updated_at: string | null;
}

// ── ATS ────────────────────────────────────────────────────────────────────────

export interface LayerBase {
  score: number;
  max_score: number;
  percentage: number;
  issues: string[];
}

export interface ATSCompatibilityDetail {
  has_tables: boolean;
  has_images: boolean;
  has_multiple_columns: boolean;
  font_issues: boolean;
  proper_section_headings: boolean;
  clean_text_extraction: boolean;
  file_size_ok: boolean;
}

export interface ATSCompatibilityLayer extends LayerBase {
  details: ATSCompatibilityDetail;
}

export interface SectionsDetail {
  has_summary: boolean;
  has_experience: boolean;
  has_education: boolean;
  has_skills: boolean;
  correct_order: boolean;
  contact_name: boolean;
  contact_email: boolean;
  contact_phone: boolean;
  contact_linkedin: boolean;
}

export interface SectionsLayer extends LayerBase {
  details: SectionsDetail;
  missing_sections: string[];
}

export interface KeywordLayer extends LayerBase {
  match_percentage: number;
  matched_keywords: string[];
  missing_keywords: string[];
  semantic_matches: string[];
  total_jd_keywords: number;
  mode: "jd_match" | "industry_coverage";
}

export interface BulletAnalysis {
  total_bullets: number;
  with_action_verb: number;
  with_metrics: number;
  achievement_focused: number;
  weak_phrases_found: string[];
}

export interface ContentLayer extends LayerBase {
  bullet_analysis: BulletAnalysis;
  suggestions: string[];
}

export interface GrammarError {
  message: string;
  context: string;
  suggestion: string;
  offset: number | null;
}

export interface GrammarLayer extends LayerBase {
  grammar_errors: GrammarError[];
  filler_words: string[];
  tense_issues: string[];
  error_count: number;
}

export interface ProfessionalDetail {
  has_linkedin: boolean;
  has_portfolio: boolean;
  dates_complete: boolean;
  has_certifications: boolean;
  no_employment_gaps: boolean;
}

export interface ProfessionalLayer extends LayerBase {
  details: ProfessionalDetail;
}

export interface RecruiterLayer extends LayerBase {
  first_impression: string;
  strengths: string[];
  red_flags: string[];
  seniority_assessment: string;
  hire_likelihood: number;
  most_important_improvement: string;
}

export interface ATSLayers {
  ats_compatibility: ATSCompatibilityLayer;
  sections_structure: SectionsLayer;
  keyword_match: KeywordLayer;
  content_quality: ContentLayer;
  language_grammar: GrammarLayer;
  professional_data: ProfessionalLayer;
  ai_recruiter: RecruiterLayer;
}

export interface ATSResult {
  id: number;
  user_id: number;
  overall_score: number;
  layers: ATSLayers;
  cv_filename: string;
  job_description: string | null;
  target_role: string | null;
  target_industry: string | null;
  has_job_description: boolean;
  created_at: string;
}

export interface ATSHistoryItem {
  id: number;
  cv_filename: string;
  overall_score: number;
  target_role: string | null;
  has_job_description: boolean;
  created_at: string;
}
