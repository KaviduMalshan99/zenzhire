import type { CVSection } from "@/types";

// Reusable Classic-template pagination test fixtures (short/1-page,
// medium/mid-section-split, long/multi-page) — engine-agnostic, for testing
// whichever pagination approach is used. Not wired into /cv-builder,
// /cv-print, or any real user CV data path — kept separate from
// lib/sample-cv-data.ts so it can't leak into the gallery or a real CV.

let nextId = 1;
function section(section_type: string, data: Record<string, any>): CVSection {
  return {
    id: nextId++,
    cv_id: 0,
    section_type,
    display_order: nextId,
    is_visible: true,
    created_at: "",
    updated_at: null,
    data,
  };
}

function personalDetails(overrides: Record<string, any> = {}): CVSection {
  return section("personal_details", {
    full_name: "Jordan Ellis",
    title: "Senior Backend Engineer",
    email: "jordan.ellis@email.com",
    phone: "+1 555 987 6543",
    location: "Austin, TX",
    nationality: "American",
    gender: "",
    visa_status: "",
    photo_url: "",
    links: [
      { id: "1", platform: "LinkedIn", url: "linkedin.com/in/jordanellis" },
      { id: "2", platform: "GitHub", url: "github.com/jordanellis" },
    ],
    ...overrides,
  });
}

function experienceEntry(i: number) {
  return {
    id: `e${i}`,
    job_title: [
      "Senior Backend Engineer",
      "Backend Engineer",
      "Software Engineer",
      "Platform Engineer",
      "Software Engineer II",
      "Junior Software Engineer",
      "Software Engineering Intern",
    ][i % 7],
    employer: [
      "Northbridge Systems",
      "Vantage Cloud",
      "Meridian Data",
      "Lockstep Analytics",
      "Farview Technologies",
      "Riverton Labs",
      "Ashfield Software",
    ][i % 7],
    employer_link: "",
    location: "Austin, TX",
    start_date: `${2024 - i}`,
    end_date: i === 0 ? "" : `${2025 - i}`,
    current: i === 0,
    description: "",
    bullets: [
      { text: "Designed and shipped a service handling several million requests per day with sub-100ms p99 latency" },
      { text: "Led migration of a monolithic billing pipeline into independently deployable services" },
      { text: "Introduced contract testing across five teams, cutting integration regressions by a third" },
      { text: "Mentored two engineers through their first on-call rotations and promotion cycles" },
    ],
  };
}

function educationEntry(i: number) {
  return {
    id: `ed${i}`,
    degree: i === 0 ? "BSc Computer Science" : "Associate Degree, Information Systems",
    institution: i === 0 ? "University of Texas at Austin" : "Austin Community College",
    institution_link: "",
    location: "Austin, TX",
    start_date: i === 0 ? "2016" : "2014",
    end_date: i === 0 ? "2020" : "2016",
    score_type: "GPA",
    score_value: "3.7 / 4.0",
    description: "",
  };
}

function skillEntry(name: string, level = "Intermediate") {
  return { id: name, skill_name: name, level };
}

function projectEntry(i: number) {
  return {
    id: `p${i}`,
    title: [
      "Distributed Rate Limiter",
      "Internal Deploy Dashboard",
      "Event Replay Toolkit",
    ][i % 3],
    subtitle: "Personal / Open Source",
    start_date: `${2023 - i}`,
    end_date: i === 0 ? "Present" : `${2024 - i}`,
    description:
      "<p>Built a token-bucket rate limiter used across internal services, with configurable per-tenant limits and Redis-backed counters.</p>",
    link: "github.com/jordanellis/project",
    tech: ["Go", "Redis", "PostgreSQL"],
  };
}

// ── Short: everything comfortably fits on one page ─────────────────────────
export const SHORT_CV_SECTIONS: CVSection[] = [
  personalDetails(),
  section("profile_summary", {
    summary:
      "<p>Backend engineer with 4 years of experience building reliable, high-throughput services. Focused on clean interfaces and observable systems.</p>",
  }),
  section("experience", { entries: [experienceEntry(0)] }),
  section("education", { entries: [educationEntry(0)] }),
  section("skills", {
    entries: [
      skillEntry("Go", "Advanced"),
      skillEntry("PostgreSQL", "Advanced"),
      skillEntry("Redis"),
      skillEntry("Docker"),
      skillEntry("Kubernetes"),
      skillEntry("gRPC"),
    ],
  }),
];

// ── Medium: Experience legitimately spans two pages mid-section; Projects
// sits right at the page-1/page-2 boundary (the class of bug the real-world
// "Projects pushed to page 2" case exercises) ───────────────────────────────
export const MEDIUM_CV_SECTIONS: CVSection[] = [
  personalDetails(),
  section("profile_summary", {
    summary:
      "<p>Backend engineer with 7 years of experience across fintech and infrastructure teams. Specializes in distributed systems, service migrations, and mentoring engineers through their first on-call rotations. Comfortable owning a service from design doc through production incident response.</p>",
  }),
  section("experience", {
    entries: [experienceEntry(0), experienceEntry(1), experienceEntry(2), experienceEntry(3)],
  }),
  section("education", { entries: [educationEntry(0)] }),
  section("skills", {
    entries: [
      skillEntry("Go", "Advanced"),
      skillEntry("Python", "Advanced"),
      skillEntry("PostgreSQL", "Advanced"),
      skillEntry("Redis"),
      skillEntry("Docker"),
      skillEntry("Kubernetes"),
      skillEntry("gRPC"),
      skillEntry("Kafka"),
    ],
  }),
  section("languages", {
    entries: [
      { id: "l1", language: "English", level: "Native" },
      { id: "l2", language: "Spanish", level: "Conversational" },
    ],
  }),
  section("projects", {
    entries: [projectEntry(0), projectEntry(1)],
  }),
];

// ── Long: spans roughly 3 pages ─────────────────────────────────────────────
export const LONG_CV_SECTIONS: CVSection[] = [
  personalDetails(),
  section("profile_summary", {
    summary:
      "<p>Backend engineer with 10 years of experience spanning fintech, logistics, and developer-tooling companies. Track record of leading multi-quarter platform migrations, building the observability stack teams rely on during incidents, and growing engineers into senior roles. Comfortable operating at both the system-design level and in the on-call rotation.</p>",
  }),
  section("experience", {
    entries: [
      experienceEntry(0),
      experienceEntry(1),
      experienceEntry(2),
      experienceEntry(3),
      experienceEntry(4),
      experienceEntry(5),
      experienceEntry(6),
    ],
  }),
  section("education", { entries: [educationEntry(0), educationEntry(1)] }),
  section("skills", {
    entries: [
      skillEntry("Go", "Advanced"),
      skillEntry("Python", "Advanced"),
      skillEntry("TypeScript", "Advanced"),
      skillEntry("PostgreSQL", "Advanced"),
      skillEntry("Redis"),
      skillEntry("Docker"),
      skillEntry("Kubernetes"),
      skillEntry("gRPC"),
      skillEntry("Kafka"),
      skillEntry("Terraform"),
    ],
  }),
  section("languages", {
    entries: [
      { id: "l1", language: "English", level: "Native" },
      { id: "l2", language: "Spanish", level: "Conversational" },
      { id: "l3", language: "French", level: "Basic" },
    ],
  }),
  section("projects", {
    entries: [projectEntry(0), projectEntry(1), projectEntry(2)],
  }),
  section("certificates", {
    entries: [
      { id: "c1", certificate_name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services", date: "2023", no_expiry: false, link: "" },
      { id: "c2", certificate_name: "Certified Kubernetes Administrator", issuer: "CNCF", date: "2022", no_expiry: false, link: "" },
      { id: "c3", certificate_name: "Google Cloud Professional Data Engineer", issuer: "Google", date: "2021", no_expiry: true, link: "" },
    ],
  }),
  section("awards", {
    entries: [
      { id: "a1", award_name: "Engineering Excellence Award", issuer: "Vantage Cloud", date: "2022", description: "<p>Recognized for leading the billing-pipeline migration with zero downtime.</p>" },
      { id: "a2", award_name: "Hackathon Winner", issuer: "Meridian Data", date: "2019", description: "" },
    ],
  }),
  section("courses", {
    entries: [
      { id: "co1", title: "Distributed Systems Specialization", institution: "Coursera", start_date: "2020", end_date: "2020", description: "", link: "" },
      { id: "co2", title: "Advanced PostgreSQL Performance", institution: "Percona", start_date: "2021", end_date: "2021", description: "", link: "" },
    ],
  }),
  section("publications", {
    entries: [
      { id: "pu1", title: "Rate Limiting at Scale", publisher: "Internal Engineering Blog", date: "2023", description: "<p>Overview of the token-bucket rate limiter design used across services.</p>" },
    ],
  }),
  section("organizations", {
    entries: [
      { id: "o1", name: "Austin Systems Meetup", position: "Organizer", start_date: "2020", end_date: "", current_flag: true, description: "<p>Organize a monthly meetup for backend and infrastructure engineers.</p>" },
    ],
  }),
  section("references", {
    entries: [
      { id: "r1", name: "Alex Rivera", job_title: "Engineering Manager", organization: "Vantage Cloud", email: "alex.rivera@email.com", phone: "+1 555 111 2222", show_on_cv: true },
      { id: "r2", name: "Priya Nair", job_title: "Staff Engineer", organization: "Meridian Data", email: "priya.nair@email.com", phone: "+1 555 333 4444", show_on_cv: true },
    ],
  }),
];

export const PAGINATION_TEST_VARIANTS = {
  short: { label: "Short (expect 1 page)", sections: SHORT_CV_SECTIONS },
  medium: { label: "Medium (expect Experience to split mid-section)", sections: MEDIUM_CV_SECTIONS },
  long: { label: "Long (expect ~3 pages)", sections: LONG_CV_SECTIONS },
} as const;

export type PaginationTestVariant = keyof typeof PAGINATION_TEST_VARIANTS;
