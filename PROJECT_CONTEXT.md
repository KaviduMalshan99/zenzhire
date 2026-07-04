# ZenzHire — Project Context for Claude Sessions

> Last updated: 2026-07-03 (session 4 — full template-registration audit). Working directory: `F:\zenzhire\zenzhire\`

**Audit note (session 4):** Re-verified the CV template count against the actual codebase (there was a belief it had grown to ~16). It has **not** — it is still exactly **12**, and all 12 are fully and consistently registered across every required file (frontend `types/index.ts` ×2, `LeftPanel.tsx`, `CentrePanel.tsx`, `cv-print/[cvId]/page.tsx`, `cv-template-preview/[templateId]/page.tsx`, `(dashboard)/templates/page.tsx`, backend `TemplateId` enum, and a matching Alembic migration for each of the 4 newest ones). No orphaned/half-registered templates found. One real drift was found and fixed below: a `skillStyle: "chips"` option was added to the customization system (now the default) but was never documented.

---

## 1. What is ZenzHire?

ZenzHire is an **AI-powered career and talent intelligence platform**. The primary user is a job seeker who wants to:

- Build a professional CV using a template-based builder
- Create AI-powered cover letters matching their CV style
- Optimize the CV to pass Applicant Tracking Systems (ATS) with an **honest, trustworthy** scoring system
- Get AI-generated feedback and improvement suggestions via Claude API

**Phase 1 (built):** Full CV builder (12 templates), Cover Letter Builder (8 templates), ATS Checker (7-layer analysis, rebuilt for accuracy), AI Assistant (20+ actions), CV Score, Quick Fixes, Template Gallery, Dashboard, ATS Diagnosis & "CV Rebuild Preview" feature.

**Phase 2 (next):** Stripe payments, Landing page, Admin panel, Production deployment.

### Core product philosophy (important — established during ATS rebuild session)
ZenzHire's scoring features must be **honest, not flattering**. No score, projection, or suggestion should imply a guarantee of interview/hiring outcomes. Every score-producing feature should:
- Use real computation, not hardcoded/fabricated numbers
- Fail loudly/visibly rather than silently degrading (e.g. never show "0 issues found" when a checker actually failed to run)
- Show clear disclaimers near scores: *"This reflects how well your CV is structured and written. It does not guarantee interview or hiring outcomes."*

This principle should be applied to any future scoring/AI-judgment feature, not just ATS.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| Backend | FastAPI (Python), PostgreSQL, SQLAlchemy, Alembic |
| AI | Anthropic Claude API — model `claude-sonnet-4-6` |
| Auth | JWT tokens via `python-jose` (HS256), stored as cookies (`js-cookie`) |
| PDF Export | `puppeteer-core` + local Chrome (dev) / `@sparticuz/chromium` (prod) |
| Rich Text | Tiptap (`@tiptap/react`, starter-kit + extensions) |
| Drag & Drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| PDF parsing (ATS) | PyMuPDF (`fitz`) — structural analysis (tables/images/columns/fonts) |
| Fonts | Google Fonts (Roboto, Playfair Display, Lato, Dancing Script) |

**Ports:** Frontend on `localhost:3000`, Backend on `localhost:8000`.

**Design system:** Dark navy — `#0d1117` bg, `#161b22` surface, `#30363d` borders, `#2563eb` primary blue.

**Database:** Local PostgreSQL on port `5432` (Windows service `postgresql-x64-18`).
⚠️ If Docker Desktop is used for other projects on the same machine, it can occupy port 5432/5433 and conflict. If `uvicorn` throws a `psycopg2.OperationalError: connection refused`, the fix is almost always:
```
net start postgresql-x64-18
```
(may need Administrator terminal). Verify with `Get-Service -Name "postgresql-x64-18"`.

**Startup commands:**
```bash
# Backend
cd F:\zenzhire\zenzhire\backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000

# Frontend
cd F:\zenzhire\zenzhire\frontend
npm run dev
```

---

## 3. Project Structure

```
F:\zenzhire\zenzhire\
├── frontend/
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx              # Dashboard shell with navbar
│   │   │   ├── page.tsx                # Dashboard overview
│   │   │   ├── cv-builder/
│   │   │   │   └── page.tsx            # CV list page (Resume.io style cards)
│   │   │   ├── templates/
│   │   │   │   └── page.tsx            # Template gallery with filters + Free/Pro
│   │   │   ├── cover-letter/
│   │   │   │   ├── page.tsx            # Cover letter list page
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx        # Cover letter editor (3-panel)
│   │   │   │       └── CoverLetterPreview.tsx  # 8 CL template previews
│   │   │   └── ats-checker/
│   │   │       └── page.tsx            # ATS checker — wide results layout w/ sidebar
│   │   ├── api/
│   │   │   ├── generate-pdf/
│   │   │   │   └── route.ts            # Puppeteer PDF for CV
│   │   │   └── generate-cl-pdf/
│   │   │       └── route.ts            # Puppeteer PDF for Cover Letter
│   │   ├── cv-print/
│   │   │   ├── layout.tsx              # White background override for Puppeteer
│   │   │   └── [cvId]/
│   │   │       └── page.tsx            # Page loaded by Puppeteer for CV PDF
│   │   ├── cv-template-preview/
│   │   │   └── [templateId]/
│   │   │       └── page.tsx            # Template preview for gallery iframe
│   │   └── auth/                       # Login/signup pages
│   ├── components/
│   │   ├── cv-builder/
│   │   │   ├── LeftPanel.tsx           # Template selector, section manager, DnD
│   │   │   ├── CentrePanel.tsx         # A4 preview, zoom, PDF export trigger
│   │   │   ├── RightPanel.tsx          # AI assistant, CV Score, Quick Fixes
│   │   │   ├── AddSectionModal.tsx
│   │   │   ├── CustomizationPanel.tsx  # Style options panel
│   │   │   ├── SectionHeading.tsx      # 9 heading style variants
│   │   │   ├── SectionForms.tsx        # All 15 section editors incl photo crop
│   │   │   └── templates/
│   │   │       ├── SkillEntry.tsx      # Shared skill display component
│   │   │       ├── HtmlContent.tsx     # Renders Tiptap HTML safely
│   │   │       ├── ClassicTemplate.tsx
│   │   │       ├── ModernTemplate.tsx
│   │   │       ├── MinimalTemplate.tsx   # "Colorful" in UI
│   │   │       ├── ExecutiveTemplate.tsx
│   │   │       ├── TechTemplate.tsx      # "Bordered" in UI
│   │   │       ├── CreativeTemplate.tsx  # "Timeline" in UI
│   │   │       ├── AcademicTemplate.tsx  # "Inline" in UI
│   │   │       ├── GCCTemplate.tsx
│   │   │       ├── PortraitTemplate.tsx  # "Portrait" in UI, photo-header + 2-col body
│   │   │       ├── MilestoneTemplate.tsx # "Milestone" in UI, timeline-marker experience + 2-col body
│   │   │       ├── CorporateTemplate.tsx # "Halo" in UI, dot-accent header + mirrored 2-col body (FREE)
│   │   │       └── VegaTemplate.tsx      # "Vega" in UI, colored header band + ■ square-marker headings + 2-col body (PRO)
│   │   └── ats-checker/
│   │       ├── ScoreGauge.tsx
│   │       ├── LayerCard.tsx
│   │       ├── KeywordHeatmap.tsx
│   │       ├── RecruiterCard.tsx
│   │       ├── GrammarIssues.tsx
│   │       ├── ResultsSidebar.tsx      # NEW — sticky sidebar (mini gauge, jump links, actions)
│   │       └── CVRebuildPreview.tsx    # NEW — "Your CV, Rebuilt with ZenzHire" card
│   ├── lib/
│   │   ├── api.ts                      # Axios instance + all API calls
│   │   ├── sample-cv-data.ts           # Sample CV data for template previews
│   │   └── ats-preview-data.ts         # NEW — clones sample data, injects real detected name/email/phone/linkedin
│   └── types/
│       └── index.ts                    # All TypeScript types and interfaces
│
└── backend/
    ├── app/
    │   ├── api/routes/
    │   │   ├── auth.py                 # POST /auth/login, /auth/signup, /auth/me
    │   │   ├── cv.py                   # Full CV CRUD + AI improve endpoint
    │   │   ├── cover_letter.py         # Cover Letter CRUD + AI generate
    │   │   └── ats.py                  # POST /ats/analyze, GET /ats/history
    │   ├── models/
    │   │   ├── user.py
    │   │   ├── cv_document.py          # cv_documents + cv_sections tables
    │   │   ├── cover_letter.py         # cover_letters table
    │   │   └── ats_result.py           # ats_results table (now incl. diagnosis JSON column)
    │   ├── services/
    │   │   ├── ai_service.py           # Claude API — CV improve + cover letter
    │   │   ├── ats_service.py          # 7-layer ATS analysis — REBUILT (see section 18)
    │   │   └── pdf_service.py          # PDF text extraction
    │   └── schemas/
    │       ├── cv.py                   # CV Pydantic schemas
    │       ├── cover_letter.py         # Cover Letter schemas
    │       └── ats.py                  # ATS schemas (now incl. diagnosis, detected_* fields)
    └── alembic/versions/               # DB migrations
```

---

## 4. Database Schema

```sql
-- Users
users (id, email, full_name, hashed_password, is_active, plan, created_at)
-- plan: "free" | "pro"

-- CV Documents
cv_documents (
  id, user_id, title, template_id, is_primary,
  customization JSONB, created_at, updated_at
)

-- CV Sections
cv_sections (
  id, cv_id, section_type, display_order,
  is_visible, data JSONB, created_at, updated_at
)

-- Cover Letters
cover_letters (
  id, user_id, cv_id, title, template_id,
  content TEXT, job_title, company,
  job_description TEXT, tone,
  customization JSONB, created_at, updated_at
)

-- ATS Results
ats_results (
  id, user_id, cv_filename, job_description,
  target_role, target_industry, overall_score,
  layers JSON,
  diagnosis JSON,        -- NEW: top 5 issues, current/projected score
  has_job_description,
  created_at
)
```

---

## 5. CV Customization System

```typescript
interface CVCustomization {
  accentColor: string;      // hex, default "#111827"
  fontFamily: string;       // "Arial"|"Georgia"|"Roboto"|"Playfair Display"|"Lato"
  spacing: "compact"|"normal"|"spacious";
  headerStyle: "left"|"centered"|"twocolumn";
  headingStyle: "fullline"|"underline"|"boxed"|"plain"|"doubleline"|"leftbar"|"dotted"|"accentbadge"|"centerlines";
  skillStyle?: "classic"|"progressbar"|"dotrating"|"percentage"|"starrating"|"nameonly"|"chips";  // NEW: "chips" (2026-07-03), now optional
  skillColumns?: 1|2|3;     // now optional (was required)
}

export const DEFAULT_CUSTOMIZATION: CVCustomization = {
  accentColor: "#111827",
  fontFamily: "Arial",
  spacing: "normal",
  headerStyle: "centered",
  headingStyle: "fullline",
  skillStyle: "chips",      // CHANGED: default was "classic", now "chips"
  skillColumns: 2,
};

export const TEMPLATE_DEFAULT_CUSTOMIZATION: Record<string, Partial<CVCustomization>> = {
  classic:   { accentColor: "#111827", fontFamily: "Arial",    headerStyle: "centered",   headingStyle: "fullline",  skillStyle: "chips" },
  modern:    { accentColor: "#2563eb", fontFamily: "Roboto",   headerStyle: "left",       headingStyle: "underline" },
  minimal:   { accentColor: "#e11d48", fontFamily: "Lato",     headerStyle: "centered",   headingStyle: "fullline",  skillStyle: "chips" },
  executive: { accentColor: "#111827", fontFamily: "Georgia",  headerStyle: "twocolumn",  headingStyle: "fullline",  skillStyle: "chips" },
  tech:      { accentColor: "#2563eb", fontFamily: "Arial",    headerStyle: "left",       headingStyle: "fullline",  skillStyle: "chips" },
  creative:  { accentColor: "#7c3aed", fontFamily: "Lato",     headerStyle: "left",       headingStyle: "underline", skillStyle: "chips" },
  academic:  { accentColor: "#2563eb", fontFamily: "Georgia",  headerStyle: "centered",   headingStyle: "fullline",  skillStyle: "chips" },
  gcc:       { accentColor: "#2563eb", fontFamily: "Arial",    headerStyle: "left",       headingStyle: "fullline",  skillStyle: "chips" },
  portrait:  { accentColor: "#8a6fae", fontFamily: "Lato",     headerStyle: "left",       headingStyle: "fullline",  skillStyle: "classic" },
  milestone:  { accentColor: "#111827", fontFamily: "Roboto",   headerStyle: "left",       headingStyle: "fullline",  skillStyle: "nameonly" },
  corporate:  { accentColor: "#111827", fontFamily: "Arial",    headerStyle: "left",       headingStyle: "plain",     skillStyle: "nameonly" },
  vega:       { accentColor: "#2c3e50", fontFamily: "Arial",    headerStyle: "left",       headingStyle: "plain",     skillStyle: "nameonly" },
};
```

⚠️ `TEMPLATE_DEFAULT_CUSTOMIZATION` now sets `skillStyle` explicitly for every template except `modern` (previously none of classic/minimal/executive/tech/creative/academic/gcc had a `skillStyle` override, and all silently inherited whatever `DEFAULT_CUSTOMIZATION.skillStyle` was). Now that the global default changed to `"chips"`, those seven were given an explicit `skillStyle: "chips"` entry so their look doesn't silently shift if the global default changes again — `modern` is the one remaining template still relying on the global default falling through.

---

## 6. The 12 CV Templates

| template_id | Component | UI Name | Free/Pro | Category |
|---|---|---|---|---|
| `classic` | ClassicTemplate.tsx | Classic | **FREE** | Simple |
| `academic` | AcademicTemplate.tsx | Inline | **FREE** | Simple |
| `minimal` | MinimalTemplate.tsx | Colorful | **FREE** | Creative |
| `corporate` | CorporateTemplate.tsx | Halo | **FREE** | Professional |
| `modern` | ModernTemplate.tsx | Modern | PRO | Modern |
| `tech` | TechTemplate.tsx | Bordered | PRO | Modern |
| `creative` | CreativeTemplate.tsx | Timeline | PRO | Creative |
| `executive` | ExecutiveTemplate.tsx | Executive | PRO | Professional |
| `gcc` | GCCTemplate.tsx | GCC | PRO | Professional |
| `portrait` | PortraitTemplate.tsx | Portrait | PRO | Professional |
| `milestone` | MilestoneTemplate.tsx | Milestone | PRO | Professional |
| `vega` | VegaTemplate.tsx | Vega | PRO | Professional |

⚠️ Note: `creative` is already named "Timeline" in the UI (left accent line + date-column layout) — `milestone` is a *different* design (circular timeline markers/connector line specifically on the Experience section). Don't confuse the two when picking a name for a future template.

### Template Features:

**Classic** — Clean traditional, SVG icons in contact row, supports all headerStyles, centered default

**Modern** — Two-column sidebar layout, sidebar has skills/languages/interests, main has everything else, fixed sidebar with `position:fixed` overlay in PDF for full-height color

**Colorful (Minimal)** — Bold full-width color banner header, photo in header, full-bleed in PDF (margin:0 top/left/right)

**Executive** — Formal serif, two-column header default, centered elegant layout

**Bordered (Tech)** — Border frame around entire page, drawn by `position:fixed` overlay in cv-print + `position:absolute` in CentrePanel. Puppeteer margin: `{top:"0",right:"0",bottom:"0",left:"0"}`. Section icons (◈✦◉etc)

**Timeline (Creative)** — Left accent line `8px`, `position:fixed` in PDF, `borderLeft` on outer div for preview continuity via CentrePanel isCreative flag

**Inline (Academic)** — Icon contacts row, photo right, clean divider header

**GCC** — Header background uses `accentColor`, photo on RIGHT (no border), pill badges for nationality/DOB/gender/visa/marital/religion/NIC/license, separate light `#f0f4f8` contact row below header (no accent bar)

**Portrait** — Square-framed photo top-left with a thin `accentColor` border, name to the right with the last word in `accentColor` (rest in near-black — derived by splitting `full_name` at the last space, not a separate stored field), full-width divider below the header, then a 2-column body: left column (~34% width, right-bordered) holds Contact/Education/Skills/Soft Skills/Certificates/Languages/Interests, right column holds Summary/Experience/Projects/Courses/Awards/Organizations/Publications/References/Declaration. Section placement into sidebar-vs-main is a hardcoded `SIDEBAR_TYPES` set in the component (same pattern as ModernTemplate), not user-configurable.

**Milestone** — NEW (2026-07-03). No photo. Plain bold uppercase name + title header, full-width divider, then a full-width Career Summary, then a 2-column body (Contact/Education/Skills/Soft Skills/Certificates/Languages/Interests on the left ~34%; Experience/Projects/Courses/Awards/Organizations/Publications/Declaration on the right), then a full-width References grid at the very bottom (outside the 2-column area, always spans both columns). Experience entries render as a vertical timeline — each entry is a flex row with a small circle marker in a fixed-width left column and the connecting line between markers drawn as `position:absolute; top:20px; bottom:-entryGap` inside that column. The line's height comes from CSS flexbox `align-items:stretch` (default) making the marker column match the row's real content height — no JS measurement needed, and it survives PDF pagination the same way every other `.cv-entry` does (`page-break-inside:avoid`). Same hardcoded `SIDEBAR_TYPES` pattern as Portrait/Modern.

**Halo (Corporate)** — NEW (2026-07-03). No photo (photo_shape/photo_size ignored). Left-aligned header: large bold name, muted job title below, then a contact row (SVG icons + phone/email/links inline), with a decorative scattered dot grid SVG in the top-right corner of the header. Thin full-width divider below header. 2-column body **MIRRORED** vs Portrait/Milestone — LEFT column (~65%) is main content (Summary, Work Experience, Projects, etc.); RIGHT column (~35%, `borderLeft` separator) is sidebar (Education, Skills, Languages, etc.). This is the opposite of Portrait/Milestone's sidebar-on-left layout. Section headings use a custom `CH` function local to CorporateTemplate.tsx (does NOT use SectionHeading.tsx — same exception pattern as TechTemplate), rendering `⊙ SECTION NAME` with accent-colored glyph, uppercase, letter-spaced. Skills and Languages in the sidebar always render as plain bullet lists (skill name only) regardless of the `skillStyle` customization — this is intentional and noted in a comment in the component. References render full-width at the bottom outside the 2-column area, as a 2-column card grid (same as Milestone). Alembic migration: `006_add_corporate_template_id.py`.

**Vega** — NEW (2026-07-03). PRO. No photo. **Full-width accent-colored header band**: large bold uppercase name in white, job title below in `rgba(255,255,255,0.7)` letter-spaced, contact items stacked on the right with white SVG icons — all rendered on `backgroundColor: accentColor`. No separate divider line; the colored header provides natural visual separation. 2-column body same orientation as Halo — LEFT (~62%, main content: Summary, Work Experience, Projects, etc.), RIGHT (~38%, `borderLeft: 1.5px solid #e5e7eb` sidebar: Education, Skills, Languages, etc.). Section headings use a custom `SH` function local to VegaTemplate.tsx (does NOT use SectionHeading.tsx), rendering `■ SECTION NAME` with `2px solid accentColor` bottom border spanning the full heading width — the ■ square glyph is the defining visual motif. Work Experience entries also use `■` before the date range (consistent visual rhythm with headings), followed by employer | location, then bold job title, then bullets/description. Education in sidebar: year range in gray, institution in bold uppercase, degree as `● degree` with accent bullet, GPA below. Skills and Languages always render as plain `●` bullet lists (ignores `skillStyle`) — same rationale as Halo. References render full-width at the bottom outside the 2-column area, as a 2-column card grid. Alembic migration: `007_add_vega_template_id.py`.

### Photo Options (all templates):
- Shape: circle / rounded / square / hexagon (stored as `photo_shape` in personal_details data)
- Size: 50-150px slider (stored as `photo_size`)
- Crop editor: pan + zoom modal in SectionForms.tsx

### Skills Display (SkillEntry.tsx):
- classic: `Python (Advanced)`
- progressbar: name + fill bar
- dotrating: name + colored dots (right side)
- percentage: name + % bar
- starrating: name + stars (right side)
- nameonly: just the name
- chips: **NEW** (2026-07-03) — rounded accent-colored pill/badge, bold name + `· Level` suffix in accent color when a level is set; this is now `DEFAULT_CUSTOMIZATION.skillStyle` (was `classic`)
- If level is empty → shows name only regardless of style

### ⚠️ Important rendering gotcha (discovered during ATS rebuild)
When cloning `SAMPLE_CV_DATA` (e.g. via `JSON.parse(JSON.stringify(...))`) for re-use in a NEW preview context (different from the original template gallery usage), **always reassign fresh unique `id` values** to each section after cloning:
```typescript
cloned.forEach((section: any, i: number) => { section.id = i + 1; });
```
Without this, templates can mis-render headers (e.g. show a section title like "TECHNICAL SKILLS" instead of the person's name) due to id collisions/lookup issues. Always verify the `personal_details` section is found by `section_type`, not array position, when debugging this class of bug.

### ⚠️ `/cv-template-preview/[templateId]` requires `"use client"` (fixed 2026-07-03)
This page renders CV template components directly with no data-fetching gate (`SAMPLE_CV_DATA` is imported statically, so the templates render synchronously on first paint — unlike `cv-builder` and `cv-print`, which gate template rendering behind a client-fetched `useState`/`useEffect` and so never actually render the templates during Next's server-render pass). This exposed two latent bugs when the page was accidentally a Server Component:
1. **`useCVEdit is not a function`** — every template calls `useCVEdit()` (a `useContext` hook, defined in `templates/edit/CVEditContext.tsx`). Hooks can't cross the RSC/client boundary as plain function exports — only components can. Fix: the page itself must have `"use client"` at the top (it didn't). `CentrePanel.tsx` and `cv-print/page.tsx` don't hit this because they already declare `"use client"`.
2. **`DOMPurify.sanitize is not a function`** — once (1) was fixed, Next still server-renders the initial HTML of a `"use client"` page/component before hydration, and `dompurify` (the plain npm package, not `isomorphic-dompurify`) has no `sanitize` implementation without a browser `window`/`document`. `HtmlContent.tsx` and `EditableHtml.tsx` both call `DOMPurify.sanitize()` directly during render. Fix: both now guard with `typeof window === "undefined"` and **strip tags** (not pass raw HTML through — passing unsanitized HTML during SSR would be a stored-XSS window) as the SSR fallback; the real `DOMPurify.sanitize()` call still runs on every client-side render after hydration.

**Any new page that renders a CV template outside the `CentrePanel`/`cv-print` gated-loading pattern must have `"use client"`, or it will hit both of the above.**

### ⚠️ Adding a new CV template requires backend enum + migration too (learned adding Portrait, 2026-07-03)
`template_id` isn't just a frontend `TemplateId` string union — the backend has its own `TemplateId(str, enum.Enum)` in `app/models/cv_document.py`, backed by a **native Postgres enum type** (`templateid`, created in `000_initial_schema.py`). Registering a new template only on the frontend (all the files listed above) lets the CV *builder UI* show the template, but selecting it calls `PUT /cv/{id}` with `template_id: "yourtemplate"`, which the backend rejects — surfaces in the UI as a generic "Failed to update CV" toast, not an obviously-backend error. Adding a new template requires **all** of:
1. Frontend registration (6 files: `types/index.ts` ×2 places, `LeftPanel.tsx`, `CentrePanel.tsx`, `cv-print/[cvId]/page.tsx`, `cv-template-preview/[templateId]/page.tsx`, `(dashboard)/templates/page.tsx`)
2. Add the value to `TemplateId` in `backend/app/models/cv_document.py`
3. A new Alembic migration: `ALTER TYPE templateid ADD VALUE IF NOT EXISTS 'yourtemplate'` inside `op.get_context().autocommit_block()` (Postgres requires `ADD VALUE` to run outside a transaction block — see `006_add_corporate_template_id.py` or `007_add_vega_template_id.py` for the exact pattern), then `alembic upgrade head`
4. No backend restart needed if running with `--reload` — it picks up the model change automatically; confirm via `GET /openapi.json` and checking the `TemplateId` enum values

---

## 7. Personal Details Fields

All stored as JSONB in cv_sections.data:
```
full_name, title, email, phone, location,
date_of_birth, nationality, visa_status, gender,
driving_license, marital_status, religion, nic,
photo_url, photo_base64, photo_shape, photo_size,
links: [{ id, platform, url }]
```

Links are clickable in PDF (wrapped in `<a>` tags):
- email → `mailto:`
- phone → `tel:`
- URLs → `target="_blank"`

Company/institution links in experience/education also clickable in PDF.

---

## 8. Education Section Fields

```
degree, institution, institution_link,
location, start_date, end_date,
score_type: "GPA"|"Z-Score"|"Percentage"|"Grade"|"Results"|"Marks"|"CGPA"|"Other",
score_value: string,
description
```

Score displays below institution in all CV templates as:
`GPA: 3.8 / 4.0` or `Z-Score: 1.2345`

---

## 9. Section Heading Styles (SectionHeading.tsx)

9 styles total (all except TechTemplate, CorporateTemplate, and VegaTemplate which each own their own heading renderer function — `SH`, `CH`, and `SH` respectively — and do NOT use SectionHeading.tsx):

| Value | Preview |
|---|---|
| fullline | `EXPERIENCE ────` |
| underline | `EXPERIENCE` (underlined) |
| boxed | `■ EXPERIENCE` (colored bg) |
| plain | `Experience` |
| doubleline | `══ EXPERIENCE ══` |
| leftbar | `▌ EXPERIENCE` |
| dotted | `EXPERIENCE ·······` |
| accentbadge | Full-width accent badge |
| centerlines | `── EXPERIENCE ──` |

fullline, underline, boxed, plain = FREE. Others = PRO.

---

## 10. PDF Export System

### CV PDF Flow:
```
CentrePanel "Download PDF" button
→ POST /api/generate-pdf { cvId, token, fileName, templateId }
→ Puppeteer launches Chrome
→ Chrome loads /cv-print/[cvId]?token=JWT
→ cv-print page fetches CV, renders template
→ Adds <div id="cv-ready-marker"> when ready
→ Puppeteer waits for #cv-ready-marker
→ Injects CSS (print-color-adjust, page-break-inside:avoid)
→ page.evaluate() nudges continuation-page break elements down 40px (see below)
→ page.pdf() → streams as download
```

### Critical Puppeteer settings (generate-pdf/route.ts):
```typescript
await page.emulateMediaType("screen");  // CRITICAL — prevents @media print stripping
await page.waitForSelector("#cv-ready-marker", { timeout: 15000 });
await page.evaluateHandle(() => document.fonts.ready);

await page.addStyleTag({ content: `
  * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
  html, body { background: #ffffff !important; margin: 0 !important; padding: 0 !important; }
  .cv-section, .cv-entry { page-break-inside: avoid !important; break-inside: avoid !important; }
` });

// margin: { top:"0", right:"0", bottom:"0", left:"0" } for ALL templates —
// every template bakes its own visual inset into its own root padding
// (matching the zero-padding page card in the on-screen preview); adding a
// page-level Puppeteer margin on top of that double-counts the inset and
// shrinks the PDF's usable content area vs. the preview's, so page breaks
// land in different places than what the user saw while editing.
```

### ⚠️ PDF section-gap / page-2-margin history (fixed 2026-07-03 — don't reintroduce either bug)
There used to be a blanket `.cv-section { padding-top: 8px !important }` / `.cv-entry { padding-top: 4px !important }` injected only for the PDF (not the on-screen preview), meant to give continuation pages some breathing room at the top so content didn't sit flush against template borders (e.g. Bordered/Tech's 8px frame). Two bugs this caused, both now fixed:
1. **It applied to every section/entry on every page, not just the first one on a new page** — so PDF gaps were silently 8px/4px larger than what `SortableSection`'s "Section spacing" stepper showed in the on-screen preview (which never applies this), for every section, cumulatively. Fixed by removing the hack entirely; `page-break-inside:avoid` alone is sufficient for the "don't split a section" correctness requirement — it doesn't add any visual gap.
2. **Removing it above then left continuation pages (2+) with *zero* top margin** — the on-screen preview (`CentrePanel.tsx`) actually does give page 2+ a real 40px gap, but only as a display-only clip/offset trick (`top: i === 0 ? 0 : 40 - pageStartY[i]`, plus a white mask) that doesn't exist in the PDF's single continuous document flow. Fixed by porting `CentrePanel`'s `calcPageLayout` chunk/break-point algorithm into a `page.evaluate()` call that runs right before `page.pdf()`: it finds the actual DOM element that will start each new printed page and adds a real `margin-top: 40px` to it (page 1 is never a break element, so it's untouched — no double-inset). This means the gap exists in the real flowed document, not just a visual trick, so Chrome's own pagination naturally leaves room for it.

If you touch `generate-pdf/route.ts` again: do not reach for a blanket per-section/per-entry padding as a quick fix for "page 2 looks cramped" — it silently breaks WYSIWYG for every other section on every page. The correct lever is the page-break-point-targeted `margin-top` nudge described above.

### cv-print page (/cv-print/[cvId]/page.tsx):
- Renders template based on template_id
- Has `position:fixed` border overlay for tech template
- Has `position:fixed` left line overlay for creative template
- Has `position:fixed` sidebar overlay for modern template
- Adds `#cv-ready-marker` when loaded

### Chrome path (dev):
`C:\Program Files\Google\Chrome\Application\chrome.exe`

### DEBUG: Screenshot saved to:
`C:/Users/kavidu/debug-screenshot.png` (REMOVE before production)

---

## 11. CentrePanel Preview System

- Template renders in hidden off-screen div (width=794px)
- ResizeObserver watches it, runs `calcPageStarts()` on resize
- Splits content into A4 pages (A4_H=1123px) using `.cv-section` elements
- For Bordered: `position:absolute` border overlay on each page card
- For Timeline: `borderLeft` on outer scaled column div (isCreative flag)
- For Modern: `background: linear-gradient(to right, accentColor 35%, transparent 35%)` on outer wrapper (isModern flag)

---

## 12. Cover Letter Builder

### 8 Templates (matching CV templates):
classic, modern, colorful, executive, bordered, creative(timeline), inline, gcc

### Features:
- AI generation from CV data + job description
- 3 tones: formal / friendly / confident
- Pan+zoom photo crop editor (same as CV)
- Auto-match CV template when CV is linked
- Edit/Preview toggle
- PDF export

### Flow:
```
/cover-letter → list page → click card → /cover-letter/[id] editor
Left panel: CV link, job title, company, job description, tone, template, style tab
Center: A4 preview with real template render
Right: AI generate button, word count stats
```

### Default customization:
```typescript
export const DEFAULT_CL_CUSTOMIZATION = {
  accentColor: "#111827",
  fontFamily: "Arial",
  spacing: "normal",
};
```

### CV template → CL template mapping:
```
classic→classic, modern→modern, minimal→colorful,
executive→executive, tech→bordered, creative→creative,
academic→inline, gcc→gcc
```

### Cover Letter PDF:
```
POST /api/generate-cl-pdf { content, templateId, customization, jobTitle, company, letter, personal }
→ Puppeteer renders HTML with template styles
→ Returns PDF download
```

---

## 13. Template Gallery (/templates)

### Category filters:
- All / Simple / Modern / Creative / Professional

### Free/Pro split:
- FREE: Classic (Simple), Inline (Simple), Colorful (Creative), Halo (Professional)
- PRO: Modern, Bordered, Timeline, Executive, GCC, Portrait, Milestone, Vega

### Template card features:
- iframe preview using `/cv-template-preview/[templateId]`
- Scale calculated dynamically based on container width
- Free badge (green) / Pro badge (amber + lock)
- Popular badge on Classic, Modern, Colorful
- Hover: "Use Template" button (free) or lock overlay (pro)
- Pro click → ProUpgradeModal → /pricing

### New CV flow:
```
CV Builder list page → "New CV" button
→ /templates page (pick template)
→ Creates CV with TEMPLATE_DEFAULT_CUSTOMIZATION
→ /cv-builder/[id] editor
```

---

## 14. CV Builder List Page (/cv-builder)

Resume.io style big card grid:
- iframe preview of actual CV content (scale ~0.40)
- Template color banner at top of card
- Title, last edited date, template name badge
- 3-dot menu: Edit / Duplicate / Delete
- "New CV" card → goes to /templates

---

## 15. AI Assistant (RightPanel.tsx)

### Per-section AI actions:

**Experience:** improve_bullet, add_metrics, duty→achievement, STAR format, make longer, make shorter, fix grammar, remove weak words, add keywords, make professional

**Profile Summary:** rewrite, make shorter, make longer, fix grammar, add keywords, generate from scratch, change tone (executive/technical/friendly), tailor for role, translate

**Skills:** suggest skills, trending skills, group by category, add ATS keywords

**Education:** improve description, make professional, make shorter, fix grammar

**Projects:** improve description, add impact, add metrics, make professional, make shorter, add keywords

**Default:** improve text, make shorter, make longer, make professional, fix grammar, add keywords

### Free limit: 5 AI uses per day (tracked in localStorage)

---

## 16. CV Score (RightPanel.tsx — score tab)

### 8 sub-scores (PRO):
1. Content Quality — action verbs + metrics in bullets
2. Keyword Match — skills vs target role keywords
3. Completeness — all core sections filled
4. Readability — summary length
5. Experience Score — entries count + bullets + metrics
6. Skills Score — skill count
7. Format Score — photo, links, sections
8. Impact Score — achievement language

### Features:
- Score history (saved to localStorage per CV)
- Job Match Score — paste JD, get keyword match %
- Clickable tips → jump to section
- Free users see blurred scores with upgrade prompt

---

## 17. Quick Fixes (RightPanel.tsx — fixes tab)

### Issue detections:
**Critical:** no email, no phone, empty summary, no experience, no bullets

**Warning:** summary too long, few skills, no LinkedIn, open dates, weak phrases, no metrics, no projects, date gaps, duplicate bullets, CV too long, weak summary opener, missing job title, all skills same level

**Tips:** no GitHub, no languages, no declaration, few skills, no certifications, missing photo, short bullets, no portfolio

### Features:
- Severity filter (All/Critical/Warning/Tips)
- Group by section toggle
- Progress bar (issues resolved count)
- Fix → button (jump to section)
- Auto Fix button (PRO) — AI fixes and copies to clipboard

---

## 18. ATS Checker (/ats-checker) — REBUILT for accuracy

### Input options:
- Upload PDF file (max 5MB)
- Paste CV text
- Optional: job description, target role, industry
- ⚠️ Known UX gap: `target_role` is optional but heavily affects Keyword layer accuracy. Currently NOT enforced/warned in UI — user can forget to fill it and get a misleadingly different score (confirmed during testing: same CV scored 45 with role filled vs 53 with role empty, due to keyword layer falling back to generic 5-keyword list). **TODO (not yet built):** add a visible warning banner above the Analyze button when target_role is empty, and an inline note on the Keywords card when `mode === "ai_role_estimate"` was used without a role.

### 7-layer analysis (all layers verified working/accurate as of this session):

1. **ATS Compatibility (20pts)** — deterministic, PyMuPDF structural analysis: tables, images, multi-column layout, font count, clean text extraction, section headings present. Unchanged, confirmed accurate.

2. **Sections & Structure (10pts)** — deterministic: summary/experience/education/skills presence, contact info (name/email/phone/linkedin) presence. **Order penalty removed** — point always awarded, wrong order now shown only as a soft "Tip:", not a deduction. Now also extracts and returns real detected values (not just booleans): `detected_name`, `detected_email`, `detected_phone`, `detected_linkedin` — used by the CV Rebuild Preview feature (section 18.4).

3. **Keyword & Role Relevance (25pts)** — **REBUILT.** Previously used a hardcoded 12-role `INDUSTRY_SKILLS` dict that produced wrong/generic results for any role not in the list (e.g. "Quality Assurance Engineer" → fell back to "Communication, Teamwork" etc., unfairly tanking scores). Now:
   - **With job description:** unchanged — extracts JD keywords via regex, matches against CV using `_match_keywords` (semantic via sentence-transformers if available, else exact match).
   - **Without job description:** new async `_generate_role_keywords(target_role)` function calls Claude to generate 18-20 role-specific keywords for the exact target role, then matches those against the CV using the same `_match_keywords` function. `mode` field returns `"ai_role_estimate"` instead of old `"industry_coverage"`. The old `INDUSTRY_SKILLS` dict has been **removed entirely**.
   - Last-resort fallback (only if the Claude call itself fails): 5 generic keywords (Communication, Problem Solving, Teamwork, Attention to Detail, Time Management).

4. **Content Quality (20pts)** — deterministic, unchanged. Bullet extraction, action verb detection, metric detection (regex), weak phrase detection. Confirmed accurate and reliable — kept as-is.

5. **Language & Grammar (10pts)** — **REBUILT.** Previously used `language_tool_python` (requires local Java + LanguageTool server) with silent fallback to `pyspellchecker` (spelling only) or — worse — silently returning **0 errors / 10-10 score** when both failed, falsely implying perfect grammar. Confirmed broken in testing (showed "0 issues" on a CV that genuinely had errors). Now:
   - Deterministic checks kept: filler words (regex), tense consistency (regex on experience section)
   - Grammar/spelling checking replaced with a Claude API call (same reliable pattern as AI Recruiter layer) — returns genuine, specific errors with exact text snippet + suggestion
   - If the Claude call itself fails, an honest issue is added: *"Grammar check could not be completed — please review your CV manually..."* — score is NOT falsely inflated to 10/10 in this case
   - `_get_language_tool()` function and `_language_tool` global removed entirely

6. **Professional Data (5pts)** — deterministic, unchanged. LinkedIn, portfolio/GitHub, dates complete, certifications, employment gaps.

7. **AI Recruiter Simulation (10pts)** — unchanged, Claude API call simulating a senior recruiter's first impression, strengths, red flags, seniority assessment, hire likelihood %, top improvement. Confirmed to produce genuinely high-quality, specific output during testing (caught things like an unprofessional DOB field on the CV).

### Diagnosis & Recommendations (NEW — `_build_diagnosis` function)
Pure backend aggregation of already-computed layer data, **no new Claude calls**. After all 7 layers run:
- Scans layer details for design/format issues (tables, images, multi-column, font issues, missing sections) → "design" bucket
- Scans layer details for content issues (missing keywords, low-metric bullets, weak phrases, no LinkedIn, no certifications, incomplete dates, multiple grammar errors) → "content" bucket
- Each issue has an `impact` score (rough point-value lost)
- Combines both buckets, sorts by impact descending, returns **top 5** highest-impact issues only
- Also computes:
  ```python
  current_score = overall_score
  total_impact = sum(impact for top 5 issues)
  recovered = round(total_impact * 0.7)  # assume 70% recoverable
  projected_score = min(96, current_score + recovered)  # capped, never claims perfect 100
  ```
- Returned as `diagnosis: { top_issues, design_count, content_count, has_design_issues, has_content_issues, current_score, projected_score }`
- Saved to new `ats_results.diagnosis` JSON column

### "Your CV, Rebuilt with ZenzHire" card (CVRebuildPreview.tsx) — NEW
Shown inside the diagnosis section on the results page. **Zero additional Claude API calls** — pure client-side render using data already available:
- Clones `SAMPLE_CV_DATA` via `buildATSPreviewData()` (in `lib/ats-preview-data.ts`), injecting the user's REAL detected `full_name`, `email`, `phone`, `linkedin` (from layer 2's `detected_*` fields) and `target_role` into the personal_details section — rest of the content stays generic placeholder (no token cost, no fake "AI rewrote your whole CV" claim)
- Renders the same injected data through **4 real template components** (Classic, Colorful/Minimal, Executive, Inline/Academic) at fixed correctly-proportioned A4 thumbnail size (`CARD_WIDTH = 220px`, height calculated via `CARD_WIDTH * (297/210)` to preserve A4 aspect ratio), shown in a horizontal-scroll row
- Free users: all 4 previews blurred (`filter: blur(5px)`) with a lock icon overlay
- Pro users: full unblurred preview
- Score arrow shown: `currentScore → projectedScore` (honest, calculated — NOT hardcoded to always show 80+/90+; this was explicitly decided against during planning to avoid the exact "fake high score → user applies → gets rejected → loses trust" failure mode this whole rebuild was meant to prevent)
- Two CTA buttons at the bottom: "✨ Update with ZenzHire" and "🎨 Browse Templates", both linking to `/templates`
- ⚠️ Known gotcha fixed during build: must reassign fresh `id` values after `JSON.parse(JSON.stringify(SAMPLE_CV_DATA))` clone, or templates can mis-render the header (see section 6 callout)

### Results page layout (REDESIGNED — wide layout w/ sticky sidebar)
Previously the results view was constrained to `max-w-3xl` centered, wasting large amounts of horizontal space on wide screens. Now:
- Results view uses `max-w-[1400px]` with a `grid-cols-[280px_1fr]` layout
- **Left: `ResultsSidebar.tsx`** (sticky, `top-6`) — mini score gauge (110px SVG arc), filename, target role, jump-links to each major section (`scrollIntoView({behavior:"smooth"})`), and always-visible quick action buttons (Browse Templates / Build CV)
- **Right: main results content** — Overall Score, Diagnosis section (incl. CVRebuildPreview), Layer Breakdown (now 3-column grid on `xl:` screens via `xl:grid-cols-3`), Keyword Heatmap, Grammar Issues, Content Quality Detail, AI Recruiter Simulation
- Section ids added for jump-link targets: `ats-score-section`, `ats-diagnosis-section`, `ats-layers-section`, `ats-keywords-section`, `ats-grammar-section`, `ats-recruiter-section`
- **Upload form and loading states remain narrow/centered (`max-w-3xl`)** — only the results view changed to the wide layout

### Backend flow:
```
POST /ats/analyze (multipart/form-data)
→ PDF text extraction (pdf_service.py)
→ run_full_analysis() (ats_service.py) — now async throughout
   l1 = _layer_ats_compatibility (sync)
   l2 = _layer_sections (sync, now returns detected_* values)
   l3 = await _layer_keywords (ASYNC — Claude call if no JD)
   l4 = _layer_content_quality (sync)
   l5 = await _layer_grammar (ASYNC — Claude call)
   l6 = _layer_professional (sync)
   l7 = await _layer_ai_recruiter (ASYNC — Claude call, unchanged)
   diagnosis = _build_diagnosis(layers) — sync, pure aggregation
→ Returns { overall_score, layers, diagnosis }
→ Saved to ats_results table (incl. new diagnosis JSON column)
```

### Free limit: 5 ATS analyses total

### Results display components:
- ScoreGauge (circular gauge 0-100) — now also mirrored as MiniGauge in sidebar
- LayerCard for each of 7 layers (3-column grid on large screens)
- Diagnosis section: top 5 issues + CVRebuildPreview card
- KeywordHeatmap (matched/missing/semantic)
- GrammarIssues (errors, filler words, tense)
- Content Quality bars (action verbs, metrics, achievements)
- RecruiterCard (PRO) — AI hiring simulation
- Pro upsell for locked features

### Auto-load from CV builder:
CV builder "Send to ATS" button saves CV text to `sessionStorage("ats_cv_text")` and navigates to `/ats-checker?from_cv=1`. ATS page auto-loads the text.

---

## 19. Backend API

Base URL: `http://localhost:8000/api/v1`

```
# Auth
POST   /auth/login
POST   /auth/signup
GET    /auth/me

# CV
GET    /cv/                     list all CVs
POST   /cv/                     create CV (accepts customization)
GET    /cv/{id}                 get CV with sections
PUT    /cv/{id}                 update CV
DELETE /cv/{id}                 delete CV
POST   /cv/{id}/duplicate       duplicate CV
POST   /cv/{id}/sections/       add section
PUT    /cv/{id}/sections/{sid}  update section
DELETE /cv/{id}/sections/{sid}  delete section
PUT    /cv/{id}/reorder         reorder sections

POST   /cv/ai/improve           AI text improvement (20+ actions)

# Cover Letter
GET    /cover-letter/           list all
POST   /cover-letter/           create
GET    /cover-letter/{id}       get
PUT    /cover-letter/{id}       update
DELETE /cover-letter/{id}       delete
POST   /cover-letter/ai/generate AI generate cover letter

# ATS
POST   /ats/analyze             run 7-layer analysis (now returns diagnosis too)
GET    /ats/history             past results (last 20)
GET    /ats/{id}                get specific result
```

---

## 20. Auth System

- JWT stored in cookie named `token`
- `useAuth()` hook reads user from `/auth/me`
- `isPro` = `user.plan === "pro"`
- Pro features gated in: CustomizationPanel, RightPanel, ATSChecker, TemplatesPage, CVRebuildPreview (blur+lock)

---

## 21. What's Next (Phase 2)

Priority order:

1. **Landing Page** — `/` marketing page with hero, features, pricing, testimonials
2. **Stripe Payments** — Pro plan subscription, webhook, plan update
3. **Admin Panel** — user management, stats, revenue
4. **CV Upload Parser** — upload PDF → AI extracts → fills real CV Builder sections (explicitly postponed during ATS session — this is a prerequisite for any future "fully personalized rebuilt CV" feature, distinct from the current lightweight CVRebuildPreview which uses placeholder content + injected real name/contact only)
5. **ATS target_role enforcement** — add UI warning when empty (see section 18 known gap)
6. **Production Deployment** — Vercel (frontend) + Railway (backend) + Supabase (DB)

---

## 22. Known Issues / Pending Work

1. **Debug screenshot** — `route.ts` saves to `C:/Users/kavidu/debug-screenshot.png` — REMOVE before production
2. **Modern template PDF** — sidebar color tested with fixed overlay approach, verify on multi-page CVs
3. **Stripe not set up** — Pro upgrade buttons go to `/pricing` (page not built yet)
4. **CV upload parser** — planned feature, not built (see Phase 2 #4)
5. **Mobile responsiveness** — not fully tested on mobile, including the new ATS sidebar layout (verify sidebar stacks correctly on narrow screens)
6. **Email verification** — not implemented in auth
7. **ATS target_role optional but high-impact** — no UI warning yet when left empty (see section 18)
8. **sentence-transformers / semantic keyword matching** — uses lazy-loaded `_get_sentence_model()`; not yet confirmed whether this is reliably installed/working in all environments — falls back to exact-match silently if unavailable. Should be verified before production.
9. **Stale template count in Pro upsell copy** (found during session 4 template audit) — `(dashboard)/templates/page.tsx`'s `ProUpgradeModal` hardcodes the feature bullet `"5 premium CV templates"`, but there are actually **8** Pro templates (modern, tech, creative, executive, gcc, portrait, milestone, vega). This copy was presumably accurate when Modern/Bordered/Timeline/Executive/GCC (5) were the only Pro templates and was never updated when Portrait, Milestone, Corporate†, and Vega were added. (†Corporate/Halo shipped as FREE, so it didn't change the Pro count itself, but Portrait/Milestone/Vega did.) Fix: bump the copy to "8 premium CV templates" or derive the count from `TEMPLATES.filter(t => t.plan === "pro").length` so it can't drift again.
10. **Orphaned `cv_sections.data._layout` field** ({marginBottom, lineHeight}) — leftover from the removed per-section spacing/line-height steppers in `SortableSection.tsx`'s toolbar. No template reads it anymore (all 12 now derive spacing solely from the global `CVCustomization.spacing` value). Safe to ignore — existing stored values are inert, not read anywhere — but clean up with a migration (drop the key from `data` JSONB, or leave it since it's harmless dead data) before production deployment.
11. **`duplicate_cv` doesn't copy `customization`** (found during the preview/PDF pagination-drift investigation, 2026-07-04) — `backend/app/api/routes/cv.py`'s `duplicate_cv` route copies `title`/`template_id`/sections but never sets `customization=source.customization` on the new `CVDocument`, so a duplicated CV silently resets to `DEFAULT_CUSTOMIZATION` instead of keeping the original's accent color/font/spacing/etc. Distinct from the {}-customization preview/PDF drift bug (which is fixed — see `mergeCustomization()` in `frontend/types/index.ts` and `_merge_customization()` in `cv.py`); this one is about losing a user's actual style choices on duplicate, not a rendering inconsistency. Fix: add `customization=_merge_customization(source.customization, None)` to `duplicate_cv`'s `CVDocument(...)` call. Not yet fixed — deliberately deferred.