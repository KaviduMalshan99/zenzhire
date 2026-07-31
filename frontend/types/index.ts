export type PlanType = "free" | "pro";

// ── CV Customization ──────────────────────────────────────────────────────────

export interface CVCustomization {
  accentColor: string;
  fontFamily: string;
  /** @deprecated superseded by lineHeight/sectionSpacing; kept for backward compatibility with existing saved CVs */
  spacing: "compact" | "normal" | "spacious";
  /** 1.0-1.8, step 0.1 */
  lineHeight: number;
  /** 8-32px, step 4 */
  sectionSpacing: number;
  headerStyle: "left" | "centered" | "twocolumn";
  headingStyle: "fullline" | "underline" | "boxed" | "plain" | "doubleline" | "leftbar" | "dotted" | "accentbadge" | "centerlines";
  skillStyle?: "classic" | "progressbar" | "dotrating" | "percentage" | "starrating" | "nameonly" | "chips";
  skillColumns?: 1 | 2 | 3;
}

export const DEFAULT_CUSTOMIZATION: CVCustomization = {
  accentColor: "#111827",
  fontFamily: "Arial",
  spacing: "normal",
  lineHeight: 1.3,
  sectionSpacing: 20,
  headerStyle: "centered",
  headingStyle: "fullline",
  skillStyle: "chips",
  skillColumns: 2,
};

type LegacySpacingEntry = { lineHeight: number; sectionSpacing: number };

// Generic fallback used for any template that hasn't had its real historical
// compact/normal/spacious rendering audited yet (see TEMPLATE_LEGACY_SPACING).
const LEGACY_SPACING_MAP: Record<CVCustomization["spacing"], LegacySpacingEntry> = {
  compact: { lineHeight: 1.1, sectionSpacing: 12 },
  normal: { lineHeight: 1.3, sectionSpacing: 20 },
  spacious: { lineHeight: 1.5, sectionSpacing: 28 },
};

// Per-template ground truth for what compact/normal/spacious actually rendered
// as before lineHeight/sectionSpacing existed -- audited from each template's
// source directly (its old marginBottom/line-height formulas), not guessed.
// Templates not yet listed here fall back to LEGACY_SPACING_MAP above; add an
// entry as each template gets wired to the new fields in a later phase.
const TEMPLATE_LEGACY_SPACING: Partial<Record<string, Record<CVCustomization["spacing"], LegacySpacingEntry>>> = {
  classic: {
    compact: { lineHeight: 1.5, sectionSpacing: 7 },
    normal: { lineHeight: 1.5, sectionSpacing: 8 },
    spacious: { lineHeight: 1.5, sectionSpacing: 10 },
  },
  creative: {
    compact: { lineHeight: 1.5, sectionSpacing: 15 },
    normal: { lineHeight: 1.5, sectionSpacing: 20 },
    spacious: { lineHeight: 1.5, sectionSpacing: 27 },
  },
  minimal: {
    compact: { lineHeight: 1.6, sectionSpacing: 11 },
    normal: { lineHeight: 1.6, sectionSpacing: 14 },
    spacious: { lineHeight: 1.6, sectionSpacing: 19 },
  },
  executive: {
    compact: { lineHeight: 1.6, sectionSpacing: 11 },
    normal: { lineHeight: 1.6, sectionSpacing: 14 },
    spacious: { lineHeight: 1.6, sectionSpacing: 19 },
  },
  tech: {
    compact: { lineHeight: 1.5, sectionSpacing: 11 },
    normal: { lineHeight: 1.5, sectionSpacing: 14 },
    spacious: { lineHeight: 1.5, sectionSpacing: 19 },
  },
  gcc: {
    compact: { lineHeight: 1.6, sectionSpacing: 8 },
    normal: { lineHeight: 1.6, sectionSpacing: 10 },
    spacious: { lineHeight: 1.6, sectionSpacing: 14 },
  },
  nova: {
    compact: { lineHeight: 1.6, sectionSpacing: 8 },
    normal: { lineHeight: 1.6, sectionSpacing: 10 },
    spacious: { lineHeight: 1.6, sectionSpacing: 14 },
  },
  // Academic's old preset gave its Profile Summary a distinct line-height
  // (compact 1.4 / normal 1.65 / spacious 1.8) separate from the container's
  // own 1.6 -- per an explicit product decision, the new lineHeight stepper
  // now governs the whole template uniformly, so that distinct summary
  // behavior is intentionally dropped in favor of the container's value.
  academic: {
    compact: { lineHeight: 1.6, sectionSpacing: 5 },
    normal: { lineHeight: 1.6, sectionSpacing: 7 },
    spacious: { lineHeight: 1.6, sectionSpacing: 12 },
  },
  modern: {
    compact: { lineHeight: 1.5, sectionSpacing: 11 },
    normal: { lineHeight: 1.5, sectionSpacing: 14 },
    spacious: { lineHeight: 1.5, sectionSpacing: 19 },
  },
  // NOTE: the original audit claimed "first section fixed 14, rest 16" for
  // Portrait, but live measurement (getBoundingClientRect in the real
  // builder preview) showed that premise was stale/inaccurate -- Portrait's
  // section-to-section gap was never actually driven by those numbers (they
  // were only ever passed to SortableSection's dead defaultMarginBottom
  // prop). The real rendered default floors at 10px via CSS margin
  // collapsing with SectionHeading's fixed marginTop: 10. Per an explicit
  // product decision, Portrait's sections now get a real, working
  // sectionSpacing-driven marginBottom for the first time (previously the
  // stepper had zero visual effect here) -- 10 is the true audited default,
  // not 16.
  portrait: {
    compact: { lineHeight: 1.6, sectionSpacing: 8 },
    normal: { lineHeight: 1.6, sectionSpacing: 10 },
    spacious: { lineHeight: 1.6, sectionSpacing: 14 },
  },
  // NOTE: the original audit claimed "summary 18, sidebar fixed 14, main
  // 16" for Milestone, but -- exactly like Portrait -- live measurement
  // showed that premise was stale/inaccurate: those numbers only ever fed
  // SortableSection's dead defaultMarginBottom prop. The real rendered
  // default floors at 10px (sidebar/main/references) via CSS margin
  // collapsing with SectionHeading's fixed marginTop: 10, and the
  // Summary-to-body gap was a near-uncontrolled 3px. Milestone's sections
  // now get a real, working sectionSpacing-driven marginBottom for the
  // first time -- 10 is the true audited default, not 16.
  milestone: {
    compact: { lineHeight: 1.6, sectionSpacing: 8 },
    normal: { lineHeight: 1.6, sectionSpacing: 10 },
    spacious: { lineHeight: 1.6, sectionSpacing: 14 },
  },
  // Unlike Portrait/Milestone, Corporate's spacing was already real and
  // functional -- CH (Corporate's own heading component, not the shared
  // SectionHeading) sets a real marginTop: Math.round(16 * sp), which
  // dominates every section's trailing gap via margin collapsing (16
  // exceeds every entry-level base in this template). Live measurement
  // confirmed a uniform 16px gap everywhere (sidebar, main, and
  // body-to-References), matching the original audit for once.
  corporate: {
    compact: { lineHeight: 1.6, sectionSpacing: 12 },
    normal: { lineHeight: 1.6, sectionSpacing: 16 },
    spacious: { lineHeight: 1.6, sectionSpacing: 22 },
  },
  // Structurally identical to Corporate: Vega's own SH heading component
  // sets a real marginTop: Math.round(16 * sp) (not the shared, dead-prop
  // SectionHeading), which dominates every section's trailing gap via
  // margin collapsing (16 exceeds every entry-level base here too). Live
  // measurement at all three presets confirmed the exact same 12/16/22
  // progression as Corporate.
  vega: {
    compact: { lineHeight: 1.6, sectionSpacing: 12 },
    normal: { lineHeight: 1.6, sectionSpacing: 16 },
    spacious: { lineHeight: 1.6, sectionSpacing: 22 },
  },
  // Same floored-at-10 mechanism as Portrait/Milestone: Aurora's main column
  // uses the SAME shared SectionHeading (fixed marginTop: 10), and its own
  // local SidebarHeading component is likewise a hardcoded marginTop: 10 --
  // neither was ever driven by the old compact/normal/spacious multiplier.
  // Live measurement confirmed the real gap floors at 10px almost
  // everywhere via margin collapsing, with occasional real bumps above it
  // (e.g. Experience's own entry margin exceeding the floor at
  // normal/spacious) -- the same minor wrinkle Portrait/Milestone's audits
  // also glossed as "10 is the true default" for.
  aurora: {
    compact: { lineHeight: 1.6, sectionSpacing: 8 },
    normal: { lineHeight: 1.6, sectionSpacing: 10 },
    spacious: { lineHeight: 1.6, sectionSpacing: 14 },
  },
};

/**
 * Always returns a fully-populated CVCustomization, regardless of whether
 * `saved` (whatever the backend returned) is null, {}, or missing keys —
 * the single place preview (cv-builder) and PDF export (cv-print) both
 * resolve customization through, so they can't independently fall back to
 * different per-field defaults for the same incomplete data.
 *
 * `templateId`, when known, resolves a legacy (pre-lineHeight/sectionSpacing)
 * saved CV to that specific template's real old appearance instead of the
 * generic fallback -- see TEMPLATE_LEGACY_SPACING.
 */
export function mergeCustomization(saved?: Partial<CVCustomization> | null, templateId?: string): CVCustomization {
  const merged = { ...DEFAULT_CUSTOMIZATION, ...(saved ?? {}) };
  if (saved?.lineHeight === undefined && saved?.sectionSpacing === undefined) {
    const preset = saved?.spacing ?? DEFAULT_CUSTOMIZATION.spacing;
    const legacy = (templateId ? TEMPLATE_LEGACY_SPACING[templateId]?.[preset] : undefined) ?? LEGACY_SPACING_MAP[preset];
    merged.lineHeight = legacy.lineHeight;
    merged.sectionSpacing = legacy.sectionSpacing;
  }
  return merged;
}

export const TEMPLATE_DEFAULT_CUSTOMIZATION: Record<string, Partial<CVCustomization>> = {
  classic:   { accentColor: "#111827", fontFamily: "Arial",   headerStyle: "centered",   headingStyle: "fullline",  skillStyle: "chips", lineHeight: 1.5, sectionSpacing: 8 },
  modern:    { accentColor: "#2563eb", fontFamily: "Roboto",  headerStyle: "left",       headingStyle: "underline", lineHeight: 1.5, sectionSpacing: 14 },
  minimal:   { accentColor: "#111827", fontFamily: "Lato",    headerStyle: "centered",   headingStyle: "fullline",  skillStyle: "chips", lineHeight: 1.6, sectionSpacing: 14 },
  executive: { accentColor: "#111827", fontFamily: "Georgia", headerStyle: "centered",   headingStyle: "fullline",  skillStyle: "chips", lineHeight: 1.6, sectionSpacing: 14 },
  tech:      { accentColor: "#2563eb", fontFamily: "Arial",   headerStyle: "left",       headingStyle: "fullline",  skillStyle: "chips", lineHeight: 1.5, sectionSpacing: 14 },
  creative:  { accentColor: "#7c3aed", fontFamily: "Lato",    headerStyle: "left",       headingStyle: "underline", skillStyle: "chips", lineHeight: 1.5, sectionSpacing: 20 },
  academic:  { accentColor: "#2563eb", fontFamily: "Georgia", headerStyle: "centered",   headingStyle: "fullline",  skillStyle: "chips", lineHeight: 1.6, sectionSpacing: 7 },
  gcc:       { accentColor: "#2563eb", fontFamily: "Arial",   headerStyle: "left",       headingStyle: "fullline",  skillStyle: "chips", lineHeight: 1.6, sectionSpacing: 10 },
  portrait:  { accentColor: "#8a6fae", fontFamily: "Lato",    headerStyle: "left",       headingStyle: "fullline",  skillStyle: "classic", lineHeight: 1.6, sectionSpacing: 10 },
  milestone:  { accentColor: "#111827", fontFamily: "Roboto",  headerStyle: "left",       headingStyle: "fullline",  skillStyle: "nameonly", lineHeight: 1.6, sectionSpacing: 10 },
  corporate:  { accentColor: "#111827", fontFamily: "Arial",   headerStyle: "left",       headingStyle: "plain",     skillStyle: "nameonly", lineHeight: 1.6, sectionSpacing: 16 },
  vega:       { accentColor: "#2c3e50", fontFamily: "Arial",   headerStyle: "left",       headingStyle: "plain",     skillStyle: "nameonly", lineHeight: 1.6, sectionSpacing: 16 },
  aurora:     { accentColor: "#111827", fontFamily: "Lato",    headerStyle: "left",       headingStyle: "fullline",  skillStyle: "nameonly", lineHeight: 1.6, sectionSpacing: 10 },
  nova:       { accentColor: "#111827", fontFamily: "Arial",   headerStyle: "left",       headingStyle: "fullline",  skillStyle: "chips", lineHeight: 1.6, sectionSpacing: 10 },
};

export const FONT_CSS_MAP: Record<string, string> = {
  Arial: "Arial, Helvetica, sans-serif",
  Georgia: "Georgia, 'Times New Roman', serif",
  Roboto: "Roboto, sans-serif",
  "Playfair Display": "'Playfair Display', serif",
  Lato: "Lato, sans-serif",
};

// ── CV Builder ────────────────────────────────────────────────────────────────

export type TemplateId =
  | "classic" | "modern" | "minimal" | "executive"
  | "tech" | "creative" | "academic" | "gcc" | "portrait" | "milestone" | "corporate" | "vega" | "aurora" | "nova";

// Templates whose JSX genuinely never reads personal_details.photo_url/photo_base64 —
// confirmed by direct source audit, not assumed. Keep in sync if a template's photo
// support changes.
export const NO_PHOTO_TEMPLATE_IDS = new Set<TemplateId>(["classic", "creative", "vega", "corporate", "milestone"]);

export type SectionType =
  | "personal_details" | "profile_summary" | "experience" | "education"
  | "skills" | "soft_skills" | "languages" | "projects" | "courses" | "certificates"
  | "awards" | "interests" | "publications" | "organizations"
  | "references" | "declaration";

export const SECTION_LABELS: Record<SectionType, string> = {
  personal_details: "Personal Details",
  profile_summary: "Profile Summary",
  experience: "Experience",
  education: "Education",
  skills: "Technical Skills",
  soft_skills: "Soft Skills",
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
  "profile_summary", "experience", "education", "skills", "soft_skills", "languages",
  "projects", "courses", "certificates", "awards", "interests",
  "publications", "organizations", "references", "declaration",
];

export const REPEATABLE_SECTION_TYPES: SectionType[] = [
  "experience", "education", "projects", "courses",
  "certificates", "awards", "publications", "organizations",
];

export interface SectionLayout {
  marginBottom?: number;
  lineHeight?: number;
}

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
  customization: CVCustomization | null;
  target_role: string | null;
  created_at: string;
  updated_at: string | null;
  sections: CVSection[];
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_admin: boolean;
  plan: PlanType;
  pro_until: string | null;
  is_pro: boolean;
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
  detected_name?: string | null;
  detected_email?: string | null;
  detected_phone?: string | null;
  detected_linkedin?: string | null;
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
  mode: "jd_match" | "ai_role_estimate";
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

export interface RecruiterLayer {
  score: number | null;
  max_score: number;
  percentage: number | null;
  issues: string[];
  first_impression: string;
  strengths: string[];
  red_flags: string[];
  seniority_assessment: string;
  hire_likelihood: number | null;
  most_important_improvement: string;
  failed: boolean;
  error: string | null;
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

export interface DiagnosisIssue {
  title: string;
  detail: string;
  impact: number;
  bucket: "design" | "content";
}

export interface ATSDiagnosis {
  top_issues: DiagnosisIssue[];
  design_count: number;
  content_count: number;
  has_design_issues: boolean;
  has_content_issues: boolean;
  current_score: number;
  projected_score: number;
}

export interface ATSResult {
  id: number;
  user_id: number;
  overall_score: number;
  layers: ATSLayers;
  diagnosis?: ATSDiagnosis;
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

// ── Cover Letter ───────────────────────────────────────────────────────────────

export interface CoverLetterCustomization {
  accentColor: string;
  fontFamily: string;
  spacing: "compact" | "normal" | "spacious";
}

export const DEFAULT_CL_CUSTOMIZATION: CoverLetterCustomization = {
  accentColor: "#111827",
  fontFamily: "Arial",
  spacing: "normal",
};

export interface CLPersonalDetails {
  full_name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
  portfolio: string;
  nationality?: string;
  date_of_birth?: string;
  gender?: string;
  visa_status?: string;
  photo_base64?: string;
  photo_url?: string;
  marital_status?: string;
  religion?: string;
  nic?: string;
  driving_license?: string;
}

export interface CoverLetter {
  id: number;
  user_id: number;
  cv_id: number | null;
  title: string;
  template_id: string;
  content: string;
  job_title: string;
  company: string;
  job_description: string;
  tone: string;
  customization: CoverLetterCustomization;
  personal_details: Partial<CLPersonalDetails>;
  created_at: string;
  updated_at: string;
}

export interface CoverLetterListItem {
  id: number;
  title: string;
  template_id: string;
  job_title: string;
  company: string;
  created_at: string;
  updated_at: string;
}

// ── Career Tips ────────────────────────────────────────────────────────────────

export interface CareerTip {
  id: number;
  title: string;
  image_url: string;
  caption: string;
  published_at: string;
  created_at: string;
}
