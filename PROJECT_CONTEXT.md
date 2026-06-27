

# ZenzHire — Project Context for Claude Sessions

> Last updated: 2026-06-22. Working directory: `F:\zenzhire\`

---

## 1. What is ZenzHire?

ZenzHire is an **AI-powered career and talent intelligence platform** being built from scratch. The primary user is a job seeker who wants to:

- Build a professional CV using a template-based builder
- Optimize the CV to pass Applicant Tracking Systems (ATS)
- Get AI-generated feedback and improvement suggestions via Claude API

Phase 1 (currently built): Landing page, auth, full CV builder, ATS checker, dashboard.
Phase 2 (planned): Stripe payments, Pro plan features, job matching.

---

## 2. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | FastAPI (Python), PostgreSQL, SQLAlchemy, Alembic |
| AI | Anthropic Claude API — model `claude-sonnet-4-6` |
| Auth | JWT tokens via `python-jose` (HS256), stored as cookies (`js-cookie`) |
| PDF Export | `puppeteer-core` + local Chrome (dev) / `@sparticuz/chromium` (prod) |
| Rich Text | Tiptap (`@tiptap/react`, starter-kit + extensions) |
| Drag & Drop | `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities` |
| Fonts | Google Fonts (Roboto, Playfair Display, Lato, Dancing Script) |

**Ports:** Frontend on `localhost:3000`, Backend on `localhost:8000`.

**Design system:** Dark navy — `#0d1117` bg, `#161b22` surface, `#30363d` borders, `#2563eb` primary blue.  
Note: `globals.css` sets `html, body { background: #0d1117 }` unconditionally. The cv-print layout overrides this with white.

---

## 3. Monorepo Structure

```
F:\zenzhire\
├── frontend/                      # Next.js 14 App Router
│   ├── app/
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         # Dashboard shell with sidebar nav
│   │   │   ├── page.tsx           # Dashboard overview
│   │   │   └── cv-builder/
│   │   │       └── page.tsx       # Main CV builder page (3-panel layout)
│   │   ├── api/
│   │   │   └── generate-pdf/
│   │   │       └── route.ts       # ← KEY: Puppeteer PDF generation endpoint
│   │   ├── cv-print/
│   │   │   ├── layout.tsx         # Forces white background for Puppeteer
│   │   │   └── [cvId]/
│   │   │       └── page.tsx       # Page loaded by Puppeteer headless Chrome
│   │   ├── auth/                  # Login/signup pages
│   │   ├── globals.css            # Dark theme (NOTE: forces dark bg on html/body)
│   │   └── layout.tsx
│   ├── components/
│   │   └── cv-builder/
│   │       ├── LeftPanel.tsx      # Template selector, section manager, DnD
│   │       ├── CentrePanel.tsx    # A4 preview, zoom, PDF export trigger
│   │       ├── RightPanel.tsx     # AI assistant, ATS score ring
│   │       ├── AddSectionModal.tsx
│   │       ├── CustomizationPanel.tsx  # Accent color, font, spacing, style pickers
│   │       ├── SectionHeading.tsx      # Shared section header component
│   │       └── templates/
│   │           ├── HtmlContent.tsx     # Renders Tiptap HTML safely
│   │           ├── ClassicTemplate.tsx
│   │           ├── ModernTemplate.tsx
│   │           ├── MinimalTemplate.tsx   # (called "Colorful" in UI)
│   │           ├── ExecutiveTemplate.tsx
│   │           ├── TechTemplate.tsx      # (called "Bordered" in UI)
│   │           ├── CreativeTemplate.tsx
│   │           ├── AcademicTemplate.tsx
│   │           └── GCCTemplate.tsx
│   └── types/
│       └── index.ts               # CVDocument, CVSection, CVCustomization types
│
└── backend/
    ├── app/
    │   ├── api/routes/
    │   │   ├── auth.py            # POST /auth/login, /auth/signup
    │   │   ├── cv.py              # Full CV CRUD + AI improve endpoint
    │   │   └── ats.py             # POST /ats/analyze, GET /ats/history
    │   ├── models/
    │   │   ├── user.py
    │   │   └── cv_document.py     # cv_documents + cv_sections tables
    │   └── schemas/cv.py          # Pydantic schemas
    └── alembic/versions/          # DB migrations
```

---

## 4. Database Schema

```sql
-- Users table
users (id, email, full_name, hashed_password, is_active, plan, created_at)
-- plan: "free" | "pro"

-- CV Documents
cv_documents (id, user_id, title, template_id, is_primary, customization JSONB, created_at, updated_at)
-- customization JSON shape: { accentColor, fontFamily, spacing, headerStyle, headingStyle }

-- CV Sections
cv_sections (id, cv_id, section_type, display_order, is_visible, data JSONB, created_at, updated_at)

-- ATS Results
ats_results (id, user_id, cv_id, job_description, scores JSONB, feedback JSONB, created_at)
```

**15 section types:** `personal_details`, `profile_summary`, `experience`, `education`, `skills`, `languages`, `projects`, `courses`, `certificates`, `awards`, `interests`, `publications`, `organizations`, `references`, `declaration`

**Repeatable sections** (can have multiple entries): `experience`, `education`, `projects`, `courses`, `certificates`, `awards`, `publications`, `organizations`

---

## 5. CV Customization System

`CVCustomization` interface (in `frontend/types/index.ts`):

```typescript
interface CVCustomization {
  accentColor: string;        // hex color, default "#2563eb"
  fontFamily: string;         // "Arial" | "Georgia" | "Roboto" | "Playfair Display" | "Lato"
  spacing: "compact" | "normal" | "spacious";  // multiplier: 0.75 / 1.0 / 1.35
  headerStyle: "left" | "centered" | "twocolumn";
  headingStyle: "fullline" | "underline" | "boxed" | "plain";
}
```

Customization is stored as JSONB in `cv_documents.customization`. Templates receive it as a prop.

---

## 6. The 8 CV Templates

All templates are React components in `frontend/components/cv-builder/templates/`. They receive `{ sections: CVSection[], customization?: CVCustomization }` as props.

### Template ID → Component → UI Name mapping:

| template_id | Component | UI Name | PDF Status |
|---|---|---|---|
| `classic` | ClassicTemplate.tsx | Classic | ✅ Fixed — margins reduced |
| `modern` | ModernTemplate.tsx | Modern | ⚠️ Not tested for PDF |
| `minimal` | MinimalTemplate.tsx | Colorful | ✅ Fixed — 3→2 pages |
| `executive` | ExecutiveTemplate.tsx | Executive | ✅ Fixed — margins set to 20px 30px |
| `tech` | TechTemplate.tsx | Bordered | ✅ Fixed — border system, duplicate border removed |
| `creative` | CreativeTemplate.tsx | Creative | ⚠️ Not tested for PDF |
| `academic` | AcademicTemplate.tsx | Academic | ⚠️ Not tested for PDF |
| `gcc` | GCCTemplate.tsx | GCC | ⚠️ Not tested for PDF |

### Per-template specifics:

**Classic (ClassicTemplate.tsx)**
- Uses `SectionHeading` component (supports `headingStyle` variants: fullline/underline/boxed/plain)
- Supports `headerStyle` (left/centered/twocolumn)
- Shows gender/visa/nationality in contact row
- Subskills shown as small gray tags under each skill
- PDF fix applied: `pad = Math.round(28 * sp)`, `padX = Math.round(32 * sp)` (was 40/45)

**Modern (ModernTemplate.tsx)**
- Two-column layout: sidebar (colored accent background) + main content
- Sidebar always gets: skills, languages, interests, declaration
- Main content: everything else in section order
- Shows photo (if provided) in sidebar
- Gender/visa/nationality shown in sidebar
- **PDF status: NOT tested** — two-column layouts often have issues with PDF page breaks

**Minimal / "Colorful" (MinimalTemplate.tsx)**
- Bold colorful header area in accent color with white text
- Full-width colored banner for name/title/contacts
- Shows photo (circular, 90×90px) in header if provided
- PDF fix applied: header sizes reduced, spacing tightened, 3 pages → 2 pages
  - `mb = Math.round(14 * sp)`, `entryMb = Math.round(10 * sp)`
  - Header: `padding: "16px 32px"`, photo 90×90px, name 24px, title 13px

**Executive (ExecutiveTemplate.tsx)**
- Formal serif font (Georgia), monochromatic/elegant style
- Centered header by default
- PDF fix applied: fixed `padding: "20px 30px"` (removed dynamic pad variables)

**Tech / "Bordered" (TechTemplate.tsx)**
- **Unique feature:** Colored border frame around the entire CV page
- The border is NOT on the template's outer div — it is drawn by two external overlays:
  1. **In CentrePanel preview:** `position: absolute` overlay div on each page card
  2. **In cv-print page (PDF):** `position: fixed` overlay div (renders on every PDF page)
- Template outer div has NO border (removed to fix duplicate border bug)
- Inner content padding: `paddingTop/Bottom: 20px`, `paddingLeft/Right: 32px`
- Section headers use inline decorative icons (◈, ✦, ◉, etc.) + flanking horizontal lines
- Puppeteer margin for this template: `{ top: "0", right: "0", bottom: "0", left: "0" }`
- Page 2 spacing fix: `.cv-section { padding-top: 8px }` injected via Puppeteer addStyleTag

**Creative (CreativeTemplate.tsx)**
- Colorful/expressive layout, dot-rating for languages
- **PDF status: NOT tested**

**Academic (AcademicTemplate.tsx)**
- Formal academic style, dot-rating for languages
- **PDF status: NOT tested**

**GCC (GCCTemplate.tsx)**
- Gulf/Middle East market style
- Includes gender, nationality, visa status, marital status, DOB fields in header badges
- **PDF status: NOT tested**

---

## 7. PDF Export System (Puppeteer)

### Architecture

The PDF flow is:
```
User clicks "Download PDF" in CentrePanel
  → POST /api/generate-pdf  (Next.js API route)
  → Puppeteer launches headless Chrome
  → Chrome navigates to /cv-print/[cvId]?token=JWT
  → cv-print page fetches CV data from backend API
  → cv-print page renders the template
  → cv-print page adds <div id="cv-ready-marker"> when ready
  → Puppeteer waits for #cv-ready-marker
  → Puppeteer injects CSS via addStyleTag
  → Puppeteer saves debug screenshot to C:/Users/kavidu/debug-screenshot.png
  → Puppeteer calls page.pdf() → returns Buffer
  → NextResponse streams PDF as download
```

### Key file: `frontend/app/api/generate-pdf/route.ts`

Critical settings that MUST be present:
```typescript
await page.emulateMediaType("screen");   // ← CRITICAL: without this, @media print strips content
await page.waitForSelector("#cv-ready-marker", { timeout: 15000 });
await page.evaluateHandle(() => document.fonts.ready);  // wait for Google Fonts

const isBordered = templateId === "tech";

await page.addStyleTag({
  content: `
    * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { background: #ffffff !important; color: #111827 !important; margin: 0 !important; padding: 0 !important; }
    .cv-section { padding-top: 8px !important; }   /* breathing room on page 2+ */
    .cv-entry   { padding-top: 4px !important; }
  `,
});

const pdf = await page.pdf({
  format: "A4",
  printBackground: true,
  margin: isBordered
    ? { top: "0", right: "0", bottom: "0", left: "0" }   // Bordered needs 0 margins so frame touches edges
    : { top: "8mm", right: "8mm", bottom: "8mm", left: "8mm" },
  displayHeaderFooter: false,
});
```

### Key file: `frontend/app/cv-print/[cvId]/page.tsx`

- `"use client"` component using `useSearchParams()` for JWT token
- Fetches CV from `NEXT_PUBLIC_API_URL/api/v1/cv/${cvId}` with `Authorization: Bearer ${token}`
- Renders template based on `template_id`
- Has `position: fixed` border overlay for `templateId === "tech"`:
  ```tsx
  {templateId === "tech" && (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      border: `8px solid ${customization.accentColor}`,
      pointerEvents: "none", zIndex: 9999,
    }} />
  )}
  ```
- Adds `<div id="cv-ready-marker" style={{ display: "none" }} />` when data is loaded

### Key file: `frontend/app/cv-print/layout.tsx`

- Overrides `globals.css` dark theme with white background:
  ```tsx
  <style>{`html, body { background-color: #ffffff !important; color: #111827 !important; margin: 0 !important; padding: 0 !important; }`}</style>
  ```

### Chrome Path (dev)

Puppeteer auto-detects Chrome at these paths in order:
1. `CHROME_PATH` env var
2. `C:\Program Files\Google\Chrome\Application\chrome.exe`
3. `C:\Program Files (x86)\Google\Chrome\Application\chrome.exe`
4. `C:\Users\{username}\AppData\Local\Google\Chrome\Application\chrome.exe`

Dev: uses `puppeteer-core` + local Chrome. Prod: uses `@sparticuz/chromium`.

---

## 8. CentrePanel Preview System

`frontend/components/cv-builder/CentrePanel.tsx`

**Paged preview algorithm:**
- Template renders once in a hidden off-screen div (width=794px, absolute left=-9999px)
- `ResizeObserver` watches the hidden div and runs `calcPageStarts()` on resize
- `calcPageStarts()` queries `.cv-section` elements via `querySelectorAll`, tracks which sections overflow the current A4 page height (1123px)
- For each page, renders the template again but clipped via absolute positioning + overflow:hidden
- White mask divs cover content bleeding from adjacent pages
- For `isTech`, a `position: absolute` border overlay is drawn on each page card

**Constants:** `A4_W = 794`, `A4_H = 1123`, `PAGE_GAP = 20`

**PDF export trigger in CentrePanel:**
```typescript
body: JSON.stringify({ cvId: cv.id, token, fileName, templateId: cv.template_id })
```
Token is read from cookies: `document.cookie.split(";").find(c => c.trim().startsWith("token="))?.split("=")[1]`

---

## 9. What Has Been Fixed (This Session)

All fixes were applied in a single extended session focused on PDF generation.

### Root cause fix (critical)
- **Problem:** PDF pages were blank (2KB files)
- **Root cause:** Chrome switches to `@media print` when generating PDFs, which strips all template content (templates use inline styles, not print CSS)
- **Fix:** `await page.emulateMediaType("screen")` in route.ts before navigation

### White-on-white fix
- **Problem:** Colors/backgrounds disappeared in PDF
- **Fix:** `printBackground: true` + CSS injection of `-webkit-print-color-adjust: exact !important`

### Dark background in PDF
- **Problem:** `globals.css` sets `html, body { background: #0d1117 }` always
- **Fix:** `frontend/app/cv-print/layout.tsx` injects white background CSS in `<style>` tag (must be in layout, not useEffect, because Puppeteer captures the initial render)

### Ready signal
- **Problem:** `document.title === "CV_READY"` was fragile
- **Fix:** `<div id="cv-ready-marker">` in the cv-print page; Puppeteer uses `waitForSelector("#cv-ready-marker")`

### Classic template margins
- Reduced base padding: `pad = Math.round(28 * sp)` (was 40), `padX = Math.round(32 * sp)` (was 45)
- Puppeteer margin set to `8mm` on all sides

### Minimal/Colorful template pagination (3 pages → 2 pages)
- Reduced `mb = Math.round(14 * sp)` (was 20), `entryMb = Math.round(10 * sp)` (was 14)
- Reduced header: `padding: "16px 32px"`, photo 90×90px, name 24px, title 13px, contact 10px

### Executive template margins
- Changed to fixed: `padding: "20px 30px"` (removed dynamic pad variables that over-padded)

### Tech/Bordered template — border system
- Removed all `padding: "0 36px"` from individual section divs (14 instances)
- Added inner padding wrapper: `paddingTop/Bottom: 20px`, `paddingLeft/Right: 32px`
- Outer div: removed `border` property (was causing duplicate border with cv-print fixed overlay)
- Puppeteer margin: `{ top: "0", right: "0", bottom: "0", left: "0" }` (border must touch edges)
- Page 2 spacing: `.cv-section { padding-top: 8px }` via Puppeteer CSS injection (removed broken `@page` approach)

### Tech template — duplicate border fix (latest fix)
- **Problem:** cv-print page has `position: fixed` overlay for the border frame (renders on every PDF page). TechTemplate's outer div ALSO had `border: 8px solid ${accentColor}`. On the last PDF page, the template's own bottom border appeared where content ended (above page bottom) AND the fixed overlay border appeared at the page bottom → two colored bottom lines.
- **Fix:** Removed `border: \`8px solid ${accentColor}\`` from TechTemplate's outer div. The border is now drawn only by the fixed overlay in cv-print (PDF) and by the absolute overlay in CentrePanel (preview).

---

## 10. Current Known Bugs / Pending Work

### HIGH PRIORITY — Templates not tested for PDF

These 4 templates have never been tested with Puppeteer PDF export. They likely have margin, spacing, or pagination issues similar to what was fixed in Classic/Minimal/Executive:

1. **Modern (ModernTemplate.tsx)** — Two-column layout. Two-column divs often break badly in PDF; the sidebar and main column may not align correctly across pages.
2. **Creative (CreativeTemplate.tsx)** — Unknown state.
3. **Academic (AcademicTemplate.tsx)** — Unknown state.
4. **GCC (GCCTemplate.tsx)** — Unknown state. Has additional personal detail fields (gender, nationality, visa, DOB, marital status).

**How to test each:** Export PDF in the browser, check the debug screenshot at `C:/Users/kavidu/debug-screenshot.png`, and verify page count + spacing.

### MEDIUM PRIORITY — Debug screenshot in production

`route.ts` saves `page.screenshot({ path: "C:/Users/kavidu/debug-screenshot.png" })` on every export. This is a Windows-specific hardcoded path used for development debugging. This must be removed or made conditional before any production deployment.

### LOW PRIORITY — Tech template page 2 spacing verification

The `.cv-section { padding-top: 8px }` fix was applied but the PDF was not yet exported to verify it actually resolved the page 2 spacing issue (content touching the top border). Next session should: export the Bordered template PDF and check if page 2 content has visible breathing room.

### LOW PRIORITY — Tech template duplicate border verification

The duplicate bottom border fix (removing outer div `border`) was applied in this session but not verified via PDF export. Next session should: export the Bordered template PDF and confirm only ONE border line at the bottom of the last page.

### Known design quirk — `.cv-section padding-top` affects all templates
The Puppeteer CSS injection adds `padding-top: 8px` to every `.cv-section` div across ALL templates (not just Bordered). This was intentional to give breathing room on page 2+ but could slightly affect spacing in templates that already have tight section margins. If any template looks slightly over-spaced, this injection may need to be made template-specific.

---

## 11. How Templates Are Structured (Pattern)

All templates follow the same pattern:

```tsx
export function TemplateNameTemplate({ sections, customization = DEFAULT_CUSTOMIZATION }) {
  const { accentColor, fontFamily, spacing } = customization;
  const sp = spacing === "compact" ? 0.75 : spacing === "spacious" ? 1.35 : 1.0;
  const eb: React.CSSProperties = { pageBreakInside: "avoid", breakInside: "avoid" };

  // Personal details helper
  const personal = get(sections, "personal_details");

  // Section renderer
  const renderSection = (section: CVSection) => {
    switch (section.section_type) {
      case "experience": return (
        <div className="cv-section" style={{ marginBottom: Math.round(20 * sp) }}>
          <SectionHeading title="Experience" ... />
          {entries.map((e, i) => (
            <div key={i} className="cv-entry" style={{ ...eb }}>
              {/* entry content */}
            </div>
          ))}
        </div>
      );
      // ... other section types ...
    }
  };

  return (
    <div style={{ width: "100%", ... }}>
      {/* Header */}
      {/* Sections */}
      {sections.map(section => renderSection(section))}
    </div>
  );
}
```

**Important classNames used for PDF/preview systems:**
- `className="cv-section"` — Page break tracking (calcPageStarts in CentrePanel) + Puppeteer padding injection
- `className="cv-entry"` — Puppeteer padding injection, also has `breakInside: avoid`
- `className="cv-section-header"` — Section title wrapper (used in TechTemplate's SH component)

**`SectionHeading` component** (`frontend/components/cv-builder/SectionHeading.tsx`): Used by Classic, Modern, Minimal, Executive, Creative, Academic, GCC. Renders the section title with style variants (fullline/underline/boxed/plain). TechTemplate uses its own inline `SH` function instead.

---

## 12. Backend API (FastAPI)

Base URL: `http://localhost:8000/api/v1`

Key endpoints used by the frontend:
```
POST   /auth/login              → { access_token, user }
POST   /auth/signup             → { access_token, user }

GET    /cv/                     → list all user CVs
POST   /cv/                     → create new CV
GET    /cv/{id}                 → get CV with all sections
PUT    /cv/{id}                 → update CV metadata
DELETE /cv/{id}                 → delete CV
POST   /cv/{id}/duplicate       → duplicate CV

POST   /cv/{id}/sections/       → create section
PUT    /cv/{id}/sections/{sid}  → update section data
DELETE /cv/{id}/sections/{sid}  → delete section
PUT    /cv/{id}/reorder         → reorder sections (DnD)

POST   /cv/ai/improve           → AI section improvement (Claude API)

POST   /ats/analyze             → run ATS analysis (Claude API)
GET    /ats/history             → past ATS results
```

JWT token payload: `{ sub: str(user_id), exp: datetime }`, algorithm HS256.

---

## 13. Environment Setup

**Frontend:**
```bash
cd F:\zenzhire\frontend
npm run dev        # starts on :3000
```

**Backend:**
```bash
cd F:\zenzhire\backend
uvicorn app.main:app --reload --port 8000
```

**Environment variables (frontend `.env.local`):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Backend `.env`:**
```
DATABASE_URL=postgresql://...
SECRET_KEY=...
ANTHROPIC_API_KEY=...
```

---

## 14. Session History / What to Continue

This session (2026-06-22) was entirely focused on PDF generation bugs. The sequence of fixes:

1. Blank PDF (2KB) → `emulateMediaType("screen")` 
2. White-on-white → `printBackground: true` + `print-color-adjust: exact`
3. Dark background → cv-print `layout.tsx` white override
4. Fragile ready detection → `#cv-ready-marker` DOM element
5. Classic margins → reduced pad/padX base values
6. Colorful (Minimal) 3→2 pages → reduced header + spacing
7. Executive margins → fixed `padding: "20px 30px"`
8. Bordered (Tech) border system → zero margins, inner padding wrapper, fixed overlay architecture
9. Bordered page 2 top spacing → CSS injection `.cv-section { padding-top: 8px }`
10. Bordered duplicate bottom border → removed `border` from TechTemplate outer div

**To continue next session:** Start by exporting the Bordered (Tech) template PDF to verify fixes #9 and #10 worked. Then move to testing Modern, Creative, Academic, and GCC templates.
