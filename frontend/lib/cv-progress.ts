import type { CVSection, SectionType } from "@/types";
import { isEmptySkillsHtml } from "@/components/cv-builder/templates/SkillsParagraph";

/** One thing a CV needs before it's worth sending. Drives the mobile builder's
 *  "{n} of 6 done" chip and its "Next: add your ..." card, so both always agree. */
export interface ProgressStep {
  key: "job_title" | "phone" | "summary" | "experience" | "education" | "skills";
  /** Finishes the sentence "Next: add your ..." */
  label: string;
  help: string;
  /** The form the card's button opens. */
  sectionType: SectionType;
  done: boolean;
}

const text = (v: unknown) => (typeof v === "string" ? v.replace(/<[^>]+>/g, "").trim() : "");

const hasEntry = (section: CVSection | undefined, ...keys: string[]) =>
  (section?.data?.entries ?? []).some((e: any) => keys.some((k) => text(e?.[k])));

/** "Has real content" per step. Name and email are prefilled on every new CV,
 *  so they never count: personal details are only done with a job title and a
 *  phone number the user added. */
export function cvProgress(sections: CVSection[]): ProgressStep[] {
  const find = (type: SectionType) => sections.find((s) => s.section_type === type);
  const personal = find("personal_details")?.data ?? {};
  const skills = find("skills")?.data ?? {};
  const hasExperience = hasEntry(find("experience"), "job_title", "employer");
  const hasProject = hasEntry(find("projects"), "title");
  // A student with no job fills Projects instead, so the card points there when
  // the CV has a Projects section but no Experience section.
  const workSection: SectionType = !find("experience") && find("projects") ? "projects" : "experience";

  return [
    {
      key: "job_title", label: "job title", sectionType: "personal_details",
      help: "The job you want, for example \"Cashier\" or \"Accounts Assistant\".",
      done: !!text(personal.title),
    },
    {
      key: "phone", label: "phone number", sectionType: "personal_details",
      help: "So employers can call you about an interview.",
      done: !!text(personal.phone),
    },
    {
      key: "summary", label: "summary", sectionType: "profile_summary",
      help: "Two or three lines about who you are and what you can do.",
      done: !!text(find("profile_summary")?.data?.summary),
    },
    {
      key: "experience", label: workSection === "projects" ? "projects" : "experience", sectionType: workSection,
      help: "A job, internship or part-time work. No work yet? Add a project instead.",
      done: hasExperience || hasProject,
    },
    {
      key: "education", label: "education", sectionType: "education",
      help: "Your school, college or university, and what you studied.",
      done: hasEntry(find("education"), "degree", "institution"),
    },
    {
      key: "skills", label: "skills", sectionType: "skills",
      help: "A few things you are good at, for example Excel or customer service.",
      done: (skills.entries ?? []).some((e: any) => text(e?.skill_name)) || !isEmptySkillsHtml(skills.skills_paragraph),
    },
  ];
}
