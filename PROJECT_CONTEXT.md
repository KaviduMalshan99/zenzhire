# ZenzHire — Project Context for Claude Sessions

> Last updated: 2026-06-28. Working directory: `F:\zenzhire\zenzhire\`

---

## 1. What is ZenzHire?

ZenzHire is an **AI-powered career and talent intelligence platform**. The primary user is a job seeker who wants to:

- Build a professional CV using a template-based builder
- Create AI-powered cover letters matching their CV style
- Optimize the CV to pass Applicant Tracking Systems (ATS)
- Get AI-generated feedback and improvement suggestions via Claude API

**Phase 1 (built):** Full CV builder (8 templates), Cover Letter Builder (8 templates), ATS Checker (7-layer analysis), AI Assistant (20+ actions), CV Score, Quick Fixes, Template Gallery, Dashboard.

**Phase 2 (next):** Stripe payments, Landing page, Admin panel, Production deployment.

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
| Fonts | Google Fonts (Roboto, Playfair Display, Lato, Dancing Script) |

**Ports:** Frontend on `localhost:3000`, Backend on `localhost:8000`.

**Design system:** Dark navy — `#0d1117` bg, `#161b22` surface, `#30363d` borders, `#2563eb` primary blue.

**Database:** Local PostgreSQL on port `5432` (switched from Docker port 5433).
Start command: PostgreSQL service runs via Windows Services (`postgresql-x64-18`).

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
│   │   │       └── page.tsx            # ATS checker (7-layer analysis)
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
│   │   │       └── GCCTemplate.tsx
│   │   └── ats-checker/
│   │       ├── ScoreGauge.tsx
│   │       ├── LayerCard.tsx
│   │       ├── KeywordHeatmap.tsx
│   │       ├── RecruiterCard.tsx
│   │       └── GrammarIssues.tsx
│   ├── lib/
│   │   ├── api.ts                      # Axios instance + all API calls
│   │   └── sample-cv-data.ts           # Sample CV data for template previews
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
    │   │   └── ats_result.py           # ats_results table
    │   ├── services/
    │   │   ├── ai_service.py           # Claude API — CV improve + cover letter
    │   │   ├── ats_service.py          # 7-layer ATS analysis
    │   │   └── pdf_service.py          # PDF text extraction
    │   └── schemas/
    │       ├── cv.py                   # CV Pydantic schemas
    │       ├── cover_letter.py         # Cover Letter schemas
    │       └── ats.py                  # ATS schemas
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
  layers JSONB, has_job_description,
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
  skillStyle: "classic"|"progressbar"|"dotrating"|"percentage"|"starrating"|"nameonly";
  skillColumns: 1|2|3;
}

// Default customization
export const DEFAULT_CUSTOMIZATION: CVCustomization = {
  accentColor: "#111827",
  fontFamily: "Arial",
  spacing: "normal",
  headerStyle: "centered",
  headingStyle: "fullline",
  skillStyle: "classic",
  skillColumns: 2,
};

// Per-template defaults
export const TEMPLATE_DEFAULT_CUSTOMIZATION: Record<string, Partial<CVCustomization>> = {
  classic:   { accentColor: "#111827", fontFamily: "Arial",    headerStyle: "centered",   headingStyle: "fullline" },
  modern:    { accentColor: "#2563eb", fontFamily: "Roboto",   headerStyle: "left",       headingStyle: "underline" },
  minimal:   { accentColor: "#e11d48", fontFamily: "Lato",     headerStyle: "centered",   headingStyle: "fullline" },
  executive: { accentColor: "#111827", fontFamily: "Georgia",  headerStyle: "twocolumn",  headingStyle: "fullline" },
  tech:      { accentColor: "#2563eb", fontFamily: "Arial",    headerStyle: "left",       headingStyle: "fullline" },
  creative:  { accentColor: "#7c3aed", fontFamily: "Lato",     headerStyle: "left",       headingStyle: "underline" },
  academic:  { accentColor: "#2563eb", fontFamily: "Georgia",  headerStyle: "centered",   headingStyle: "fullline" },
  gcc:       { accentColor: "#2563eb", fontFamily: "Arial",    headerStyle: "left",       headingStyle: "fullline" },
};
```

---

## 6. The 8 CV Templates

| template_id | Component | UI Name | Free/Pro | Category |
|---|---|---|---|---|
| `classic` | ClassicTemplate.tsx | Classic | **FREE** | Simple |
| `academic` | AcademicTemplate.tsx | Inline | **FREE** | Simple |
| `minimal` | MinimalTemplate.tsx | Colorful | **FREE** | Creative |
| `modern` | ModernTemplate.tsx | Modern | PRO | Modern |
| `tech` | TechTemplate.tsx | Bordered | PRO | Modern |
| `creative` | CreativeTemplate.tsx | Timeline | PRO | Creative |
| `executive` | ExecutiveTemplate.tsx | Executive | PRO | Professional |
| `gcc` | GCCTemplate.tsx | GCC | PRO | Professional |

### Template Features:

**Classic** — Clean traditional, SVG icons in contact row, supports all headerStyles, centered default

**Modern** — Two-column sidebar layout, sidebar has skills/languages/interests, main has everything else, fixed sidebar with `position:fixed` overlay in PDF for full-height color

**Colorful (Minimal)** — Bold full-width color banner header, photo in header, full-bleed in PDF (margin:0 top/left/right)

**Executive** — Formal serif, two-column header default, centered elegant layout

**Bordered (Tech)** — Border frame around entire page, drawn by `position:fixed` overlay in cv-print + `position:absolute` in CentrePanel. Puppeteer margin: `{top:"0",right:"0",bottom:"0",left:"0"}`. Section icons (◈✦◉etc)

**Timeline (Creative)** — Left accent line `8px`, `position:fixed` in PDF, `borderLeft` on outer div for preview continuity via CentrePanel isCreative flag

**Inline (Academic)** — Icon contacts row, photo right, clean divider header

**GCC** — Dark accent-color header, pill badges for nationality/DOB/gender/visa/marital/religion/NIC/license, separate light contact row below header

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
- If level is empty → shows name only regardless of style

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

Score displays below institution in all 8 templates as:
`GPA: 3.8 / 4.0` or `Z-Score: 1.2345`

---

## 9. Section Heading Styles (SectionHeading.tsx)

9 styles total (all except TechTemplate which uses its own SH function):

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
→ Injects CSS (print-color-adjust, .cv-section padding)
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
  .cv-section { padding-top: 8px !important; }
  .cv-entry   { padding-top: 4px !important; }
` });

// Template-specific margins:
// tech (Bordered): { top:"0", right:"0", bottom:"0", left:"0" }
// gcc, minimal (Colorful): { top:"0", right:"0", bottom:"8mm", left:"0" }
// modern: { top:"0", right:"8mm", bottom:"0", left:"0" }
// creative (Timeline): { top:"8mm", right:"8mm", bottom:"8mm", left:"0" }
// all others: { top:"8mm", right:"8mm", bottom:"8mm", left:"8mm" }
```

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
- FREE: Classic (Simple), Inline (Simple), Colorful (Creative)
- PRO: Modern, Bordered, Timeline, Executive, GCC

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

## 18. ATS Checker (/ats-checker)

### Input options:
- Upload PDF file (max 5MB)
- Paste CV text
- Optional: job description, target role, industry

### 7-layer analysis:
1. **ATS Compatibility** — format, fonts, structure
2. **Sections & Structure** — required sections present
3. **Keyword & Skill Matching** — vs job description or role
4. **Content Quality** — action verbs, metrics, weak phrases
5. **Language & Grammar** — errors, filler words, tense
6. **Professional Data** — contact info completeness
7. **AI Recruiter Simulation** — hiring decision simulation (PRO)

### Backend flow:
```
POST /ats/analyze (multipart/form-data)
→ PDF text extraction (pdf_service.py)
→ run_full_analysis() (ats_service.py)
→ 7 Claude API calls (one per layer)
→ Returns ATSResult with overall_score + layers JSONB
→ Saved to ats_results table
```

### Free limit: 5 ATS analyses total

### Results display:
- ScoreGauge (circular gauge 0-100)
- LayerCard for each of 7 layers
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
POST   /ats/analyze             run 7-layer analysis
GET    /ats/history             past results (last 20)
GET    /ats/{id}                get specific result
```

---

## 20. Auth System

- JWT stored in cookie named `token`
- `useAuth()` hook reads user from `/auth/me`
- `isPro` = `user.plan === "pro"`
- Pro features gated in: CustomizationPanel, RightPanel, ATSChecker, TemplatesPage

---

## 21. What's Next (Phase 2)

Priority order:

1. **Landing Page** — `/` marketing page with hero, features, pricing, testimonials
2. **Stripe Payments** — Pro plan subscription, webhook, plan update
3. **Admin Panel** — user management, stats, revenue
4. **CV Upload Parser** — upload PDF → AI extracts → fills CV sections (planned, not built)
5. **Production Deployment** — Vercel (frontend) + Railway (backend) + Supabase (DB)

---

## 22. Known Issues / Pending Work

1. **Debug screenshot** — `route.ts` saves to `C:/Users/kavidu/debug-screenshot.png` — REMOVE before production
2. **Modern template PDF** — sidebar color tested with fixed overlay approach, verify on multi-page CVs
3. **Stripe not set up** — Pro upgrade buttons go to `/pricing` (page not built yet)
4. **CV upload parser** — planned feature, not built
5. **Mobile responsiveness** — not fully tested on mobile
6. **Email verification** — not implemented in auth