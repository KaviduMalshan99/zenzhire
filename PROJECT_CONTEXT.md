# ZenzHire — Project Context for Claude Sessions

> Last updated: 2026-07-06 (session 7 — added the 13th CV template, Aurora). Working directory: `F:\zenzhire\zenzhire\`

**CV pagination migration (all 12 templates as of session 6, now 13 with Aurora) completed and verified.** Every template's `generate-pdf/route.ts` PDF export and `CentrePanel.tsx` live preview now agree on page breaks via the single shared `lib/pagination.ts` engine — confirmed directly against the code, not from memory (see section 10.2).

**Session 7 — Aurora (13th template) added.** Full frontend+backend registration, its own Alembic migration (`008_add_aurora_template_id.py`, applied and confirmed — `alembic current == alembic heads == 008_add_aurora`), and shared-pagination-engine support built in from the start rather than retrofitted. Two things worth remembering for any future template:
- **A colored (non-white) sidebar background breaks `SectionHeading.tsx` and `SkillEntry.tsx`.** Both hardcode `accentColor`/`#111827` text assuming a white page behind them — on Aurora's accentColor-filled sidebar this made every heading and skill level **completely invisible** (identical text/background color) until fixed with a dedicated `SidebarHeading` renderer and a plain bullet+name skills list. See section 6's Aurora entry and the ⚠️ callout under "Skills Display."
- **Not every two-column template needs the sidebarBottom-capping lesson (10.4, lesson 5d).** That capping exists specifically to stop a sidebar overlay/band from bleeding into a full-width section (References) below the two-column body. Aurora moved References into the main column instead, so nothing sits below the two-column body anymore — its band deliberately fills the full page height on every page instead (the Modern/Tech/Creative convention), and lesson 5(d) does not apply to it. Check whether a new template actually has a trailing full-width section before assuming the cap is needed.

**Audit note (session 6):** Full re-audit of this file against actual codebase state (not just appending from conversation memory). Corrections found and fixed:
- Section 10.2/22's "`CONTINUATION_TOP_GAP` gap-accounting edge case," previously logged as an open/deferred bug, is **already fixed** in the current `lib/pagination.ts` source (`computePageBreaks()` reserves the gap during the break decision itself, not after) — the doc had gone stale on this.
- Section 10.3 and section 11 both still described Tech/Creative as using `position:fixed` overlays in `cv-print/[cvId]/page.tsx` — that file has **no `position:fixed` divs left at all** (grepped directly); both were migrated to per-page `computePageBreaks()`-derived frames when they joined the shared engine.
- Section 11 described the live preview (`CentrePanel.tsx`) as having a separate "legacy" bespoke chunk-walk for un-migrated templates — it doesn't; `calcPageLayout()` has always called the shared `extractPageChunks()`/`computePageBreaks()` unconditionally for every template. The migrated-vs-legacy distinction only ever existed on the PDF-export side (`generate-pdf/route.ts`'s branch).
- The debug screenshot path (`C:/Users/kavidu/debug-screenshot.png`), logged as a pre-production cleanup item in two places, is **no longer in the codebase** (grepped, zero matches) — already removed, doc just wasn't updated.
- Found a genuinely new, previously **undocumented** issue: `backend/app/models/__init__.py` doesn't import `CoverLetter`, so `alembic env.py`'s `import app.models` never registers the `cover_letters` table with `Base.metadata` for autogenerate (confirmed by reading `env.py` — it only imports the package, not the routes that import `CoverLetter` directly). See section 22.
- Re-audited the "References white/near-white text" issue (old item 13) against all 12 templates' source — found no white/near-white color used anywhere in References rendering now; appears resolved, though this is a source-code audit, not a re-run visual/PDF check.
- Confirmed `duplicate_cv`'s missing `customization` copy is still unfixed (direct code read).
- Confirmed the stale "5 premium CV templates" Pro-upsell copy is still unfixed (direct code read).
- Confirmed no Alembic migration drift: `alembic current` and `alembic heads` both report `007_add_vega` — DB is fully up to date, single head, no pending migrations.

**Audit note (session 4):** Re-verified the CV template count against the actual codebase (there was a belief it had grown to ~16). It has **not** — it is still exactly **12**, and all 12 are fully and consistently registered across every required file (frontend `types/index.ts` ×2, `LeftPanel.tsx`, `CentrePanel.tsx`, `cv-print/[cvId]/page.tsx`, `cv-template-preview/[templateId]/page.tsx`, `(dashboard)/templates/page.tsx`, backend `TemplateId` enum, and a matching Alembic migration for each of the 4 newest ones). No orphaned/half-registered templates found. One real drift was found and fixed below: a `skillStyle: "chips"` option was added to the customization system (now the default) but was never documented.

---

## 1. What is ZenzHire?

ZenzHire is an **AI-powered career and talent intelligence platform**. The primary user is a job seeker who wants to:

- Build a professional CV using a template-based builder
- Create AI-powered cover letters matching their CV style
- Optimize the CV to pass Applicant Tracking Systems (ATS) with an **honest, trustworthy** scoring system
- Get AI-generated feedback and improvement suggestions via Claude API

**Phase 1 (built):** Full CV builder (13 templates), Cover Letter Builder (8 templates), ATS Checker (7-layer analysis, rebuilt for accuracy), AI Assistant (20+ actions), CV Score, Quick Fixes, Template Gallery, Dashboard, ATS Diagnosis & "CV Rebuild Preview" feature.

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
│   │   │       ├── VegaTemplate.tsx      # "Vega" in UI, colored header band + ■ square-marker headings + 2-col body (PRO)
│   │   │       └── AuroraTemplate.tsx    # "Aurora" in UI, two-tone sidebar + photo straddle + 2-col body, References in main col (PRO)
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
  aurora:     { accentColor: "#6b8f71", fontFamily: "Lato",     headerStyle: "left",       headingStyle: "fullline", skillStyle: "nameonly" },
};
```

⚠️ `TEMPLATE_DEFAULT_CUSTOMIZATION` now sets `skillStyle` explicitly for every template except `modern` (previously none of classic/minimal/executive/tech/creative/academic/gcc had a `skillStyle` override, and all silently inherited whatever `DEFAULT_CUSTOMIZATION.skillStyle` was). Now that the global default changed to `"chips"`, those seven were given an explicit `skillStyle: "chips"` entry so their look doesn't silently shift if the global default changes again — `modern` is the one remaining template still relying on the global default falling through.

---

## 6. The 13 CV Templates

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
| `aurora` | AuroraTemplate.tsx | Aurora | PRO | Professional |

⚠️ Note: `creative` is already named "Timeline" in the UI (left accent line + date-column layout) — `milestone` is a *different* design (circular timeline markers/connector line specifically on the Experience section). Don't confuse the two when picking a name for a future template.

### Template Features:

**Classic** — Clean traditional, SVG icons in contact row, supports all headerStyles, centered default

**Modern** — Two-column sidebar layout, sidebar has skills/languages/interests, main has everything else. Migrated to the shared pagination engine (section 10.2) — sidebar full-height color is now one explicit `position:absolute` band per real page, sized/positioned from `computePageBreaks()`'s own output in both `CentrePanel.tsx` and `generate-pdf/route.ts`, not a `position:fixed` overlay (Puppeteer doesn't guarantee those repeat per printed page, and Chromium's flex/grid print-fragmentation is unreliable).

**Colorful (Minimal)** — Bold full-width color banner header, photo in header, full-bleed in PDF (margin:0 top/left/right)

**Executive** — Formal serif, two-column header default, centered elegant layout

**Bordered (Tech)** — Border frame around entire page. Migrated to the shared pagination engine (section 10.2) — the frame is one explicit `position:absolute` box per real page, derived from `computePageBreaks()`'s page count, in both `CentrePanel.tsx` and `generate-pdf/route.ts`; no `position:fixed` overlay remains in `cv-print/[cvId]/page.tsx`. Puppeteer margin: `{top:"0",right:"0",bottom:"0",left:"0"}`. Section icons (◈✦◉etc)

**Timeline (Creative)** — Left accent line `8px`. Migrated to the shared pagination engine (section 10.2) — one `position:absolute` strip per real page derived from `computePageBreaks()`, no `position:fixed` remaining in `cv-print/[cvId]/page.tsx`; `borderLeft` on outer div for preview continuity via CentrePanel isCreative flag

**Inline (Academic)** — Icon contacts row, photo right, clean divider header

**GCC** — Header background uses `accentColor`, photo on RIGHT (no border), pill badges for nationality/DOB/gender/visa/marital/religion/NIC/license, separate light `#f0f4f8` contact row below header (no accent bar)

**Portrait** — Square-framed photo top-left with a thin `accentColor` border, name to the right with the last word in `accentColor` (rest in near-black — derived by splitting `full_name` at the last space, not a separate stored field), full-width divider below the header, then a 2-column body: left column (~34% width, right-bordered) holds Contact/Education/Skills/Soft Skills/Certificates/Languages/Interests, right column holds Summary/Experience/Projects/Courses/Awards/Organizations/Publications/References/Declaration. Section placement into sidebar-vs-main is a hardcoded `SIDEBAR_TYPES` set in the component (same pattern as ModernTemplate), not user-configurable.

**Milestone** — NEW (2026-07-03). No photo. Plain bold uppercase name + title header, full-width divider, then a full-width Career Summary, then a 2-column body (Contact/Education/Skills/Soft Skills/Certificates/Languages/Interests on the left ~34%; Experience/Projects/Courses/Awards/Organizations/Publications/Declaration on the right), then a full-width References grid at the very bottom (outside the 2-column area, always spans both columns). Experience entries render as a vertical timeline — each entry is a flex row with a small circle marker in a fixed-width left column and the connecting line between markers drawn as `position:absolute; top:20px; bottom:-entryGap` inside that column. The line's height comes from CSS flexbox `align-items:stretch` (default) making the marker column match the row's real content height — no JS measurement needed, and it survives PDF pagination the same way every other `.cv-entry` does (`page-break-inside:avoid`). Same hardcoded `SIDEBAR_TYPES` pattern as Portrait/Modern.

**Halo (Corporate)** — NEW (2026-07-03). No photo (photo_shape/photo_size ignored). Left-aligned header: large bold name, muted job title below, then a contact row (SVG icons + phone/email/links inline), with a decorative scattered dot grid SVG in the top-right corner of the header. Thin full-width divider below header. 2-column body **MIRRORED** vs Portrait/Milestone — LEFT column (~65%) is main content (Summary, Work Experience, Projects, etc.); RIGHT column (~35%, `borderLeft` separator) is sidebar (Education, Skills, Languages, etc.). This is the opposite of Portrait/Milestone's sidebar-on-left layout. Section headings use a custom `CH` function local to CorporateTemplate.tsx (does NOT use SectionHeading.tsx — same exception pattern as TechTemplate), rendering `⊙ SECTION NAME` with accent-colored glyph, uppercase, letter-spaced. Skills and Languages in the sidebar always render as plain bullet lists (skill name only) regardless of the `skillStyle` customization — this is intentional and noted in a comment in the component. References render full-width at the bottom outside the 2-column area, as a 2-column card grid (same as Milestone). Alembic migration: `006_add_corporate_template_id.py`.

**Vega** — NEW (2026-07-03). PRO. No photo. **Full-width accent-colored header band**: large bold uppercase name in white, job title below in `rgba(255,255,255,0.7)` letter-spaced, contact items stacked on the right with white SVG icons — all rendered on `backgroundColor: accentColor`. No separate divider line; the colored header provides natural visual separation. 2-column body same orientation as Halo — LEFT (~62%, main content: Summary, Work Experience, Projects, etc.), RIGHT (~38%, `borderLeft: 1.5px solid #e5e7eb` sidebar: Education, Skills, Languages, etc.). Section headings use a custom `SH` function local to VegaTemplate.tsx (does NOT use SectionHeading.tsx), rendering `■ SECTION NAME` with `2px solid accentColor` bottom border spanning the full heading width — the ■ square glyph is the defining visual motif. Work Experience entries also use `■` before the date range (consistent visual rhythm with headings), followed by employer | location, then bold job title, then bullets/description. Education in sidebar: year range in gray, institution in bold uppercase, degree as `● degree` with accent bullet, GPA below. Skills and Languages always render as plain `●` bullet lists (ignores `skillStyle`) — same rationale as Halo. References render full-width at the bottom outside the 2-column area, as a 2-column card grid. Alembic migration: `007_add_vega_template_id.py`.

**Aurora** — NEW (2026-07-06). PRO. Sidebar on the LEFT (~31%, same orientation as Portrait/Milestone, not mirrored like Halo/Vega). **Two-tone sidebar background**: a light neutral-gray zone (`AURORA_GRAY_ZONE_COLOR = "#e2e2e2"`, fixed height `AURORA_GRAY_ZONE_HEIGHT = 120px`) at the top, transitioning via a hard-stop CSS gradient into a solid `accentColor` band for the rest of the sidebar's height. A circular photo (`AURORA_PHOTO_SIZE = 125px` default, `AURORA_PHOTO_TOP = 36px` from the top, white `box-shadow` ring) is centered in the sidebar and deliberately positioned so it straddles the gray/accent boundary — the circle itself never changes color. To the right, the main column's header is just the top of that column: large bold name in `accentColor`, then a full-width (of the main column) solid `accentColor` bar with the job title in white uppercase letter-spaced text — there is no separate full-width header row above the two-column body the way Corporate/Vega/Milestone have one; the header IS the top slice of each column.

Sidebar: Contact/Education/Skills/Languages (same `AURORA_SIDEBAR_TYPES` set pattern as every other two-column template). Main column: Profile/Experience/Projects/etc., **plus References** — deliberately relocated into the main column as a single-column stacked list (not the 2-column grid every other two-column template — Portrait/Milestone/Corporate/Vega — uses full-width for it), because Aurora's main column is only ~490px wide (vs. ~700px+ full-page-width elsewhere) and a 2-column grid at that width left too little room per card for name+title+organization+phone+email without cramped wrapping.

**Two things needed because the sidebar itself is colored, not white** (a first for this codebase — every other sidebar template's sidebar sits on a plain white background):
1. `SectionHeading.tsx` draws its "pop" color (text, underline, badge fill) **in** `accentColor`, assuming a white background behind it. On Aurora's `accentColor`-filled sidebar that assumption breaks completely — heading text becomes literally the same color as what's behind it, fully invisible. Fixed with a dedicated **`SidebarHeading`** function local to AuroraTemplate.tsx (same exception category as Tech/Corporate/Vega's own heading renderers, but scoped to sidebar headings only — main-column headings still use `SectionHeading` normally, since the main column is white). Establishes a 3-tier text-contrast scheme for anything sitting on the colored band: bold `#ffffff` for titles, `rgba(255,255,255,0.92)` for primary body text (degree, institution, skill/language names, contact info), `rgba(255,255,255,0.68)` for secondary/meta text (dates, GPA, skill levels).
2. `SkillEntry.tsx` hardcodes `color: "#111827"` internally with no prop to override it (see the ⚠️ callout under "Skills Display" below) — unreadable against any colored background. Aurora's sidebar Skills section bypasses `SkillEntry` entirely in favor of a plain bullet + name list at the same white/rgba-white color, matching Corporate/Vega's own stated rationale for doing the same thing.

**Pagination — deliberately diverges from lesson 5(d) (section 10.4):** every other two-column template caps its sidebar overlay/divider at `sidebarBottom` specifically to avoid bleeding into a full-width References section below the two-column body. Aurora has no such section anymore (References moved into the main column, above) — so its colored band instead fills the **full page height on every page, including the last**, matching the Modern/Tech/Creative convention of a band/frame spanning every physical page regardless of content. Don't assume every two-column template needs the sidebarBottom cap — check whether it actually has a trailing full-width section first.

Alembic migration: `008_add_aurora_template_id.py`.

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

⚠️ **`SkillEntry.tsx` hardcodes `color: "#111827"` internally, with no prop to override it** (found while building Aurora, 2026-07-06). Every style branch's base text color is this fixed near-black value — fine on the white background every skills-list-using template so far has had behind it, but unreadable on any **colored** sidebar/section background. Corporate, Vega, and now Aurora all sidestep this the same way: bypass `SkillEntry` entirely for their sidebar Skills section and render a plain bullet + skill name directly at a color that actually contrasts with their own background, ignoring the `skillStyle` customization value for that one section. **Any future template with a colored sidebar/section background needs to do the same** — don't wire `SkillEntry` straight in and assume it'll adapt; it won't.

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

9 styles total (all except TechTemplate, CorporateTemplate, and VegaTemplate which each own their own heading renderer function — `SH`, `CH`, and `SH` respectively — and do NOT use SectionHeading.tsx at all). AuroraTemplate.tsx is a **partial** exception: its main-column headings use `SectionHeading` normally (that column is white), but its sidebar headings use a dedicated local `SidebarHeading` function instead, since `SectionHeading` draws its text in `accentColor` — invisible against Aurora's `accentColor`-filled sidebar. See section 6's Aurora entry.

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
→ cv-print page fetches CV, renders template, exposes window.__CV_TEMPLATE_ID__
→ Adds <div id="cv-ready-marker"> when ready
→ Puppeteer waits for #cv-ready-marker
→ Branches on templateId: all 13 templates now run the shared pagination
  engine (10.1/10.2) — the legacy pipeline branch (10.3) still exists in
  the code as an `else` fallback but is unreachable dead code for every
  current template; it only matters again if a future 14th template is
  added without being migrated immediately
→ page.pdf() → streams as download
```

### Critical Puppeteer settings (generate-pdf/route.ts, both pipelines):
```typescript
await page.emulateMediaType("screen");  // CRITICAL — prevents @media print stripping
await page.waitForSelector("#cv-ready-marker", { timeout: 15000 });
await page.evaluateHandle(() => document.fonts.ready);

// margin: { top:"0", right:"0", bottom:"0", left:"0" } for ALL templates —
// every template bakes its own visual inset into its own root padding
// (matching the zero-padding page card in the on-screen preview); adding a
// page-level Puppeteer margin on top of that double-counts the inset and
// shrinks the PDF's usable content area vs. the preview's, so page breaks
// land in different places than what the user saw while editing.
```

### 10.1 Shared Pagination Engine (`lib/pagination.ts`) — background & root cause

Until 2026-07-04, the on-screen preview (`CentrePanel.tsx`'s `calcPageLayout`) and the PDF export (`generate-pdf/route.ts`) each computed page breaks with their **own, independently-maintained** logic. This let them silently disagree. The most visible symptom: a multi-entry section that didn't fully fit on the current page would get **wholesale-shoved to the next page in the PDF** (via a blanket `.cv-section { page-break-inside: avoid }`), while the on-screen preview correctly split it between entries — so what the user saw while editing was not what they downloaded. A related, separate bug (customization defaults resolving inconsistently between the two pages — see section 5 and `mergeCustomization()` below) compounded the drift on some CVs.

**Fix:** a new shared module, `frontend/lib/pagination.ts`, exporting two functions used **identically** by both `CentrePanel.tsx` and `generate-pdf/route.ts`:
- **`extractPageChunks(root)`** — DOM-reading. Walks `.cv-section` elements; a section with ≤1 entry (or a same-row "grid," e.g. a skills grid) becomes one atomic chunk, a section with multiple stacked entries splits into a `[heading + first entry]` chunk (so the heading is never orphaned alone at a page bottom) plus one chunk per remaining entry.
- **`computePageBreaks(chunks, pageHeight)`** — PURE, DOM-free. Given the chunk extents, decides where each page starts (`starts[]`) and which chunk index begins each page after the first (`breakChunkIndex[]`). Same inputs always produce the same outputs, so preview and PDF can't independently diverge.

In the PDF pipeline, `.cv-section` no longer gets `page-break-inside:avoid` — only `.cv-entry` and `.cv-heading-group` (the true atomic units) do — and an explicit `break-before: page` / `page-break-before: always` is applied at exactly the DOM elements `computePageBreaks()` names, instead of hoping Chrome's own CSS-avoid fragmentation independently lands on the same answer the preview shows. Continuation pages (2+) get a real `margin-top: 40px` nudge at the break element (`CONTINUATION_TOP_GAP`) so they don't sit flush against the top — mirroring the 40px clip/offset the preview already gives page 2+ purely for display.

Per-template JSX changes needed to opt in: wrap each multi-entry section's heading + first entry in a `<div className="cv-heading-group" style={{ breakInside:"avoid", pageBreakInside:"avoid" }}>` (see 10.2 for exactly which sections, per template). `generate-pdf/route.ts` then branches on `templateId` — only templates in that branch's list use the shared engine; everything else still runs the legacy pipeline (10.3) untouched.

### 10.2 Templates Migrated to Shared Pagination Engine (12 of 12 — migration complete)

Confirmed directly against `generate-pdf/route.ts`'s shared-pipeline branch condition (not assumed) — all 12 template IDs are present in a single `if` check:
```typescript
if (templateId === "classic" || templateId === "academic" || templateId === "modern" ||
    templateId === "minimal" || templateId === "executive" || templateId === "tech" ||
    templateId === "creative" || templateId === "gcc" || templateId === "portrait" ||
    templateId === "milestone" || templateId === "corporate" || templateId === "vega") {
```

| template_id | Status |
|---|---|
| `classic` | ✅ Migrated |
| `academic` | ✅ Migrated |
| `modern` | ✅ Migrated |
| `minimal` | ✅ Migrated |
| `executive` | ✅ Migrated |
| `tech` | ✅ Migrated |
| `creative` | ✅ Migrated |
| `gcc` | ✅ Migrated |
| `portrait` | ✅ Migrated |
| `milestone` | ✅ Migrated |
| `corporate` | ✅ Migrated |
| `vega` | ✅ Migrated |

**Classic** (first template migrated, 2026-07-04) — also fixed a related bug in `SectionHeading.tsx`: the `fullline`/`dotted`/`centerlines` heading styles used `display:table`, which has measurement/fragmentation quirks that fought the new chunk-based extraction; converted to flexbox (pixel-identical visual output, verified via before/after screenshots). Separately fixed a **customization drift bug**: CVs with incomplete/empty `customization` (`{}` or `null`) rendered inconsistently between preview and PDF (e.g. `skillStyle` resolving to `"chips"` on one page and `"classic"` on the other) because the two pages filled in missing keys differently. Fixed via a shared `mergeCustomization()` helper (`frontend/types/index.ts`, see section 5) used by both `CentrePanel.tsx`'s data load and `cv-print/[cvId]/page.tsx`, plus a one-time backend data migration that backfilled 60 of 63 existing CVs with complete customization objects. The backend also got defense-in-depth (`_merge_customization()` in `backend/app/api/routes/cv.py`) so this can't reoccur via any API consumer, including ones that bypass the frontend.

**Academic (Inline)** — same shared pattern applied to its entry-listing sections; verified zero-px preview/PDF match.

**Modern** — same pattern, plus a template-specific fix: the sidebar background band (previously a CSS gradient trick in preview + a `position:fixed` div in PDF) didn't reliably track real page boundaries — Chromium's print-fragmentation for flex containers is unreliable, and Puppeteer doesn't guarantee `position:fixed` elements repeat per printed page. Fixed by deriving the band's position/height directly from `computePageBreaks()`'s own output in both contexts: one explicit `position:absolute` band per real page, sized to exactly `PAGE_HEIGHT_A4` and stacked at exact multiples of it, instead of trusting flex-stretch or a fixed overlay. Also fixed: Certificates entries weren't tagged `.cv-entry`, so a multi-certificate section couldn't split across pages at all (silently fell back to whole-section behavior). Two small follow-up polish items: page 1/2 padding symmetry, and a suspected last-page sidebar-band height bug that turned out to be a **headless-screenshot-tool false alarm** (not a real rendering bug) — confirmed via direct DOM inspection rather than trusting the screenshot. (See section 22 known-issues item — headless Chromium screenshot/compositing has produced false alarms on this project before; prefer a real, non-headless browser window or direct DOM measurement when verifying pagination fixes.)

**Colorful (Minimal)** — same shared pattern applied to its full-bleed banner header + photo layout; verified zero-px preview/PDF match.

**Executive** (2026-07-05) — same shared pattern applied across its 8 multi-entry sections (Experience, Education, Projects, Certificates, Awards, Courses, Publications, Organizations). Its two-column header needed **no special handling** — plain flex row, no `position:fixed`/`absolute`, renders once in normal document flow (same as Classic's header), unlike Modern's sidebar or Tech's border overlay. Verified zero-px preview/PDF DOM match on short/medium/long fixtures, plus a real PDF re-export confirming content placement (not just page *count*) now matches the preview — before the fix, the entire 7-entry Experience section landed wholesale on page 2 with page 1 mostly blank; after, entries split 6/1 across pages 1/2 exactly as the preview shows.

~~⚠️ **Known gap, found during Executive's verification (2026-07-05)**~~ **RESOLVED.** Re-audited this session directly against `lib/pagination.ts`'s current source: `computePageBreaks()` already reserves `CONTINUATION_TOP_GAP` out of every continuation page's budget *during* the break decision itself (`pageBottom = c.top + (pageHeight - CONTINUATION_TOP_GAP)`), not as a later post-decision injection. The function's own doc comment confirms this explicitly ("an earlier version of this function did [treat full pageHeight as available] ... systematically overpacked them"). This was evidently fixed as part of the Tech/Creative/GCC/Portrait migration work but the doc was never updated — corrected here. No longer an open item; removed from section 22.

**Tech (Bordered)** — migrated. Its `.tech-outer` CSS `outline` (meant for non-paginated rendering, e.g. the dashboard thumbnail) is suppressed inside paginated contexts; `generate-pdf/route.ts` instead paints one explicit `position:absolute` bordered frame per real page, sized to `PAGE_HEIGHT_A4` and stacked at exact multiples of it, derived from `computePageBreaks()`'s page count — not a `position:fixed` overlay (removed from `cv-print/[cvId]/page.tsx` entirely; confirmed via grep, zero `position:fixed` remain in that file).

**Creative (Timeline)** — migrated. Same pattern as Tech: the template's own left accent line (`data-creative-accent-line`, meant for non-paginated rendering) is hidden inside paginated contexts, and one `position:absolute` strip per real page is painted instead, sized/stacked from `computePageBreaks()`'s output.

**GCC** — migrated. Single-column template (no sidebar), so needed no per-page overlay work beyond the standard `.cv-heading-group` wrapping — same category as Executive's header (plain in-flow block, no `position:fixed`/`absolute` concerns).

**Portrait, Milestone, Corporate, Vega** — migrated. These four share a two-column `SIDEBAR_TYPES` layout (Portrait/Milestone: sidebar LEFT ~34%, main RIGHT; Corporate/Vega: **mirrored** — main LEFT ~62–65%, sidebar RIGHT ~35–38%, `borderLeft` divider instead of `borderRight`) and needed dedicated pagination work beyond the single-column templates, since the sidebar column paginates independently of the main column but must never visually split an entry, bleed past its own real content into a full-width References section below it, or start its divider above a colored header band. See section 10.4 for the 4 reusable lessons this produced — established during Portrait/Milestone, then explicitly *reused* (not re-derived or duplicated) for Corporate and Vega by adding each new template's CSS selector to the same generic functions.

### 10.3 Legacy Pipeline — now unused, kept only as a fallback

The pre-2026-07-04 approach (`.cv-section` **and** `.cv-entry` both getting a blanket `page-break-inside:avoid`, so a section that doesn't fit gets pushed wholesale to the next page instead of splitting between entries) still exists as the `else` branch in `generate-pdf/route.ts`, but **no current template runs through it** — all 12 are in the shared-pipeline `if` condition (see 10.2). This branch is only relevant again if a future 13th template is added to the codebase without immediately being migrated onto the shared engine. Do not treat its continued existence in the file as evidence any current template still uses it — check the `if` condition directly, as this section 10.2 audit did.

### 10.4 Consolidated Pagination Lessons (reference for any future 13th template)

Everything learned migrating all 12 templates onto the shared engine, in one place, so this doesn't need to be re-explained or re-derived from scratch:

1. **Single source of truth:** `extractPageChunks()` + `computePageBreaks()` in `lib/pagination.ts` are used **identically** by `CentrePanel.tsx` (live preview, via `calcPageLayout()`) and `generate-pdf/route.ts` (PDF export, via a `page.evaluate()` mirror of the DOM-reading step + a direct Node import of the pure decision function). Same inputs, same outputs, always — the preview and the PDF cannot independently disagree on where a page break falls. Never add a template-specific chunk-walking or break-decision copy; add the new template's markup/selectors to the existing generic functions instead (this is exactly how Corporate and Vega were done, reusing Portrait/Milestone's infrastructure).

2. **`.cv-heading-group` wrapper pattern:** for any section with multiple stacked entries, wrap `[heading, first entry]` together in `<div className="cv-heading-group" style={{breakInside:"avoid", pageBreakInside:"avoid"}}>`, then map the remaining entries normally afterward. This is what stops a heading from being orphaned alone at the bottom of a page. Every migrated template's multi-entry sections (Experience, Projects, Courses, Awards, Organizations, Publications, and the equivalent sidebar sections) follow this shape.

3. **`CONTINUATION_TOP_GAP` gap-accounting (resolved):** the 40px breathing-room every continuation page gets (mirroring the live preview's page-2+ clip/offset trick) must be *reserved during the break decision itself* (`computePageBreaks()`'s own `pageBottom` math), not injected as a `margin-top` afterward and hoped to still fit. Getting this backwards was the root cause of a real, previously-open bug (content silently overflowing onto an unplanned extra page) — see the resolved note above.

4. **Per-page `position:fixed`-style chrome (Modern's sidebar band, Tech's border frame, Creative's accent line):** Puppeteer does not reliably repeat `position:fixed` elements per printed page, and Chromium's print-fragmentation for flex/grid containers is unreliable. The fix pattern every one of these used: hide the template's own single continuous-flow version of the visual element inside paginated contexts, and instead paint one explicit `position:absolute` copy per *real* page, sized to exactly `PAGE_HEIGHT_A4` and positioned at exact multiples of it — derived directly from `computePageBreaks()`'s own page count/`starts[]` output in both `CentrePanel.tsx` and `generate-pdf/route.ts`, never from CSS alone.

5. **Two-column `SIDEBAR_TYPES` templates (Portrait, Milestone, Corporate, Vega) — 4 lessons, established during Portrait/Milestone and reused unchanged for Corporate/Vega:**
   - **(a)** Sidebar sections must carry `.cv-entry`/`.cv-heading-group` but **never** `.cv-section` — `extractPageChunks()` only walks `.cv-section`, so the main column alone drives page-break decisions; a sidebar with `.cv-section` would corrupt that DOM-order chunk list with an independent column's heights.
   - **(b)** Any per-page sidebar divider/border strip must measure the sidebar's *actual* top offset (`sidebarEl.getBoundingClientRect().top`) for page 1, not assume `y=0` — templates have header zones of very different heights above the two-column body (photo header, plain name/title, colored band, etc.), so this must be measured, never hardcoded per template.
   - **(c)** The sidebar "straddle check" (does a sidebar entry get cut across the page-card boundary in the live preview?) must compare against the TRUE physical page edge (`mainStarts[i-1] + pageHeight - CONTINUATION_TOP_GAP`) as both the check reference and the fallback — not wherever the main column happens to stop, which is often earlier than the real edge.
   - **(d)** Any sidebar overlay/divider must be capped at `sidebarBottom` (the sidebar box's own measured bottom — `align-items:stretch` keeps this in sync with whichever column, main or sidebar, is taller) so it never bleeds into a full-width section (References) that sits below the two-column body once the sidebar itself has run out of content on an earlier page. **Always verify this specific case with a stress-test fixture** (a long main column that pushes References to a mid-page position on the same page-card as the tail end of the sidebar's blank space) — this was the one failure mode not caught by simple page-count checks alone, in both the live preview and the real PDF.
   - Implementation-wise: (b)/(c) are handled by the existing generic `calcPageLayout()`/`computeSidebarPageStart()` in `CentrePanel.tsx` — adding a new template's sidebar selector (e.g. `.vega-sidebar`) to the existing `querySelector` list is enough; there is no per-template measurement code to write.

6. **`mergeCustomization()`:** both `CentrePanel.tsx` (data load) and `cv-print/[cvId]/page.tsx` always merge saved `customization` with `DEFAULT_CUSTOMIZATION` through this shared helper before rendering, so an empty/partial/null customization object can't resolve differently between the preview and the PDF. Backend has defense-in-depth too (`_merge_customization()` in `cv.py`).

### ⚠️ PDF section-gap / page-2-margin history (fixed 2026-07-03 — don't reintroduce either bug, applies to both pipelines)
There used to be a blanket `.cv-section { padding-top: 8px !important }` / `.cv-entry { padding-top: 4px !important }` injected only for the PDF (not the on-screen preview), meant to give continuation pages some breathing room at the top so content didn't sit flush against template borders (e.g. Bordered/Tech's 8px frame). Two bugs this caused, both now fixed:
1. **It applied to every section/entry on every page, not just the first one on a new page** — so PDF gaps were silently 8px/4px larger than what `SortableSection`'s "Section spacing" stepper showed in the on-screen preview (which never applies this), for every section, cumulatively. Fixed by removing the hack entirely; `page-break-inside:avoid` alone is sufficient for the "don't split a section" correctness requirement — it doesn't add any visual gap.
2. **Removing it above then left continuation pages (2+) with *zero* top margin** — the on-screen preview (`CentrePanel.tsx`) actually does give page 2+ a real 40px gap, but only as a display-only clip/offset trick (`top: i === 0 ? 0 : 40 - pageStartY[i]`, plus a white mask) that doesn't exist in the PDF's single continuous document flow. Fixed by finding the actual DOM element that will start each new printed page (legacy pipeline: a bespoke `page.evaluate()` chunk walk right before `page.pdf()`; shared engine: the `breakChunkIndex` output of `computePageBreaks()`, see 10.1) and adding a real `margin-top: 40px` to it (page 1 is never a break element, so it's untouched — no double-inset). This means the gap exists in the real flowed document, not just a visual trick, so Chrome's own pagination naturally leaves room for it.

If you touch `generate-pdf/route.ts` again: do not reach for a blanket per-section/per-entry padding as a quick fix for "page 2 looks cramped" — it silently breaks WYSIWYG for every other section on every page. The correct lever is the page-break-point-targeted `margin-top` nudge described above.

### cv-print page (/cv-print/[cvId]/page.tsx):
- Renders template based on template_id, exposes `window.__CV_TEMPLATE_ID__` once resolved (lets `generate-pdf/route.ts` branch pipelines — see 10.1)
- No `position:fixed` overlays remain in this file (confirmed via grep) — Tech's border frame and Creative's accent line are both now injected per-page by `generate-pdf/route.ts` itself (section 10.2), driven by `computePageBreaks()`'s output, since Puppeteer doesn't reliably repeat `position:fixed` elements across printed pages
- Adds `#cv-ready-marker` when loaded

### Chrome path (dev):
`C:\Program Files\Google\Chrome\Application\chrome.exe`

---

## 11. CentrePanel Preview System

- Template renders in hidden off-screen div (width=794px)
- ResizeObserver watches it, runs `calcPageLayout()` on resize
- `calcPageLayout()` delegates directly to `lib/pagination.ts`'s `extractPageChunks()` + `computePageBreaks()` for **all 12 templates uniformly** — the exact same functions `generate-pdf/route.ts` uses, so the two can't independently disagree on break points. This has always been true of the live preview regardless of a template's PDF-pipeline migration status (the "migrated vs. legacy" distinction in section 10.2/10.3 only ever applied to `generate-pdf/route.ts`'s branching, never to `CentrePanel.tsx`) — there is no separate bespoke chunk-walk left in this file.
- For Portrait/Milestone/Corporate/Vega (the four two-column `SIDEBAR_TYPES` templates): `calcPageLayout()` additionally computes independent `sidebarStarts`/`bodyTop`/`sidebarBottom` values (via `extractSidebarChunks()` + `computeSidebarPageStart()`) so the sidebar column can be re-rendered as its own clipped, independently-offset overlay per page-card — see section 10.4, lesson 5.
- For Bordered (Tech): `position:absolute` border overlay on each page card
- For Timeline (Creative): `borderLeft` on outer scaled column div (isCreative flag)
- For Modern: one `position:absolute` sidebar-color band per page card, sized/positioned from `computePageBreaks()`'s own `starts[]` output (isModern flag) — replaced the old single whole-column CSS gradient, which had no per-page boundary awareness

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

1. ~~**Debug screenshot** — `route.ts` saves to `C:/Users/kavidu/debug-screenshot.png`~~ **RESOLVED (confirmed session 6)** — grepped the entire frontend for `debug-screenshot`, `writeFile`, and `screenshot(` in both PDF routes: zero matches. Already removed from the codebase; this item and its section 10 callout were just never cleaned up in the doc.
2. ~~**Modern template PDF** — sidebar color tested with fixed overlay approach, verify on multi-page CVs~~ **RESOLVED 2026-07-04** — Modern migrated to the shared pagination engine; the sidebar band is now derived per-page from `computePageBreaks()`'s own output in both preview and PDF, not a `position:fixed` overlay. See section 10.2.
3. **Stripe not set up** — Pro upgrade buttons go to `/pricing` (page not built yet) — confirmed still true (no `/pricing` route exists, zero Stripe references anywhere in the codebase, session 6 re-check)
4. **CV upload parser** — planned feature, not built (see Phase 2 #4)
5. **Mobile responsiveness** — not fully tested on mobile, including the new ATS sidebar layout (verify sidebar stacks correctly on narrow screens) — not independently re-verified this session (requires visual/device testing, not a code audit)
6. **Email verification** — not implemented in auth — confirmed still true (no verification-related code found, session 6 re-check)
7. **ATS target_role optional but high-impact** — no UI warning yet when left empty (see section 18) — confirmed still true (no warning/banner text found near the `target_role` input, session 6 re-check)
8. **sentence-transformers / semantic keyword matching** — uses lazy-loaded `_get_sentence_model()`; not yet confirmed whether this is reliably installed/working in all environments — falls back to exact-match silently if unavailable. Should be verified before production. (Confirmed the lazy-load pattern is still exactly as described, session 6 re-check.)
9. **Stale template count in Pro upsell copy** (found during session 4 template audit) — `(dashboard)/templates/page.tsx`'s `ProUpgradeModal` hardcodes the feature bullet `"5 premium CV templates"`, but there are actually **8** Pro templates (modern, tech, creative, executive, gcc, portrait, milestone, vega). This copy was presumably accurate when Modern/Bordered/Timeline/Executive/GCC (5) were the only Pro templates and was never updated when Portrait, Milestone, Corporate†, and Vega were added. (†Corporate/Halo shipped as FREE, so it didn't change the Pro count itself, but Portrait/Milestone/Vega did.) Fix: bump the copy to "8 premium CV templates" or derive the count from `TEMPLATES.filter(t => t.plan === "pro").length` so it can't drift again. **Confirmed still unfixed (session 6 direct code re-check).**
10. **Orphaned `cv_sections.data._layout` field** ({marginBottom, lineHeight}) — leftover from the removed per-section spacing/line-height steppers in `SortableSection.tsx`'s toolbar. No template reads it anymore (all 12 now derive spacing solely from the global `CVCustomization.spacing` value — confirmed zero references to `_layout` anywhere in `components/cv-builder`, session 6 re-check). Safe to ignore — existing stored values are inert, not read anywhere — but clean up with a migration (drop the key from `data` JSONB, or leave it since it's harmless dead data) before production deployment.
11. **`duplicate_cv` doesn't copy `customization`** (found during the preview/PDF pagination-drift investigation, 2026-07-04) — `backend/app/api/routes/cv.py`'s `duplicate_cv` route copies `title`/`template_id`/sections but never sets `customization=source.customization` on the new `CVDocument`, so a duplicated CV silently resets to `DEFAULT_CUSTOMIZATION` instead of keeping the original's accent color/font/spacing/etc. Distinct from the {}-customization preview/PDF drift bug (which is fixed — see `mergeCustomization()` in `frontend/types/index.ts` and `_merge_customization()` in `cv.py`); this one is about losing a user's actual style choices on duplicate, not a rendering inconsistency. Fix: add `customization=_merge_customization(source.customization, None)` to `duplicate_cv`'s `CVDocument(...)` call. **Confirmed still unfixed (session 6 direct code re-check — the route's `CVDocument(...)` call still has no `customization` kwarg).**
12. ~~**Shared pagination engine: `CONTINUATION_TOP_GAP` gap-accounting edge case**~~ **RESOLVED (confirmed session 6)** — re-read `lib/pagination.ts`'s current `computePageBreaks()` directly: it already reserves `CONTINUATION_TOP_GAP` out of every continuation page's budget as part of the break decision itself (`pageBottom = c.top + (pageHeight - CONTINUATION_TOP_GAP)`), not as a later `margin-top` injection that the decision couldn't see coming. The function's own doc comment explicitly describes the old, broken behavior in the past tense. This was fixed at some point after being logged but the doc was never updated — see section 10.2 for the full corrected note.
13. **References section email/phone rendering in white/near-white text (unreadable)** — previously logged as "fixed on Classic and Modern only, needs verifying on the rest." **Re-audited session 6:** checked every one of the 12 templates' source for the `Phone:`/`Email:` (or bare email/phone) rendering in their References section — every one uses either no explicit color (inherits the surrounding readable text color) or an explicit readable gray (`#555`, `#4b5563`, `#6b7280`, or each template's own `LIGHT` constant, all `#6b7280`). Found no white/near-white color anywhere. **Appears resolved across all 12 templates** — but this is a source-code audit, not a re-run visual/PDF screenshot check, so treat as high-confidence rather than fully closed until someone visually confirms.
14. **NEW (found during session 6 audit): `backend/app/models/__init__.py` never imports `CoverLetter`** — it only imports `User`, `CV`, `CVDocument`/`CVSection`, and `ATSResult`. `alembic/env.py`'s `import app.models` (used specifically to "ensure all models are registered" before `target_metadata = Base.metadata` is set for autogenerate) therefore never registers the `cover_letters` table with `Base.metadata` through that import path. In normal app runtime this is harmless — `app/api/routes/cover_letter.py` imports `CoverLetter` directly from its own module, which is enough for the live app — but it means `alembic revision --autogenerate` could fail to detect legitimate future changes to the `cover_letters` table, or worse, generate a spurious drop/mismatch, since Alembic's metadata comparison won't know that table's model exists. Fix: add `from app.models.cover_letter import CoverLetter` to `backend/app/models/__init__.py`. Not yet fixed.
15. **Migration drift check (session 6):** `alembic current` and `alembic heads` both report `007_add_vega` — single head, DB fully up to date, no pending/unapplied migrations. (This is a confirmation, not an issue — logged here so a future session doesn't need to re-run the check without reason.)