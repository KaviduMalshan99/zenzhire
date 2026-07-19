import type { CVSection } from "@/types";
import { SAMPLE_CV_DATA } from "./sample-cv-data";

// Extra gallery-preview-only content for the two-column "sidebar" templates
// (Modern, Corporate, Portrait, Milestone, Vega, Aurora), whose sidebar column
// renders skills/languages/certificates/interests/education separately from
// the main column. Those templates end up looking sparser than the
// single-column templates at the same SAMPLE_CV_DATA volume, because a
// second column needs more total content to look "full" than one column does.
//
// This supplement is merged into `sections` only for those template IDs (see
// cv-template-preview/[templateId]/page.tsx) — SAMPLE_CV_DATA itself is never
// touched, so the other 8 templates are provably unaffected.
export const SIDEBAR_LAYOUT_TEMPLATE_IDS = new Set([
  "modern",
  "corporate",
  "portrait",
  "milestone",
  "vega",
  "aurora",
]);

const EXTRA_SKILLS = [
  { id: "s11", skill_name: "System Design", level: "Advanced" },
  { id: "s12", skill_name: "gRPC", level: "Intermediate" },
];

const EXTRA_LANGUAGE = { id: "l3", language: "Spanish", level: "Conversational" };

const EXTRA_CERTIFICATE = {
  id: "c3",
  certificate_name: "Professional Scrum Master I",
  issuer: "Scrum.org",
  date: "2021",
  no_expiry: true,
};

const EXTRA_PROJECT = {
  id: "p2",
  title: "Realtime Analytics Dashboard",
  subtitle: "Internal Tool",
  start_date: "2021",
  end_date: "2022",
  description:
    "<p>Designed a self-serve analytics dashboard used by 15+ teams, cutting ad-hoc reporting requests by 70%.</p>",
  link: "",
  tech: ["TypeScript", "React", "GraphQL"],
};

const INTERESTS_SECTION: CVSection = {
  id: 100,
  cv_id: 0,
  section_type: "interests",
  display_order: 100,
  is_visible: true,
  created_at: "",
  updated_at: null,
  data: {
    entries: [
      { title: "Photography" },
      { title: "Rock Climbing" },
      { title: "Open Source Contributions" },
      { title: "Chess" },
    ],
  },
};

const AWARDS_SECTION: CVSection = {
  id: 101,
  cv_id: 0,
  section_type: "awards",
  display_order: 101,
  is_visible: true,
  created_at: "",
  updated_at: null,
  data: {
    entries: [
      { id: "a1", award_name: "Engineering Excellence Award", issuer: "TechCorp Inc", date: "2023" },
      { id: "a2", award_name: "Hackathon Winner — Best Technical Innovation", issuer: "DataSystems Ltd", date: "2020" },
    ],
  },
};

// Vega already sat closest to a full page (84.7%) of the 6, so it gets a
// lighter cut of the main-column additions (awards, no extra project) — the
// full bundle pushed it to 102% (a second-page overflow), while the other 5
// had more headroom to spare.
const SKIP_EXTRA_PROJECT_TEMPLATE_IDS = new Set(["vega"]);

export function getSidebarLayoutPreviewSections(templateId: string): CVSection[] {
  const skipProject = SKIP_EXTRA_PROJECT_TEMPLATE_IDS.has(templateId);

  const withExtendedEntries = SAMPLE_CV_DATA.map((section) => {
    if (section.section_type === "skills") {
      return { ...section, data: { ...section.data, entries: [...section.data.entries, ...EXTRA_SKILLS] } };
    }
    if (section.section_type === "languages") {
      return { ...section, data: { ...section.data, entries: [...section.data.entries, EXTRA_LANGUAGE] } };
    }
    if (section.section_type === "certificates") {
      return { ...section, data: { ...section.data, entries: [...section.data.entries, EXTRA_CERTIFICATE] } };
    }
    if (section.section_type === "projects" && !skipProject) {
      return { ...section, data: { ...section.data, entries: [...section.data.entries, EXTRA_PROJECT] } };
    }
    return section;
  });

  return [...withExtendedEntries, INTERESTS_SECTION, AWARDS_SECTION];
}
