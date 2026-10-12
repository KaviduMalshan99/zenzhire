// Shared helpers for the Career Mentor quick-start (/cv-builder/start and
// /cv-builder/onboarding). See PROJECT_CONTEXT.md section 38.
import api, { type CareerMentorAnswer, type CareerMentorStep } from "@/lib/api";
import type { CVCustomization, CVDocument, TemplateId } from "@/types";
import { DEFAULT_CUSTOMIZATION, TEMPLATE_DEFAULT_CUSTOMIZATION } from "@/types";

// Exactly what the template picker sends when it creates a CV (mirrored in the
// backend as cv_routes.template_picker_customization).
export function templatePickerCustomization(templateId: string): CVCustomization {
  return {
    ...DEFAULT_CUSTOMIZATION,
    ...(TEMPLATE_DEFAULT_CUSTOMIZATION[templateId] ?? {}),
    spacing: "normal",
    skillStyle: "classic",
    skillColumns: 2,
  };
}

/** "Fill it in myself": a normal builder CV with the Classic template. Returns its id. */
export async function createBuilderCv(): Promise<number> {
  const res = await api.post<CVDocument>("/cv/", {
    title: "My CV",
    template_id: "classic",
    customization: templatePickerCustomization("classic"),
  });
  return res.data.id;
}

export function apiErrorMessage(err: unknown, fallback: string): string {
  const detail = (err as { response?: { data?: { detail?: unknown } } })?.response?.data?.detail;
  return typeof detail === "string" ? detail : fallback;
}

export function firstName(fullName: string | null | undefined): string {
  return fullName?.trim().split(/\s+/)[0] ?? "";
}

export const FREE_TEMPLATES: { id: TemplateId; name: string }[] = [
  { id: "classic", name: "Classic" },
  { id: "academic", name: "Inline" },
  { id: "minimal", name: "Colorful" },
  { id: "corporate", name: "Halo" },
  { id: "nova", name: "Nova" },
];

export const ROLE_SUGGESTIONS = [
  "Software Engineer",
  "Accountant",
  "Marketing Executive",
  "Customer Service",
  "Data Analyst",
  "Teacher",
];

const SKILL_SUGGESTIONS: { match: RegExp; skills: string[] }[] = [
  { match: /software|developer|engineer|programm|web|it\b/i, skills: ["JavaScript", "Python", "SQL", "Git", "HTML & CSS", "Problem solving"] },
  { match: /account|finance|audit|bookkeep/i, skills: ["Bookkeeping", "Microsoft Excel", "QuickBooks", "Financial reporting", "Attention to detail", "Tax"] },
  { match: /market|sales|brand|social/i, skills: ["Social media", "Content writing", "SEO", "Canva", "Communication", "Market research"] },
  { match: /customer|service|support|call|reception/i, skills: ["Communication", "Problem solving", "Microsoft Office", "Patience", "Teamwork", "Data entry"] },
  { match: /data|analy/i, skills: ["SQL", "Microsoft Excel", "Power BI", "Python", "Data visualisation", "Statistics"] },
  { match: /teach|tutor|lecturer|education/i, skills: ["Lesson planning", "Classroom management", "Communication", "Microsoft Office", "Patience", "Public speaking"] },
];
const GENERAL_SKILLS = ["Communication", "Teamwork", "Microsoft Office", "Problem solving", "Time management", "Customer service"];

export function skillSuggestions(targetRole: string): string[] {
  return SKILL_SUGGESTIONS.find((s) => s.match.test(targetRole))?.skills ?? GENERAL_SKILLS;
}

// Short confirmation of the previous answer, shown above the next question.
export function getAck(step: string, answer: CareerMentorAnswer, nextStep: string): string | null {
  if (nextStep === "exp_work_followup" || nextStep === "project_work_followup") {
    return "Thanks. One more small detail will help.";
  }
  switch (step) {
    case "target_role":
      return typeof answer === "string" ? `Great, a CV for ${answer}.` : "Got it.";
    case "career_stage":
      return "Thanks, that helps me pick the right layout.";
    case "has_experience":
      return answer === "yes" ? "Great, let's add your job." : "No problem. A project works just as well.";
    case "exp_role":
    case "project_name":
      return "Got it.";
    case "exp_dates":
    case "edu_year":
      return "Noted.";
    case "exp_work":
    case "exp_work_followup":
    case "project_work":
    case "project_work_followup":
      return "Thanks, that's useful.";
    case "education":
      return "Nice.";
    case "skills":
      return Array.isArray(answer) ? `Added ${answer.length} skill${answer.length === 1 ? "" : "s"}.` : "Added.";
    case "contact":
      return "Almost done. Last question.";
    default:
      return null;
  }
}

// Progress survives a page reload (answers only live in the client's context).
// Per-tab and best-effort: storage can be unavailable, so every access is guarded.
const STORAGE_KEY = "zh_quickstart";

export type SavedQuickStart =
  | { phase: "question"; step: CareerMentorStep }
  | { phase: "finish"; cvId: number; context: CareerMentorStep["context"]; hasExperience: boolean }
  | { phase: "ready"; cvId: number };

export function loadQuickStart(): SavedQuickStart | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SavedQuickStart) : null;
  } catch {
    return null;
  }
}

export function saveQuickStart(state: SavedQuickStart): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

export function clearQuickStart(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}
