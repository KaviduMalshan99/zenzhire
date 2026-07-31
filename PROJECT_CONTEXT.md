# ZenzHire — Project Context for Claude Sessions

> Last updated: 2026-07-29 (session 19 — built two new public SEO landing pages, `/features/cv-builder` and `/features/ats-checker`, resolving known issue #16 (the `/features/ats-checker` 404 that had been open since session 9). Also added `frontend/app/sitemap.ts`, which didn't exist yet either (neither did `robots.ts`), home page SEO improvements (single keyword-rich `<h1>`, a features-link section, a new FAQ section with `FAQPage` JSON-LD, and a stale "13 templates" → "14 templates" copy fix), and a `SiteHeader.tsx` nav restructure (Home, Templates, CV Builder, ATS Checker, Pricing, Career Tips — About/Contact moved out of the header, confirmed still reachable via the footer's existing Company column). See new section 37.) Working directory: `F:\zenzhire\zenzhire\`

**Session 19 (2026-07-29) — SEO landing pages (`/features/cv-builder`, `/features/ats-checker`) + site navigation restructure.** See new section 37. Headline points:
- **Two new public marketing pages built from scratch** — neither `frontend/app/features/` nor `frontend/app/sitemap.ts` existed yet (confirmed via direct filesystem search before starting). `frontend/app/features/{cv-builder,ats-checker}/{page.tsx,layout.tsx}`: each page is a Server Component (no `"use client"` needed — the FAQ accordions use native `<details>/<summary>`, no React state), with metadata/canonical/OpenGraph exported from a sibling `layout.tsx`. Both reuse `SiteHeader`/`SiteFooter` and the existing dark-navy design system verbatim (same hex tokens, same card/section patterns as `app/page.tsx`/`app/pricing/page.tsx`), cross-link to each other and to `/templates`/`/signup`, and carry `FAQPage` JSON-LD. This resolves known issue #16 (see its entry above, now marked resolved).
- **Content honesty**: every fact was pulled from real code/data before writing copy, not assumed from the (correctly flagged as possibly-stale) source guide — `lib/templates-data.ts` counted directly (14 total, 5 free: classic/academic/minimal/corporate/nova), `backend/app/api/routes/ats.py`'s `FREE_LIMIT = 5` (lifetime, not daily), `backend/app/api/routes/cv.py`'s `AI_FREE_DAILY_LIMIT = 3`, and pricing matched to `app/pricing/page.tsx`'s real LKR figures (Rs. 3,500/month, Rs. 30,000/year, Rs. 1000 7-Day Pass). The ATS page's "7-layer analysis" section names the real 7 layers read directly from `app/(dashboard)/ats-checker/page.tsx`'s `ANALYSIS_STEPS`, not invented category names.
- **`frontend/app/sitemap.ts` built fresh** (Next.js `MetadataRoute.Sitemap` convention), covering all public marketing routes including both new feature pages, reusing the existing `SITE_URL` constant from `lib/share-links.ts`. `robots.ts` still doesn't exist — out of scope for this session, not touched.
- **Home page (`app/page.tsx`)**: hero `<h1>` rewritten to be keyword-rich (`"AI CV Builder With an Honest ATS Score"`) with the previous punchy copy moved to the supporting paragraph — confirmed exactly one `<h1>` on the page, every other heading `<h2>`/`<h3>`. Added a "features" link section right after the hero (descriptive-anchor links to both new pages, guide's exact wording). Added a 3-question FAQ section (`<details>` + `FAQPage` JSON-LD) before the final CTA. Fixed two stale "13 templates" copy references (`VALUE_PROPS`, `STEPS`) to the real 14 — found incidentally while verifying counts, unrelated to the nav/SEO work itself.
- **`SiteHeader.tsx` nav restructured** to the exact 6-item order: Home, Templates, CV Builder, ATS Checker, Pricing, Career Tips. About and Contact removed from the header — both were already present in `SiteFooter.tsx`'s Company column (along with Reviews and Partner Program) before this change, so nothing became unreachable. Since desktop and mobile-hamburger both render from the same `NAV_LINKS` array, one edit updated both.
- **`SiteFooter.tsx`**: added "CV Builder" → `/features/cv-builder` to the Product column, next to the pre-existing "ATS Checker" link.
- **Verified, not assumed**: both pages read correctly at 1440px and 390px with the real `SiteHeader`/`SiteFooter`; `/features/ats-checker` confirmed no longer 404s; both pages confirmed present in the real `/sitemap.xml` output; home page confirmed single-`<h1>`; `tsc --noEmit` confirmed no new type errors introduced.

**Session 18 (2026-07-24) — Earnings admin dashboard + full doc audit.** See new section 36 for the dashboard and the sections listed above for the audit. Headline points:
- New `/admin/earnings` page (sidebar item added to the existing 6, same `require_admin`-gated pattern, same dashboard shell/styling — no new design system, no new tables). Reads exclusively from the existing `BillingTransaction`/`User` tables via 3 new endpoints (`GET /admin/earnings/stats`, `/transactions`, `/pro-members`). Four sections: Earnings Overview (total/month/today revenue + revenue-by-plan breakdown), a filterable/searchable Transactions table, a Pro Members list (sorted soonest-expiring-first, with a 7-day "Expiring soon" badge), and Counts & Reports (Pro/Free counts, conversion rate, weekly/monthly signups). Every number was cross-checked against independent raw SQL against the real local dev DB before being trusted (e.g. total revenue $2.99 from 1 success transaction, 4 active Pro members) — see section 36 for the full verification log. Auth-gating verified both ways: non-admin/no-token requests to all 3 new endpoints return 403 (same `require_admin` dependency every other `/admin/*` route already uses), and the frontend guard is inherited automatically from the existing shared `admin/layout.tsx` (no new guard code needed, since Next's nested layouts apply it to any new page under `app/admin/`).
- **Full re-audit of PROJECT_CONTEXT.md against real code/DB/git state** (same standard as the session 4/6/12 audits) — prompted by the user noticing session 17's work had gone almost entirely undocumented. Used 3 parallel research passes (cover letters, ATS+Zeni, home/mobile/small-fixes) each verifying claims against `git show` diffs **and** current HEAD file reads, not just the commit message. Found the codebase mostly matches what actually shipped, with the two exceptions called out above (cover letter template fallback, and the live-PAYable `.env` drift) — see each section for full evidence.
- Also made `it23565876@my.sliit.lk` an admin (`is_admin=true`) on the local dev DB this session, on request — unrelated to the above, noted here only because it's a real DB mutation this session made. This account already had permanent Pro status set in an earlier session (see memory) — untouched by this change.

**Session 17 (2026-07-22 late / 2026-07-23) — large undocumented "final launch updates" commit + 3 follow-ups.** Reconstructed session 18 via `git show` on 4 commits (`4e27999` "all final launch updates complete", 45 files; `fc73644` "home page link added to the header"; `d13256b` "updates of mobile view"; `0d3319b` "update center pannel to support mobile view") since none of these — except the Zeni slice already in session 16 below — had been written up. Headline points, full detail in the sections cited:
- **Cover Letter Builder** (section 12, rewritten): PDF pagination fixes (mid-paragraph/header cuts via new `HEADER_PROTECT`/`PARA_PROTECT` CSS, and a spurious blank trailing page fixed by correcting a margin/min-height overflow), a `FREE_COVER_LETTER_LIMIT = 1` AI-generation limit shared with the save-count limit, a reused `RichTextEditor` (Tiptap) "Write Manually" mode, a new `personal_details` JSONB column so manually-typed details on a no-CV letter now actually persist (previously silently discarded on reload), and first-time-user UX copy (field labels, job-description helper text, a "Write Manually" tooltip). **Correction, not confirmation**: the assumed "6 newer CV templates get an honest fallback message" fix does not exist — see section 12.
- **ATS Checker** (section 18, extended): a new `frontend/lib/ats-score.ts` single source of truth for score-band thresholds/colors/labels, now used by `ScoreGauge`/results `page.tsx`/`ResultsSidebar` (previously 3 independently-hardcoded, mutually-inconsistent band systems); an AI-Recruiter-score-leak fix (Free users could previously read the actual locked score in the top stat row, now shows a lock icon); and an honest-failure fix for the AI Recruiter layer itself (previously fabricated a fake 50%/5.0 score and leaked raw exception text on API failure, now returns a genuine `failed: true` state surfaced honestly in the UI).
- **Home page hero** (section 23.5, new): now built on a shared `TemplatePreviewFrame` component (also used by the template gallery cards) instead of a one-off mockup, with Zeni repositioned beside/next to the CV card and an ATS badge moved to the card's bottom-left corner. Plus a "Home" nav link added to the marketing header, and independent (not shared) mobile hamburger-menu fixes for both `SiteHeader.tsx` and the dashboard `Navbar.tsx`.
- **Mobile CV Builder zoom** (section 33, new): a "fit to screen" zoom percentage now computes once on mount from `window.innerWidth`, but is **not** recalculated on resize/rotation — see section 33 for why this is a real, if minor, limitation of the current implementation.
- **Small UX fixes** (section 34, new): `window.confirm()` replaced with a real `DeleteConfirmDialog` for CV/Cover Letter deletes; the Skills form's "Subskills" sub-editor was removed from the UI only (the underlying `subskills` data field is untouched, still read/written elsewhere); a `DownloadSuccessDialog` (follow-us/share/review prompts) now shows after **every** successful CV or Cover Letter PDF download, not just the first; and social/share links were centralized into `lib/social-links.ts` (env-driven follow-us links, hidden if unset) vs. `lib/share-links.ts` (hardcoded share-intent URLs, no env vars needed).
- **Production deployment** (section 35, new): backend and frontend are live on the real production server behind Nginx (`zenzhire.com` → Next.js `:3000`, `zenzhire.com/api` → FastAPI `:8000`, no separate subdomain), PAYable is confirmed live in production (`PAYABLE_ENV=live`, real credentials, real webhook URL), and a production admin account was created directly on the production DB. **Operational lesson**: local dev and production are entirely separate databases/`.env` files — nothing set up locally (accounts, admin flags, Pro status) carries over automatically. See section 35 for the full writeup, including the local-`.env`-still-live finding.

**Session 16 (2026-07-22) — Zeni CV Assistant bug-fix pass + "Polish Whole CV" feature.** See rewritten section 15 and corrected section 24.6. Headline points:
- **Three confirmed bugs fixed in the Zeni drawer (`RightPanel.tsx`):** (1) the `group_skills` AI action returned structured JSON but the response renderer treated every action identically and dumped raw `{"groups": [...]}` text into the UI — fixed with a dedicated parser that extracts the JSON even when Claude wraps it in a code fence or appends a trailing commentary note, rendering real category headings + skill chips. (2) The "uses left today" counter was tracked in a separate client-side `localStorage` counter never reconciled with the real backend `users.ai_usage_count` — could show uses as available when the server had already exhausted the limit. Fixed by deleting the local counter entirely and sourcing the displayed count from the existing `GET /auth/usage-stats` endpoint (same one the Profile page already uses), refetched after every AI call. (3) "Copy & Accept" only copied to clipboard and never actually wrote the suggestion into the CV — renamed to "Copy Suggestion" with a "Paste it into the section field" caption, matching the honest pattern Quick Fixes' Auto Fix already used.
- **New "Polish Whole CV" bulk action** — see section 15's new subsection for the full writeup. One click runs `fix_grammar`-equivalent proofreading across every filled section/entry (Profile Summary, each Experience/Education/Projects entry's description, each Skills entry's subskills), writes the corrected HTML straight back into the CV (unlike the per-section buttons, which only copy to clipboard), and shows live per-item progress. Billed as a **single flat usage credit for the whole run**, not once per section — enforced server-side via a new `POST /cv/ai/polish-cv/item` endpoint and a short-lived in-memory batch token (first call charges + mints the token; subsequent calls in the same run present it and are free), since a client can't be trusted to self-report "already charged" on a per-call-billed endpoint. Known limitation: the token store is an in-memory dict, fine for the current single-process deployment, but won't survive a restart mid-run or work correctly if the backend is ever scaled to multiple uvicorn workers — needs a DB-backed version if that happens.
- **Corrected two stale doc claims found while working in this area, unrelated to today's actual code changes:** section 15 said the Free AI limit was 5/day, `localStorage`-only — that was already fixed to 3/day server-side back in session 13 and the doc just hadn't caught up. Section 24.6 said the "Zeni" persona rename was "still planned, not built" — a direct grep of the current code shows it's fully shipped (`RightPanel.tsx` tab, the CV Builder FAB/drawer header, and the onboarding chat's `ZeniAvatar`/`zeniai.png` all say "Zeni," not "Career Mentor"). Both corrected in place rather than left stale.
- **Flagged, not resolved:** the `add_metrics`/`add_impact` AI actions can invent plausible-sounding but fabricated numbers when a bullet has no real metric to draw from (e.g. "~30%," "a team of 5") — this is an existing, intentional prompt behavior (see `ai_service.py`'s `add_metrics` prompt: *"If exact numbers are unknown, use realistic estimates"*), not a bug introduced today, but it sits in tension with this product's stated "no fabricated numbers" scoring philosophy (section 1). Left as an open post-launch product decision — see section 22 item 27.

**Session 14 (2026-07-21) — PAYable verified, Career Mentor disabled for launch, plan-limit UX fixed, password strength enforced, three new features (email, password reset, profile page) built.** See sections 24.7, 27.3, 28 (rewritten), 29, 30, 31, and 32. Headline points:
- **PAYable (section 28) went from code-complete-but-blocked to fully verified.** Session 13's `404 "Invalid authentication"` on PAYable's sandbox auth endpoint is confirmed to have been a provisioning/credential issue on PAYable's side — no code or credential change was needed here, the exact same request that failed in session 13 now succeeds. Full round-trip completed this session: checkout session creation, a real sandbox payment (Visa test card, 3-D Secure via PAYable's ACS Emulator), webhook received, and — this matters — **independently verified**: the incoming `checkValue` was recomputed locally from the raw payload using the same SHA512 formula `handle_webhook()` uses and confirmed to match byte-for-byte, not just assumed valid because no exception was thrown. `pro_until` was confirmed correctly set on the real test account afterward. **Not production-ready yet** — still running on temporary ngrok tunnels (rotate on restart) and sandbox credentials; see new 28.5 for the production checklist.
- **Career Mentor onboarding temporarily disabled for launch, not removed** — new `CAREER_MENTOR_ENABLED` flag (`frontend/lib/feature-flags.ts`, currently `false`) makes "New CV" route straight to the CV Builder editor instead of the onboarding chat. All Career Mentor code/routes/DB writes are untouched and fully functional if hit directly or if the flag is flipped back — a single-flag, fully reversible disable done deliberately to reduce launch-day risk. Plan: re-enable in ~2 weeks. See new 24.7.
- **Plan-limit UX**: every plan-limit rejection (CV creation, cover letter creation, Auto Fix, AI daily limit, and now the CV Builder's template switcher) now shows a proper `PlanLimitDialog` — built on the app's existing shared `Dialog` primitive, not a new one-off — instead of a raw `alert()`. `LeftPanel.tsx`'s template picker now also visually locks the 9 Pro templates for Free users (lock icon + dimming) with Free templates listed first, matching the gallery pages' convention, instead of letting a click round-trip to a raw backend error. **Found and fixed two previously-completely-silent failures along the way**: both cover-letter-creation entry points (dashboard quick-action, and the cover-letter list page's "New Cover Letter" button) had **zero error handling** — a Free user hitting the 1-cover-letter limit got no feedback of any kind. See new 27.3.
- **Password strength** is now enforced both client-side (live Weak/Medium/Strong meter) and server-side (min 8 chars + 3 of 4 character classes) on signup, via a single shared validator (`password_strength_error()` in `backend/app/core/security.py`) — not duplicated logic. This same validator is reused, not reimplemented, by the two new features below. See expanded section 20.
- **Three genuinely new features, none of which existed before this session**: real Gmail SMTP email sending (new section 29, used by the contact form and password reset, verified with actual delivered emails — not just "no exception was thrown"), a full forgot-password/reset-password flow with 1-hour token expiry and anti-enumeration generic responses (new section 30, verified end-to-end including expired/invalid token rejection), and an account profile page at `/dashboard/profile` with real account/subscription/usage data and in-place password change (new section 31).
- **⚠️ New section 32, high priority: real testing gap heading into launch.** A full 14-template regression test plan was designed this session but **not executed** — session time went to the email/password/profile work instead. Cover Letter and ATS Checker have had **no systematic test pass this session** either. None of this is "found broken" — it's simply not yet checked, and should be treated as a pre-launch blocker.

**Audit note (session 13, 2026-07-19):** Session 12 ended by flagging the locked Free/Pro plan as "mostly not enforced" (6 of 8 limits frontend-only or missing entirely) and Stripe/payment integration as not started. Both are now addressed:
- **Real Pro-status tracking replaces the old `plan` enum as the enforcement source of truth.** Added `users.pro_until` (nullable datetime, migration `017_add_pro_until_ai_usage`) and a `User.is_pro` property (`pro_until is not None and pro_until > now()`). `plan` (`free`/`pro`) is now just a display label kept in sync for admin-list cosmetics; every actual gate — backend and frontend — checks `is_pro`. See section 27 (rewritten) for the full per-feature breakdown, now all genuinely enforced and verified with real Free/Pro test accounts hitting the API directly.
- **PAYable Direct API integration built**: checkout session creation (`POST /billing/checkout`), webhook handler with real `checkValue` signature verification (`POST /billing/webhook`), a browser return handoff (`GET /billing/return`), and an admin manual-override endpoint (`POST /admin/users/{id}/set-pro`). New `billing_transactions` audit table (migration `018_create_billing_transactions`). See new section 28 for the full writeup, including the **critical `isPro`-everywhere fix**: several frontend pages were still deriving Pro status from `user.plan === "pro"`, which nothing in the new payment flow ever sets to `"pro"` directly (the webhook only touches `pro_until`) — without this fix, a real paying customer's UI would never have unlocked even though the backend was correctly enforcing access. Fixed in `Navbar.tsx` and three dashboard pages.
- **Payment integration is unverified end-to-end.** PAYable's sandbox Direct Auth endpoint (`POST https://sandboxipgpayment.payable.lk/ipg/auth/direct-api`) returns `404 {"status":404,"error":"Invalid authentication"}` for the `PAYABLE_BUSINESS_KEY`/`PAYABLE_BUSINESS_TOKEN` currently in `.env`, reproduced identically on two separate days with the exact same request (doc-literal format, plus two deliberate variations tried once — same result all three times). This fails at the very first auth step, before any `checkValue` signing logic runs, so it's confirmed external/credential-side, not a bug in the integration code. **Next action is a PAYable support ticket** (not further local debugging) to confirm whether sandbox Business Key/Token need manual activation on their end. See section 28.4.
- **Two unrelated pre-existing bugs found and fixed while working on the above:** `backend/app/core/config.py`'s `Settings` crashed on import (`extra_forbidden` from Pydantic) because `.env` already had `PAYABLE_*` keys with no matching Settings fields — this was silently breaking the entire backend and Alembic, not just this session's new code. And `frontend/tsconfig.json` had `"target": "es5"` with `"ignoreDeprecations": "6.0"` (invalid for the installed TypeScript 5.9, which only recognizes `"5.0"`) — the invalid value meant `tsc --noEmit` couldn't even start, so no one had actually type-checked this frontend in a working state. Both fixed; see section 22 items 22-23.

**Audit note (session 12, 2026-07-19):** Full re-audit of this file against actual codebase state (git history, direct file reads, alembic state), not just appending from conversation memory — same standard as the session 4/6 audits below. Corrections and additions:
- **Section 25 (Admin Dashboard) was significantly incomplete, not just stale.** The commit that shipped it (`e7053aa`) actually added a full multi-page `/admin/` section — `admin/layout.tsx` (sidebar nav + auth guard), `admin/dashboard`, `admin/users`, `admin/reviews`, `admin/contact`, `admin/career-tips`, `admin/admins` — plus a `GET /admin/notifications` endpoint driving sidebar badge dots, an Admins CRUD page (create admin / one-time password reset), and a full Career Tips CMS. The doc only described 4 read-only sections from an earlier, simpler iteration. Rewritten from scratch below against the real code.
- **Career Tips is a real, undocumented feature** — public `/career-tips` + `/career-tips/[id]` pages, a `career_tips` table, public read-only API, and an admin publish/delete CMS with a Tiptap rich-text editor for the caption. Never had a section. Added (23.2 table + new 25.4).
- **Google Sign-In shipped, entirely undocumented** — real server-side OAuth Authorization Code flow (hand-rolled with `httpx`, no `authlib`/`google-auth` library). New section 26. Found one real security-relevant behavior worth flagging: it silently links a Google login to any pre-existing email/password account sharing that email, with no re-authentication step — see section 26 and section 22 item 18.
- **"Zeni" is not actually the live product name — "Career Mentor" is.** The locked feature plan (Pricing page, section 28) refers to "Career Mentor (Zeni)," but a grep of every user-facing string in the onboarding chat, the `RightPanel` tab, and the CV Builder FAB confirms all of them still say **"Career Mentor"** — "Zeni" only appears as a mascot image (`zeniai.png`) on the `/about` marketing page and in the Pricing page's copy. The persona unification flagged as "planned, not yet built" in section 24.5 is confirmed still not built — corrected in a new 24.6.
- **The locked Free/Pro feature plan (this session's source-of-truth request) is mostly *not* enforced server-side.** Of the 8 gated features, only the ATS Checker's 5-lifetime-check limit has a real backend check. CVs and Cover Letters have **no cap at all**, anywhere. Templates, the AI usage limit, and Auto Fix are frontend-only (directly callable/bypassable via the API). CV Score sub-scores and Job Match Score aren't backend features at all — pure client-side JS. Full table in new section 28; this is now flagged as the single biggest blocker before Stripe integration, ahead of just "wiring payment processing."
- **Found a real numeric mismatch while auditing enforcement**: the Pricing page states the free AI-help limit as "3 uses/day" (this session's locked plan), but the actual code (`RightPanel.tsx`'s `AI_FREE_LIMIT`) enforces **5**/day, client-side only, via `localStorage`. Neither number is backend-enforced. Flagged in section 22 item 19.
- Confirmed the 14-template Free/Pro split (section 6, section 13) is already accurate and consistent across `frontend/lib/templates-data.ts` and the backend `TemplateId` enum — no drift found here, unlike the sections above.
- Confirmed `alembic current == alembic heads == 016_add_google_oauth_users` — single head, no migration drift, chain is linear from `012` through `016`.
- Re-confirmed several previously-logged known issues are still open with no changes (items 9, 11, 14, 16 in section 22) — see that section for the direct re-checks.

**Session 13 — Real Free/Pro enforcement + PAYable payment integration.** See rewritten section 27 (enforcement) and new section 28 (PAYable). Headline points:
- All 8 locked Free/Pro feature limits from section 27's original audit now have real server-side enforcement, driven by a new `pro_until`-based `is_pro` check rather than the old `plan` enum: CVs and Cover Letters capped at 1 for Free, CV templates restricted to the 5 Free ones, Zeni AI assist capped at 3/day (server-tracked, not `localStorage`), Auto Fix and Job Match Score Pro-gated server-side, CV Score sub-scores withheld from the API response itself for Free users (not just hidden client-side), and ATS Checker's existing 5-lifetime limit switched onto the same `is_pro` check. All 8 verified with real Free/Pro test accounts calling the API directly, not just clicking through the UI.
- Built the PAYable Direct API payment integration end-to-end: checkout session creation with server-computed pricing and SHA512 `checkValue` signing, a webhook handler that verifies its own `checkValue` before trusting any payload and extends (not resets) `pro_until` on repeat purchases, and an admin manual-override endpoint for support cases. Frontend: a billing-details modal (phone/address, required by PAYable's standard checkout mode), Pricing page wiring, and a post-payment return page.
- PAYable's sandbox auth is currently rejecting our credentials (404), so the actual "redirect to PAYable, pay, webhook fires, `pro_until` updates" loop has not been exercised end-to-end yet — everything up to that external call is built and internally verified (checkout session creation logic, checkValue formulas, webhook signature verification, idempotency) but the live round-trip is blocked pending PAYable support. See section 28.4.

**Session 12 — Google Sign-In, Career Tips title field, template-gallery polish, locked Free/Pro plan finalized.** See new sections 26 (Google Sign-In) and 28 (locked feature plan + enforcement audit). Headline points:
- **Google Sign-In**: real server-side OAuth Authorization Code flow — `GET /auth/google/login` redirects to Google, `GET /auth/google/callback` exchanges the code server-to-server via `httpx` (new dependency), mints ZenzHire's own JWT, and redirects to `/auth/callback#token=...` on the frontend, which stores it the same way the existing email/password flow does. `users.hashed_password` is now nullable (`016_add_google_oauth_to_users.py`), plus new `google_id`/`auth_provider` columns. See section 26 for the account-linking behavior, which is worth a careful read before this goes to production.
- **Career Tips**: added a `title` column (`015_add_title_to_career_tips.py`) to the `career_tips` table shipped in session 11's commit — see the audit note above and new section 25.4 for the full feature (it was never documented despite already existing).
- **Marketing template gallery polish** (`TemplateGalleryCard.tsx`): badges moved from a floating overlay into their own strip above the preview (was at risk of overlapping template content that starts at the very top of the page); preview container switched from a fixed `height: 280` to a real `aspectRatio: "794 / 1122"` lock so the full A4 page is always visible uncropped at any card width; the Pro-lock overlay was lightened from a heavy blur+centered-lock-icon scrim to a subtle tint + small corner lock badge + bottom "Upgrade to Pro" pill, so the actual template design stays visible/sellable through the gate.
- New `frontend/lib/sample-cv-data-sidebar-supplement.ts`: gallery-preview-only extra content (skills/language/certificate/interest entries) merged in **only** for the 6 two-column "sidebar" templates (Modern, Corporate, Portrait, Milestone, Vega, Aurora) when rendering `/cv-template-preview/[templateId]` — those templates looked sparser than single-column ones at the same base `SAMPLE_CV_DATA` volume because a second column needs more content to look full. `SAMPLE_CV_DATA` itself is untouched, so this provably doesn't affect the CV Builder or any other template.
- `AuroraTemplate.tsx`: `AURORA_PHOTO_SIZE` bumped `125 → 145` (visual sizing tweak only, no layout logic changed).
- **Pricing page (`app/pricing/page.tsx`) rewritten to match the newly locked Free/Pro feature plan exactly** — see section 27 for the full plan and, critically, which parts of it are and aren't actually enforced by the backend today (this cross-reference originally said "section 28" — corrected session 13, since section 28 now exists and is the unrelated PAYable integration writeup).

**Session 11 — Admin dashboard (`/admin/dashboard`).** See new section 25 for the full writeup (rewritten session 12 — the summary below undersold what actually shipped). Headline points:
- Added `users.is_admin` (boolean, default `false`) via migration `012_add_is_admin_to_users.py` — no parallel auth system; a new `require_admin` dependency (mirrors the existing `require_pro` pattern) gates every `/admin/*` route, and the frontend page does its own client-side `useAuth()` check (redirects logged-out → `/login`, non-admin → `/dashboard`) before rendering anything or firing any admin API call.
- One seeded admin account (`admin@zenzhireadminit.com`) created through the real `POST /auth/signup` endpoint (proper bcrypt hashing, no plaintext check anywhere), then `is_admin` flipped to `true` via a one-off DB script — not a new signup path.
- Dashboard covers exactly 4 read-mostly sections, reusing existing tables — no new systems: overview stats (users/CVs/cover letters/CVs-per-template), reviews moderation (list pending + one new `POST /admin/reviews/{id}/approve` endpoint — this is what session 9's `/reviews` writeup flagged as a manual-DB-query gap, see section 23.3), contact submissions (first viewer ever built for `contact_submissions`), and a basic read-only user list. Editing/deleting users, revenue, and settings were explicitly out of scope this pass.
- Verified end-to-end with Playwright: logged in as the seeded admin and confirmed all 4 sections render real data; logged in as a normal user and confirmed `/admin/dashboard` redirects to `/dashboard` without any admin content ever reaching the page; hit `/admin/dashboard` logged out and confirmed redirect to `/login`; approved a pending review through the new UI button and confirmed it then appeared on the public `/reviews` page (same check session 9 did manually), then reverted that one test review back to `approved=false` afterward to leave the dev DB clean, matching session 9's own convention.

**Session 10 — Career Mentor redesign (Sprint 1 + Sprint 2 only; broader "Career Brain" ideas deliberately deferred).** See new section 24 for the full writeup. Headline points:
- Real Pro-tier user testing found the fixed right AI panel in the CV Builder confusing — this drove a UX redesign, scoped deliberately to two sprints. Bigger architecture ideas discussed during planning (Context Manager, Writing Coach, Live ATS, Career Memory, AI Router, a future Job Platform) were **not built**, and are logged as a post-launch roadmap note instead — reasoning: "a Brain with no users is just architecture."
- Sprint 1: the CV Builder's desktop layout went from 3 columns (`LeftPanel | CentrePanel | RightPanel`) to 2 (`LeftPanel | CentrePanel`), with `RightPanel` (all its existing AI Assistant/CV Score/Quick Fixes functionality, unchanged) relocated into a floating sparkle FAB → slide-in drawer, on both desktop and mobile.
- Sprint 2: new `/cv-builder/onboarding` chat-style flow (backend `app/services/career_mentor.py` step engine + `POST /career-mentor/start` / `/answer`) that conversationally fills the CV's "core 5" sections (Personal Details, Summary, Experience-or-Projects, Education, Skills) by reusing existing `cv.create_cv`/`add_section`/`update_section` and `ai_service.py` functions — no new AI logic, no new CV data model. `/dashboard/templates` now routes into this flow instead of creating a CV directly.

**Session 9 — Marketing site built out (Home, Templates, Pricing, About, Contact, Partners, Privacy, Terms, Reviews).** See section 23 for the full writeup. Headline points:
- `/templates` is now a **public, unauthenticated marketing page** (`app/templates/page.tsx`) — the authenticated template *picker* used inside the app moved to `/dashboard/templates` (`app/(dashboard)/dashboard/templates/page.tsx`). These are two different pages at two different URLs now; don't conflate them (see section 13's rewrite).
- New shared `components/marketing/SiteHeader.tsx` / `SiteFooter.tsx`, reused across every public page (`/`, `/templates`, `/pricing`, `/about`, `/contact`, `/partners`, `/privacy`, `/terms`, `/reviews`). `SiteFooter` is the single source of truth for footer nav — editing it updates every public page at once.
- Two new backend tables + Alembic migrations: `contact_submissions` (`010_create_contact_submissions.py`) and `reviews` (`011_create_reviews.py`, with an `approved` boolean gate — public submissions are invisible until manually flipped to `true` in the DB; no admin UI for this yet, by design). Confirmed `alembic current == alembic heads == 011_create_reviews`.
- **Known gap:** `/features/ats-checker` is linked from both the Home page and the new footer's Product column, but that route doesn't exist yet (404). Not built this session — flagged in section 22.

**Session 8 — Nova (14th template) added.** Simplest structural type (single column, no sidebar — same category as Classic/Academic/Executive/GCC). Full frontend+backend registration, its own Alembic migration (`009_add_nova_template_id.py`, applied and confirmed — `alembic current == alembic heads == 009_add_nova`), and shared-pagination-engine support built in from the start. Two things worth remembering:
- **New per-page "chrome" category: a horizontal per-page footer bar, not a vertical band/frame/line.** Every prior "paint one absolutely-positioned copy per real page" case (Modern's sidebar band, Tech's border frame, Creative's accent line, Aurora's band) was either full-height or full-border. Nova's footer bar is the first *bottom-edge-only* case (`bottom:0, height:14px` within each page-card / each `PAGE_HEIGHT_A4` multiple) — same underlying technique (hide the template's own single trailing copy inside paginated contexts via a `.cv-page-card .nova-outer [data-nova-footer] { display:none }` rule, paint one copy per real page in both `CentrePanel.tsx` and `generate-pdf/route.ts`), just anchored to the bottom instead of spanning top-to-bottom. Confirmed repeating correctly on every page of a real 2-page PDF (not just page count matching — the footer bar itself was visually confirmed at the bottom of both page 1 and page 2).
- **Optional photo in a flex-row header needs no conditional layout, just a conditional render.** Nova's header is `flex` with the name/title block at `flex:1` and the photo (if any) as the second child — when there's no photo, the single remaining flex child naturally takes the full row width, so "no empty box or gap" required no extra CSS, only `{hasPhoto && <img .../>}`.

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

**Phase 1 (built):** Full CV builder (14 templates), Cover Letter Builder (8 templates), ATS Checker (7-layer analysis, rebuilt for accuracy), AI Assistant (20+ actions), CV Score, Quick Fixes, Template Gallery, Dashboard, ATS Diagnosis & "CV Rebuild Preview" feature.

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
│   │   │       ├── AuroraTemplate.tsx    # "Aurora" in UI, two-tone sidebar + photo straddle + 2-col body, References in main col (PRO)
│   │   │       └── NovaTemplate.tsx      # "Nova" in UI, flex-row header w/ optional photo + gray contact bar + single column + solid footer bar (FREE)
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
  nova:       { accentColor: "#111827", fontFamily: "Arial",    headerStyle: "left",       headingStyle: "fullline", skillStyle: "chips" },
};
```

⚠️ `TEMPLATE_DEFAULT_CUSTOMIZATION` now sets `skillStyle` explicitly for every template except `modern` (previously none of classic/minimal/executive/tech/creative/academic/gcc had a `skillStyle` override, and all silently inherited whatever `DEFAULT_CUSTOMIZATION.skillStyle` was). Now that the global default changed to `"chips"`, those seven were given an explicit `skillStyle: "chips"` entry so their look doesn't silently shift if the global default changes again — `modern` is the one remaining template still relying on the global default falling through.

---

## 6. The 14 CV Templates

| template_id | Component | UI Name | Free/Pro | Category |
|---|---|---|---|---|
| `classic` | ClassicTemplate.tsx | Classic | **FREE** | Simple |
| `academic` | AcademicTemplate.tsx | Inline | **FREE** | Simple |
| `minimal` | MinimalTemplate.tsx | Colorful | **FREE** | Creative |
| `corporate` | CorporateTemplate.tsx | Halo | **FREE** | Professional |
| `nova` | NovaTemplate.tsx | Nova | **FREE** | Simple |
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
→ Branches on templateId: all 14 templates now run the shared pagination
  engine (10.1/10.2) — the legacy pipeline branch (10.3) still exists in
  the code as an `else` fallback but is unreachable dead code for every
  current template; it only matters again if a future 15th template is
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

### 10.2 Templates Migrated to Shared Pagination Engine (14 of 14 — migration complete)

Confirmed directly against `generate-pdf/route.ts`'s shared-pipeline branch condition (not assumed) — all 14 template IDs are present in a single `if` check:
```typescript
if (templateId === "classic" || templateId === "academic" || templateId === "modern" ||
    templateId === "minimal" || templateId === "executive" || templateId === "tech" ||
    templateId === "creative" || templateId === "gcc" || templateId === "portrait" ||
    templateId === "milestone" || templateId === "corporate" || templateId === "vega" ||
    templateId === "aurora" || templateId === "nova") {
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
| `aurora` | ✅ Migrated (built in from the start, not retrofitted) |
| `nova` | ✅ Migrated (built in from the start, not retrofitted) |

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

**Aurora** (2026-07-06) — migrated, built with the shared engine and all of section 10.4's lessons from the start rather than retrofitted afterward. Sidebar LEFT ~31% (same orientation as Portrait/Milestone), reuses the same generic `AURORA_SIDEBAR_TYPES` selector-in-`calcPageLayout()` mechanism as every other two-column template — no per-template measurement code written. Two things distinguish it from Portrait/Milestone/Corporate/Vega:
- Its sidebar carries an actual **colored background** (a gray zone behind the photo, transitioning to `accentColor`), not just a hairline divider — the same category of print-fragmentation/clip-window problem Modern's sidebar band solves, so `CentrePanel.tsx`/`generate-pdf/route.ts` paint one authoritative per-real-page rectangle (two-tone on page 0 only, solid `accentColor` on every later page) instead of trusting the template's own continuous-flow CSS gradient.
- **Deliberately does not cap that band at `sidebarBottom`** (lesson 5(d) in 10.4) — References was moved into the main column (see section 6), so there's no full-width section left below the two-column body to bleed into. The band instead fills the full page height on every page, including the last, matching Modern/Tech/Creative's convention. This was an explicit, requested change (not an oversight) after the initial build shipped with the sidebarBottom cap by default, matching every prior two-column template — worth remembering that the cap is conditional on *actually having* a trailing full-width section, not an unconditional rule for every two-column template.

**Nova** (2026-07-06) — migrated, built with the shared engine from the start. Simplest of all 14 templates structurally: single column, no sidebar (same category as Classic/Academic/Executive/GCC), so it needed no per-page sidebar-overlay work — only the standard `.cv-heading-group` wrapping (applied to all 8 of its multi-entry sections: Experience, Education, Projects, Certificates, Awards, Courses, Publications, Organizations) plus one new kind of per-page chrome: a solid, `accentColor`-derived footer bar pinned to the bottom edge of every page (`data-nova-footer` in the template, suppressed inside `.cv-page-card`/PDF contexts in favor of one absolutely-positioned `bottom:0, height:14px` copy per real page in both `CentrePanel.tsx` and `generate-pdf/route.ts` — see `NOVA_FOOTER_HEIGHT`). Verified predicted page count (live-preview badge) matched the real exported PDF's page count exactly on both a normal 1-page fixture and a stress-test fixture (5 experience entries + projects/certs/awards) that produced 2 pages, and confirmed via a real, non-headless browser that the footer bar is visible at the bottom of **both** pages of the 2-page PDF (not just page 1). Header is a flex row (name/title left, optional photo right) — verified in the real app with a photo (circular crop, right-aligned, vertically centered) and without one (full-width block, no gap).

### 10.3 Legacy Pipeline — now unused, kept only as a fallback

The pre-2026-07-04 approach (`.cv-section` **and** `.cv-entry` both getting a blanket `page-break-inside:avoid`, so a section that doesn't fit gets pushed wholesale to the next page instead of splitting between entries) still exists as the `else` branch in `generate-pdf/route.ts`, but **no current template runs through it** — all 14 are in the shared-pipeline `if` condition (see 10.2). This branch is only relevant again if a future 15th template is added to the codebase without immediately being migrated onto the shared engine. Do not treat its continued existence in the file as evidence any current template still uses it — check the `if` condition directly, as this section 10.2 audit did.

### 10.4 Consolidated Pagination Lessons (reference for any future 15th template)

Everything learned migrating all 13 templates onto the shared engine, in one place, so this doesn't need to be re-explained or re-derived from scratch:

1. **Single source of truth:** `extractPageChunks()` + `computePageBreaks()` in `lib/pagination.ts` are used **identically** by `CentrePanel.tsx` (live preview, via `calcPageLayout()`) and `generate-pdf/route.ts` (PDF export, via a `page.evaluate()` mirror of the DOM-reading step + a direct Node import of the pure decision function). Same inputs, same outputs, always — the preview and the PDF cannot independently disagree on where a page break falls. Never add a template-specific chunk-walking or break-decision copy; add the new template's markup/selectors to the existing generic functions instead (this is exactly how Corporate and Vega were done, reusing Portrait/Milestone's infrastructure).

2. **`.cv-heading-group` wrapper pattern:** for any section with multiple stacked entries, wrap `[heading, first entry]` together in `<div className="cv-heading-group" style={{breakInside:"avoid", pageBreakInside:"avoid"}}>`, then map the remaining entries normally afterward. This is what stops a heading from being orphaned alone at the bottom of a page. Every migrated template's multi-entry sections (Experience, Projects, Courses, Awards, Organizations, Publications, and the equivalent sidebar sections) follow this shape.

3. **`CONTINUATION_TOP_GAP` gap-accounting (resolved):** the 40px breathing-room every continuation page gets (mirroring the live preview's page-2+ clip/offset trick) must be *reserved during the break decision itself* (`computePageBreaks()`'s own `pageBottom` math), not injected as a `margin-top` afterward and hoped to still fit. Getting this backwards was the root cause of a real, previously-open bug (content silently overflowing onto an unplanned extra page) — see the resolved note above.

4. **Per-page `position:fixed`-style chrome (Modern's sidebar band, Tech's border frame, Creative's accent line):** Puppeteer does not reliably repeat `position:fixed` elements per printed page, and Chromium's print-fragmentation for flex/grid containers is unreliable. The fix pattern every one of these used: hide the template's own single continuous-flow version of the visual element inside paginated contexts, and instead paint one explicit `position:absolute` copy per *real* page, sized to exactly `PAGE_HEIGHT_A4` and positioned at exact multiples of it — derived directly from `computePageBreaks()`'s own page count/`starts[]` output in both `CentrePanel.tsx` and `generate-pdf/route.ts`, never from CSS alone.

5. **Two-column `SIDEBAR_TYPES` templates (Portrait, Milestone, Corporate, Vega, Aurora) — 4 lessons, established during Portrait/Milestone and reused (with one deliberate exception) for Corporate/Vega/Aurora:**
   - **(a)** Sidebar sections must carry `.cv-entry`/`.cv-heading-group` but **never** `.cv-section` — `extractPageChunks()` only walks `.cv-section`, so the main column alone drives page-break decisions; a sidebar with `.cv-section` would corrupt that DOM-order chunk list with an independent column's heights.
   - **(b)** Any per-page sidebar divider/border/band must measure the sidebar's *actual* top offset (`sidebarEl.getBoundingClientRect().top`) for page 1, not assume `y=0` — templates have header zones of very different heights above the two-column body (photo header, plain name/title, colored band, etc.), so this must be measured, never hardcoded per template.
   - **(c)** The sidebar "straddle check" (does a sidebar entry get cut across the page-card boundary in the live preview?) must compare against the TRUE physical page edge (`mainStarts[i-1] + pageHeight - CONTINUATION_TOP_GAP`) as both the check reference and the fallback — not wherever the main column happens to stop, which is often earlier than the real edge.
   - **(d)** Any sidebar overlay/divider **that has a trailing full-width section to protect** must be capped at `sidebarBottom` (the sidebar box's own measured bottom — `align-items:stretch` keeps this in sync with whichever column, main or sidebar, is taller) so it never bleeds into that section (e.g. References) once the sidebar itself has run out of content on an earlier page. **Always verify this specific case with a stress-test fixture** (a long main column that pushes the trailing section to a mid-page position on the same page-card as the tail end of the sidebar's blank space) — this was the one failure mode not caught by simple page-count checks alone, in both the live preview and the real PDF. **This is conditional, not universal** — Aurora moved References into the main column and has no trailing full-width section left, so its band deliberately fills the full page height on every page instead (see its entry in 10.2). Check whether a template actually has something below the two-column body before assuming the cap applies.
   - Implementation-wise: (b)/(c) are handled by the existing generic `calcPageLayout()`/`computeSidebarPageStart()` in `CentrePanel.tsx` — adding a new template's sidebar selector (e.g. `.vega-sidebar`, `.aurora-sidebar`) to the existing `querySelector` list is enough; there is no per-template measurement code to write.

6. **`mergeCustomization()`:** both `CentrePanel.tsx` (data load) and `cv-print/[cvId]/page.tsx` always merge saved `customization` with `DEFAULT_CUSTOMIZATION` through this shared helper before rendering, so an empty/partial/null customization object can't resolve differently between the preview and the PDF. Backend has defense-in-depth too (`_merge_customization()` in `cv.py`).

7. **A colored (non-white) sidebar/section background is not just a pagination concern — it breaks shared components that assume white** (learned building Aurora, 2026-07-06): `SectionHeading.tsx` draws its "pop" color in `accentColor`, and `SkillEntry.tsx` hardcodes `#111827`, both assuming a white background sits behind the text. On a background that IS `accentColor` (or any non-white fill), this can mean **fully invisible headings** (identical text/background color), not just poor contrast. Any future template with a colored sidebar/section needs: its own heading renderer for that colored area (see Aurora's `SidebarHeading`, scoped only to the colored region — other areas keep using `SectionHeading` normally), and to bypass `SkillEntry` for a plain bullet+name skills list at a color that actually contrasts. Establish the actual color scheme (e.g. Aurora's bold-white-title / 92%-white-body / 68%-white-meta three-tier hierarchy) and confirm it against a screenshot before considering the template done — don't assume a component "just works" against a non-white background.

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
- `calcPageLayout()` delegates directly to `lib/pagination.ts`'s `extractPageChunks()` + `computePageBreaks()` for **all 14 templates uniformly** — the exact same functions `generate-pdf/route.ts` uses, so the two can't independently disagree on break points. This has always been true of the live preview regardless of a template's PDF-pipeline migration status (the "migrated vs. legacy" distinction in section 10.2/10.3 only ever applied to `generate-pdf/route.ts`'s branching, never to `CentrePanel.tsx`) — there is no separate bespoke chunk-walk left in this file.
- For Portrait/Milestone/Corporate/Vega/Aurora (the five two-column `SIDEBAR_TYPES` templates): `calcPageLayout()` additionally computes independent `sidebarStarts`/`bodyTop`/`sidebarBottom` values (via `extractSidebarChunks()` + `computeSidebarPageStart()`) so the sidebar column can be re-rendered as its own clipped, independently-offset overlay per page-card — see section 10.4, lesson 5. Aurora computes the same values as the other four but doesn't use `sidebarBottom` to cap its colored band (see its 10.2 entry) — only for the sidebar text overlay's own clipping.
- For Bordered (Tech): `position:absolute` border overlay on each page card
- For Timeline (Creative): `borderLeft` on outer scaled column div (isCreative flag)
- For Modern: one `position:absolute` sidebar-color band per page card, sized/positioned from `computePageBreaks()`'s own `starts[]` output (isModern flag) — replaced the old single whole-column CSS gradient, which had no per-page boundary awareness

---

## 12. Cover Letter Builder

⚠️ **Rewritten session 18 (2026-07-24)** to add session 17's fixes (PDF pagination, AI limits, manual rich-text mode, no-CV persistence, UX copy), verified via `git show 4e27999` + direct reads of current HEAD, not just the commit summary.

### 8 Templates (matching CV templates):
classic, modern, colorful, executive, bordered, creative(timeline), inline, gcc

### Features:
- AI generation from CV data + job description
- 3 tones: formal / friendly / confident
- Pan+zoom photo crop editor (same as CV)
- Auto-match CV template when CV is linked
- **Manual rich-text writing mode** (NEW, session 17) — see 12.4
- Edit/Preview toggle
- PDF export, with real pagination handling (NEW, session 17) — see 12.1

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

### CV template → CL template mapping — ⚠️ still only covers the original 8 CV templates
```
classic→classic, modern→modern, minimal→colorful,
executive→executive, tech→bordered, creative→creative,
academic→inline, gcc→gcc
```
`CV_TO_CL_TEMPLATE` (`cover-letter/[id]/page.tsx`) is **unchanged by session 17** — confirmed no diff hunk touches it. For any of the 6 newer CV templates (Portrait, Milestone, Corporate, Vega, Aurora, Nova — none of which have a Cover Letter equivalent), the lookup falls through to `?? "classic"` and the UI shows a toast reading `"Template auto-matched to classic from your CV"` — worded exactly like a real, successful match, not a warning. **This was assumed fixed going into the session-18 audit (an "honest fallback message" instead of a silent Classic substitution) — it is not.** See section 22's new item for tracking. What session 17 *did* add is a different, narrower fallback in `CoverLetterPreview.tsx`'s own render `switch` (guards a stale/invalid `templateId` string already in the DB by rendering Classic instead of a blank page) — this only protects against corrupted data, since `CV_TO_CL_TEMPLATE` can never actually produce an unrecognized id in the first place.

### Cover Letter PDF:
```
POST /api/generate-cl-pdf { content, templateId, customization, jobTitle, company, letter, personal }
→ Puppeteer renders HTML with template styles
→ Returns PDF download
```

### 12.1 PDF pagination fixes (session 17, 2026-07-22/23)

Two real bugs fixed in `frontend/app/api/generate-cl-pdf/route.ts`, mirrored in `CoverLetterPreview.tsx` for in-app visual parity (the preview itself never paginates, it's single-page):

1. **Mid-paragraph / mid-header page cuts.** New shared style strings applied across all 8 templates' `buildHtml()` output:
   ```
   HEADER_PROTECT = "page-break-inside:avoid;break-inside:avoid;page-break-after:avoid;break-after:avoid"
   PARA_PROTECT   = "page-break-inside:avoid;break-inside:avoid"
   ```
   `HEADER_PROTECT` wraps each template's whole header block (name/photo/contact/"Re:" line) as one non-breakable unit; `PARA_PROTECT` is applied per-`<p>` in `paragraphs()` so Chrome's print engine can no longer split a paragraph or a header across a page boundary.
2. **Spurious blank trailing page.** Previously `page.pdf({ margin: { bottom: "8mm", ... } })` combined with template body wrappers using `min-height: 297mm` meant content height + bottom margin exceeded the physical A4 page box, overflowing a thin blank sliver onto page 2. Fixed: `margin.bottom` changed to `"0"`, and body wrappers' `min-height` changed to `calc(297mm - 2mm)` so content fits inside one page exactly.
3. **Rich-text HTML rendering.** A shared `isHtmlContent()` helper (present in both `route.ts` and `CoverLetterPreview.tsx`) detects whether `content` is Tiptap-authored HTML (see 12.4) vs. plain AI-generated text, and renders it through a dedicated `.cl-html-body` wrapper (with `PARA_PROTECT` applied to its `p`/`li` children) instead of naively splitting on `\n`, which would otherwise mangle real HTML markup.

### 12.2 AI generation limit (session 17)

`backend/app/api/routes/cover_letter.py`: `FREE_COVER_LETTER_LIMIT = 1`, enforced (all gated by `not current_user.is_pro`) in three places:
- `ai_generate_cover_letter` (`POST /cover-letter/ai/generate`) — counts letters with non-empty `content`, blocks at 1 with a 403 explaining the upgrade.
- `create_cover_letter` — counts **all** letters (not just AI-generated ones), same 1-letter cap.
- `duplicate_cover_letter` — same check before allowing a duplicate.

So Free is capped at 1 letter total, shared between "AI generation" and "saved letter" — not two separate counters — and Pro bypasses all three via `is_pro`. This is a flat lifetime cap, unlike the CV builder's unrelated *daily* AI limit (`AI_FREE_DAILY_LIMIT = 3`, section 15). Frontend: `cover-letter/[id]/page.tsx`'s `handleGenerate()` now catches a 403 and shows the backend's real message via `PlanLimitDialog` instead of a generic `alert()`.

### 12.3 Duplicate & Delete — silent-failure fixes (session 17)

Both `cv-builder/page.tsx` and `cover-letter/page.tsx` had a `try { await api.post(...) } finally { ... }` with **no `catch`** on their Duplicate action — a failed duplicate (e.g. hitting the Free-tier limit) threw an unhandled promise rejection with zero user feedback beyond the loading spinner clearing. Both now `catch` the error and show it via `PlanLimitDialog` (using the backend's real `detail` message, e.g. the 12.2 limit text, with a generic fallback otherwise).

Same two pages also replaced a blocking `window.confirm()` on Delete with a real modal — new `frontend/components/shared/DeleteConfirmDialog.tsx` (see section 34.1).

### 12.4 Manual rich-text writing mode (session 17)

The editor's Edit/Preview toggle was relabeled "Write Manually" / "← Preview" (with a `title` tooltip: *"Skip AI and write your own letter instead"*), and its plain `<textarea>` was replaced with the **pre-existing** `RichTextEditor` (Tiptap — already used for CV bullet/summary editing, not newly built) plus an explicit "Save cover letter" button (previously only saved `onBlur`). `content` remains a single shared string: generating via AI overwrites it with plain text; switching to "Write Manually" and editing turns it into Tiptap HTML from that point on. There's no explicit merge logic — whichever form of `content` is currently in state is what gets saved/rendered, with `isHtmlContent()` (12.1) branching the preview/PDF rendering accordingly, and DOMPurify sanitizing before `dangerouslySetInnerHTML` client-side (SSR fallback strips tags entirely, same pattern as `HtmlContent.tsx` elsewhere in the app — section 6's rendering-gotcha callout).

### 12.5 No-CV personal-details persistence (session 17)

New `cover_letters.personal_details` JSONB column (`nullable=False, server_default="{}"`, migration `020_add_personal_details_to_cover_letters.py`, confirmed `alembic current == alembic heads == 020_add_personal_details`), added to the `CoverLetter` model and to `CoverLetterUpdate`/`CoverLetterRead` schemas, and copied through by `duplicate_cover_letter`.

**Before:** a cover letter with no linked CV had nowhere server-side to store manually-typed name/email/phone/etc. — the "Your Details" fields only ever lived in local React state and were silently discarded on navigation/reload, with no error or indication anything was lost. **After:** `cover-letter/[id]/page.tsx` still auto-extracts personal details live from the linked CV when one exists (unchanged, CV remains the source of truth in that case); when there's no linked CV, it now falls back to loading the persisted `personal_details` blob on open, and every save now includes `personal_details` in the update payload.

### 12.6 First-time-user UX clarity (session 17)

All in `cover-letter/[id]/page.tsx`: the 5 manual "Your Details" inputs gained explicit `<label>`s (previously placeholder-only) and example-style placeholders (`"e.g. John Smith"`); a one-line helper sentence was added above the Job Description textarea (*"Paste the job posting details here — we'll use this to tailor your cover letter."*); and the "Write Manually" toggle gained both a hover tooltip and a standing hint line below the Generate button pointing users to it.

---

## 13. Template Gallery — now TWO separate pages (split in session 9)

⚠️ **`/templates` no longer means "the template picker."** As of session 9 there are two distinct pages that both show the 14 templates, at two different URLs, for two different audiences:

| Route | File | Audience | Purpose |
|---|---|---|---|
| `/templates` | `app/templates/page.tsx` | Public, unauthenticated | Marketing gallery — browse all 14 templates, category filter, Free/Pro counts. "Use Template" (free) / clicking a Pro card both route to **`/signup`** (there's no logged-in state here to attach a CV to). Uses `SiteHeader`/`SiteFooter`. |
| `/dashboard/templates` | `app/(dashboard)/dashboard/templates/page.tsx` | Authenticated app users | The real template **picker** — used when starting a new CV. Pro click → `ProUpgradeModal` → `/pricing`. Lives inside the dashboard shell/navbar, not the marketing `SiteHeader`/`SiteFooter`. |

The old single authenticated page at `(dashboard)/templates/page.tsx` was **moved**, not duplicated — it now lives at `(dashboard)/dashboard/templates/page.tsx`. `CV Builder list page → "New CV"` and the dashboard's own template-picker links were updated to `router.push("/dashboard/templates")` accordingly (confirmed via grep — both `cv-builder/page.tsx` and `dashboard/page.tsx` point at the new path).

⚠️ **Corrected session 12** — the doc previously said template data was *not* shared between the two pages; that's no longer true (unclear whether it was fixed after this note was written, or the note was wrong even at the time — either way, confirmed against current code). **Both pages now import the exact same `TEMPLATES`/`CATEGORIES` from `frontend/lib/templates-data.ts`** (`import { TEMPLATES, CATEGORIES } from "@/lib/templates-data"` in both `app/templates/page.tsx` and `app/(dashboard)/dashboard/templates/page.tsx`, confirmed via direct grep) — the file's own header comment now states this explicitly: *"Single source of truth for the 14 real CV templates — shared by the authenticated template picker ... and the public marketing gallery ..., so the two can never drift out of sync with each other."* `/dashboard/templates` layers its own CV-creation logic (routing into the Career Mentor onboarding flow, Pro-upgrade modal, etc. — see section 24.3) on top of the same shared template list, rather than maintaining a separate one. If a 15th template is ever added, it only needs registering **once** in `templates-data.ts` for both gallery pages (plus the CV-builder-specific file list in section 6, which is a separate concern — rendering the template inside the actual builder/PDF pipeline).

### Category filters (both pages):
- All / Simple / Modern / Creative / Professional

### Free/Pro split:
- FREE: Classic (Simple), Inline (Simple), Colorful (Creative), Halo (Professional), Nova (Simple)
- PRO: Modern, Bordered, Timeline, Executive, GCC, Portrait, Milestone, Vega, Aurora

### Template card features (both pages):
- iframe preview using `/cv-template-preview/[templateId]`
- Scale calculated dynamically based on container width
- Free badge (green) / Pro badge (amber + lock)
- Popular badge on Classic, Modern, Colorful
- Hover: "Use Template" button (free) or lock overlay (pro)

### New CV flow (authenticated):
```
CV Builder list page → "New CV" button
→ /dashboard/templates page (pick template)
→ Creates CV with TEMPLATE_DEFAULT_CUSTOMIZATION
→ /cv-builder/[id] editor
```

### New CV flow (anonymous visitor, from the public marketing site):
```
/templates (browse, no auth) → "Use Template" or Pro card
→ /signup → (after account creation) into the authenticated app
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

## 15. AI Assistant ("Zeni" drawer — RightPanel.tsx)

⚠️ **Correction (session 16):** this section previously stated the free limit as 5/day, `localStorage`-only. That was stale — it was already fixed to **3/day, server-side** in session 13 (see section 27). The line below is the corrected, current behavior.

### Per-section AI actions:

**Experience:** improve_bullet, add_metrics, duty→achievement, STAR format, make longer, make shorter, fix grammar, remove weak words, add keywords, make professional

**Profile Summary:** rewrite, make shorter, make longer, fix grammar, add keywords, generate from scratch, change tone (executive/technical/friendly), tailor for role, translate

**Skills:** suggest skills, trending skills, group by category, add ATS keywords

**Education:** improve description, make professional, make shorter, fix grammar

**Projects:** improve description, add impact, add metrics, make professional, make shorter, add keywords

**Default:** improve text, make shorter, make longer, make professional, fix grammar, add keywords

Every per-section action goes through `POST /cv/ai/improve`, which only **copies the result to the clipboard** ("Copy Suggestion" — renamed session 16, was misleadingly labeled "Copy & Accept" despite never writing into the CV) — the user still has to paste it into the field themselves. "Polish Whole CV" (new, below) is the only AI action in this panel that writes directly into the CV.

### Free limit: **3 AI uses per day, enforced server-side** (`users.ai_usage_count`/`ai_usage_date`, checked in `POST /cv/ai/improve` — since session 13). The displayed "N uses left today" count is sourced from `GET /auth/usage-stats` (the same endpoint the Profile page uses), refetched after every AI call — **not** a separate client-side counter (see session 16 fix below).

### Session 16 (2026-07-22) — 3 confirmed bugs fixed:

1. **`group_skills` displayed raw JSON instead of a formatted list.** The action's prompt asks Claude to return `{"groups": [{"category": ..., "skills": [...]}]}`, but the response renderer (`RightPanel.tsx`) treated every action's response identically — a plain `<p>` tag dumping the raw JSON text (and, once found live, Claude sometimes wraps it in a ```` ```json ```` fence and/or appends a trailing commentary note like *"No skills matched category X"*, which also broke a naive `JSON.parse` on the whole string). Fixed with a `parseGroupedSkills()` helper that extracts the `{...}` substring between the first `{` and last `}` rather than parsing the whole reply, then renders real category headings with skill chips underneath.
2. **Frontend/backend AI-usage counter split.** `RightPanel.tsx` tracked its own `localStorage` counter (`zh_ai_uses`), completely independent of the real server-side `users.ai_usage_count` enforced by `POST /cv/ai/improve` — could show "3 uses left" in the UI while the server was already at the daily limit (e.g. after clearing browser storage, or using a second browser/session on the same account). **Fixed**: the local counter was deleted entirely; the panel now calls `GET /auth/usage-stats` on mount and after every AI call, so the displayed count always matches the real enforcement.
3. **"Copy & Accept" button was misleadingly named.** It only copied the AI's suggestion to the clipboard and cleared the response — it never wrote the suggestion into the actual CV section, so the name implied an action ("Accept") that didn't happen. **Fixed**: renamed to "Copy Suggestion," with a caption ("Paste it into the section field") matching the honest pattern Quick Fixes' Auto Fix button already used for the same clipboard-only behavior.

### "Polish Whole CV" (NEW, session 16) — bulk proofreading action

A new card at the top of the Zeni tab (separate from the per-section action buttons), labeled "✨ Polish Whole CV." Unlike every other AI action in this panel, **it writes results directly into the CV** rather than just copying to clipboard.

- **Behavior**: runs `fix_grammar`-equivalent proofreading (light polish — spelling/grammar/clarity only, not a rewrite) across every filled section/entry in one click: Profile Summary, every Experience/Education/Projects entry's `description` field, and every Skills entry's `subskills` field. Reuses the exact same `improve_cv_text()` service call the per-section "Fix grammar" button already uses (no new AI prompt/logic) — deliberately chosen over `improve_bullet`/`add_metrics`-style actions so this reads as proofreading, not content rewriting. Verified live: a deliberately-injected grammar error ("Performed manual testings of web application... improve softwares quality, it help teams alot.") came back genuinely corrected ("Performed manual testing of web applications... improve software quality, which helped the team a lot.") — meaning preserved, not reworded.
- **Rich-text handling**: these fields are stored as Tiptap HTML, but the AI endpoint is plain-text in/out. Each field is decomposed into lines (one per `<li>`, or one per `<p>`, or a single blob), sent newline-joined, and only re-assembled into HTML if the corrected text splits back into the *exact same number of lines* — a structural mismatch is treated as a failure for that one item (original left untouched) rather than risking corrupted/lost content.
- **Progress UI**: a live progress bar + "Polishing {section label}…" text, since this makes multiple sequential real network calls and could otherwise look frozen. A completion summary ("✓ Polished N sections") follows, with a partial-failure list ("N failed — retry manually via that section's own button") naming exactly which sections didn't apply cleanly.
- **Usage billing — decided as a single flat credit for the whole run, not metered per section.** Metering per-section would let one click burn a Free user's entire 3/day limit instantly, which is punishing rather than helpful for a bulk convenience action. The tricky part: the existing `POST /cv/ai/improve` endpoint charges one credit **per HTTP call, server-side** — looping it from the frontend would still charge N times no matter what the client does, since usage limits must stay server-authoritative (this is literally the bug just fixed in point 2 above). Solution: a new `POST /cv/ai/polish-cv/item` endpoint (still calling `improve_cv_text()` under the hood — same AI logic, no new prompts) where the **first** call of a run (no `batch_token`) checks/charges the daily limit and mints a short-lived (180s) token; every subsequent call in that run presents the token and is billed nothing, with the token's validity checked server-side (scoped to that user, time-limited) so a client can't simply claim "don't charge me" on an arbitrary call. Verified directly against Postgres: `ai_usage_count` went from 0→1 after a 5-section Polish run, and 0→1 again after a second 5-section run — never 5.
- **Partial-failure isolation**: each item call is independently try/caught; a failure (network blip, or the line-count structural-mismatch guard above) leaves that one section untouched and lists it in the completion summary as failed-with-retry-guidance. Only a failure on the very first call (before any charge/token exists) aborts the whole run, since nothing has been charged yet to make partial progress meaningful.
- **Known limitation**: the batch-token store (`_polish_batch_tokens` in `backend/app/api/routes/cv.py`) is an in-memory dict, not a DB table — deliberately, to avoid an Alembic migration on launch day (see the template-enum migration gotcha, section 6). Fine for the current single-process deployment; won't survive a backend restart mid-run (worst case: a stalled run needs a manual retry, no double-charge risk either way) and isn't shared across multiple uvicorn workers if the backend is ever scaled horizontally — revisit with a DB-backed token table if that happens.

### ⚠️ Open, not resolved: `add_metrics`/`add_impact` can fabricate plausible-sounding numbers

Flagged during session 16 while documenting the actions above, not introduced this session. `ai_service.py`'s `add_metrics` prompt explicitly says *"If exact numbers are unknown, use realistic estimates (e.g., '~30%', 'a team of 5')"* — `add_impact` has similar latitude. This is intentional existing behavior, not a bug, but it sits in real tension with this product's stated "no fabricated numbers, honest not flattering" scoring philosophy (section 1) — a user could end up with an invented "~30% improvement" on their CV that they never actually measured. Left as an open **post-launch product decision** (e.g. rephrase the prompt to require the user supply real numbers, or add a visible disclaimer when an estimate is used) — not touched this session. See section 22 item 27.

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

**Session 15 (2026-07-22) — real end-to-end test (Pro test account, actual CV Builder + AI Assistant actions + real /ats/analyze, not hand-crafted content) found and fixed 4 confirmed bugs; two more findings from the same test are documented below as known characteristics, deliberately left unfixed.** Real test CV scored 59.5/100 before fixes, 66.0/100 after (+6.5), verified by re-running the same CV through the real endpoint both times — not estimated.

**Fixed this session:**
1. **Double-bullet artifact defeated action-verb detection in Content Quality.** Claude's `improve_bullet`/`add_metrics`/etc. responses sometimes prepended their own "• " despite being told to return only the text; `extractCVText()` (the CV Builder's "Send to ATS" serializer) always adds its own "• " on top, producing `"• • Engineered..."` in the analyzed text. `_layer_content_quality`'s bullet regex only strips one leading bullet, so `words[0]` became "•" instead of the real verb — `with_action_verb` read `0/6` on a CV whose AI-polished bullets genuinely opened with strong verbs. Fixed at the source: `improve_cv_text()` (`ai_service.py`) now strips any leading bullet character from Claude's response before it's ever saved. `extractCVText()` also got a defensive guard (won't double-prepend if the stored text already starts with a bullet) to protect any CVs saved before this fix. Isolated impact: +4.0 points on Content Quality's 20-point scale from this bug alone, confirmed by running `_layer_content_quality()` on the buggy vs. de-duplicated text.
2. **LinkedIn/GitHub links silently dropped from the ATS Checker.** `extractCVText()` never read `personal_details.links` (the actual `{platform, url}` array SectionForms.tsx uses) — only `full_name`/`title`/`email`/`phone`/`location`. Any user's LinkedIn/GitHub/portfolio links vanished before reaching `/ats/analyze` via the "Send to ATS" button, regardless of what was actually filled in. Fixed: `extractCVText()` now includes a links line when present.
3. **`has_portfolio` false-positived on `.dev`/`.io` substrings inside email addresses** (e.g. `michael.fernando.dev@gmail.com` matched via `fernando.dev`). Fixed with a dedicated `_has_standalone_dev_or_io_link()` check in `ats_service.py` that excludes matches immediately adjacent to `@` on either side — verified against the exact email that triggered it, and confirmed a real standalone link (e.g. `janedoe.dev`) still matches.
4. **Employment-gap check scanned years from the whole CV text, including Education**, so a normal 4-year degree span got misread as a gap between distinct "employment" years. Fixed: `_layer_professional` now isolates the Experience section's own text (reusing the same section-boundary regex pattern `_layer_grammar` already used for its tense check) before running the year-gap check.

**Known, documented, deliberately NOT fixed (same test run, judgement calls not bugs):**
- **Keyword layer structurally caps out around 30-40% for any realistically-sized CV.** The no-JD path (`_generate_role_keywords`) always generates ~18-20 "ideal" keywords for the target role, but a realistic Skills section is 8-12 items — so even a strong, relevant CV can't cover more than about half the list. In the real test, the CV Builder's own "Suggest Skills" AI action correctly recommended several of the missing keywords (PostgreSQL, Redis, Kubernetes, System Design), but only 2 were kept to stay at a realistic list length. This is a real content/calibration tension, not a parsing bug — worth a product decision (e.g. weighting by keyword importance rather than raw count) but not touched this session.
- **Language & Grammar and AI Recruiter layers are not deterministic run-to-run.** Two `/ats/analyze` calls on near-identical text swung Language & Grammar 10/10↔6/10 and AI Recruiter 60%↔40%, purely from normal Claude sampling variance (no `temperature=0` or similar pinning). In the test case the swing turned out to be catching a real defect inconsistently (see fix 1 above) rather than being spurious, but the underlying non-determinism is real and independent of content changes — worth flagging for anyone reasoning about "the score" as a single stable number.

### Session 17 (2026-07-22/23) — score-legend unification + 2 more honesty fixes

Part of the same large `4e27999` commit as sessions 17's other work (section 12, 23.5, 33, 34) — verified via `git show` diff + current HEAD reads.

**1. Unified score legend — new `frontend/lib/ats-score.ts`, single source of truth.** Previously `ScoreGauge.tsx`, the results `page.tsx`, and `ResultsSidebar.tsx` each hardcoded their own score-band thresholds/colors/labels independently, and they didn't even agree with each other (`ScoreGauge` used a 75/50 split labeled "Strong/Moderate/Needs Work"; `ResultsSidebar` used an 80/60/40 split with different hex codes). New shared export:
```ts
export function getATSScoreLevel(score: number): { label: string; color: string; sentence: string } {
  if (score >= 85) return { label: "Excellent", ... };
  if (score >= 70) return { label: "Good", ... };
  if (score >= 50) return { label: "Needs Improvement", ... };
  return { label: "Weak", ... };
}
```
All three call sites now import and use it — this wasn't just a refactor, it also fixed a real inconsistency where the same score could read as a different tier depending on which component you were looking at. Scoped deliberately to the *overall* 0-100 score only — `LayerCard.tsx`'s per-layer percentage colors and the top-stat-row's per-layer colors (see #2 below) still have their own local thresholds, which is correct/expected, not a missed spot.

**2. AI Recruiter score leak fixed.** The top stat row on the results page previously rendered every layer's numeric score unconditionally, including `ai_recruiter` — so a Free user could read the actual AI Recruiter percentage in that row even though the full `RecruiterCard` further down is Pro-gated (blurred+locked). Fixed: that one tile now checks `!isPro` and renders a `Lock` icon instead of the number, matching the gating already applied everywhere else this score appears.

**3. AI Recruiter honest-failure fix.** Previously, if the Claude call for this layer threw, the catch block **fabricated a plausible-looking mid-range result** (`score: 5.0`, `percentage: 50.0`, `hire_likelihood: 50.0`) — indistinguishable from a real analysis — and leaked the raw exception text (`str(exc)[:120]`) into the user-facing `most_important_improvement` field. Fixed to match this product's stated philosophy (section 1) and the existing Layer 5/Grammar honest-failure pattern: the schema's `score`/`percentage`/`hire_likelihood` are now `Optional[float] = None`, plus new `failed: bool` / `error: str | None` fields; on failure the layer now returns `score: None`, `failed: True`, and a generic `error` message with no exception text. `_overall()` was updated to sum only non-`None` layer scores (previously would have crashed on `None`, or pre-fix baked in the fake 5.0). Frontend: `RecruiterCard.tsx` shows a distinct "could not be completed" panel when `failed` is true instead of rendering fabricated numbers; `LayerCard.tsx` shows `N/A` + an inline warning instead of a progress bar.

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

### Free limit: 5 ATS analyses total (lifetime, not monthly — and the one feature limit in the entire locked plan that's actually enforced server-side, see section 27)

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

# Contact (public, no auth — NEW session 9)
POST   /contact/                submit contact form → saves to contact_submissions, no email sent

# Reviews (public, no auth — NEW session 9)
GET    /reviews/                list APPROVED reviews only
POST   /reviews/                submit a review → always saved with approved=false
```

---

## 20. Auth System

- JWT stored in cookie named `token`, minted via `create_access_token()`, verified via the `get_current_user` dependency.
- `useAuth()` hook reads user from `/auth/me`.
- ⚠️ `isPro` must be read from `user.is_pro` (a real, live-computed backend property — see 27.1), **not** `user.plan === "pro"` — this line here was itself stale until session 14. Every actual frontend gate was already switched to `is_pro` back in session 13 (see 28.3), but this summary line was never corrected to match at the time. `plan` is a cosmetic label only, not the enforcement source of truth.
- Pro features gated in: CustomizationPanel, RightPanel, ATSChecker, TemplatesPage, CVRebuildPreview (blur+lock), plus everywhere listed in section 27's enforcement table.
- **Password strength (session 14, 2026-07-21)**: minimum 8 characters + at least 3 of {uppercase, lowercase, number, special character}, enforced server-side by `password_strength_error()` (`backend/app/core/security.py`) and mirrored client-side by `frontend/lib/password.ts` (`isPasswordValid`/`getPasswordHints`/`getPasswordStrength`) driving a live `PasswordStrengthMeter.tsx` component on signup. This single validator/component pair is reused — not reimplemented — by the password reset flow (section 30) and the profile page's change-password form (section 31).
- **Password reset (NEW, session 14)** — see section 30.
- **Profile page / change password (NEW, session 14)** — see section 31.

---

## 21. What's Next (Phase 2)

Priority order:

1. ~~**Landing Page** — `/` marketing page with hero, features, pricing, testimonials~~ **DONE (session 9)** — full public marketing site built: Home, Templates, Pricing, About, Contact, Partners, Privacy, Terms, Reviews, Career Tips, plus a shared SiteHeader/SiteFooter. See section 23. "Testimonials" became the dedicated `/reviews` page (user-submitted, manually-approved) rather than a Home-page section. Remaining gap from this work: `/features/ats-checker` is linked (Home + footer) but not built — see section 22 item 16.
2. **Backend enforcement of the locked Free/Pro feature plan** — **NEW top priority, promoted ahead of Stripe (session 12 finding).** The plan itself is now finalized and documented (section 27), but 6 of its 8 limits have no real server-side gate today — a free user can already create unlimited CVs/cover letters, select any Pro template, and call the AI/Auto-Fix endpoints without limit via direct API calls. Wiring Stripe on top of ungated endpoints would only gate the *checkout flow*, not the actual features. See section 27.1 for the concrete punch list (plan checks on CV/cover-letter creation, template selection, AI usage tracking, and a `pro_until` column for the 7-Day Pass).
3. ~~**Stripe Payments** — Pro plan subscription, webhook, plan update.~~ **DONE, differently (PAYable, not Stripe) — fully verified end-to-end session 14.** The business decision to use PAYable's Direct API instead of Stripe was made session 13; code-complete then, blocked on a PAYable-side credential issue, now fully verified working (real sandbox payment, independently-verified webhook, `pro_until` correctly set on a real account). See rewritten section 28. Still needs production deployment + live (non-sandbox) credentials before real customers can pay — see new 28.5.
4. ~~**Admin Panel** — user management, stats, revenue.~~ **Mostly DONE (session 11, more complete than previously documented — see section 25).** A full multi-page `/admin/` section now exists: Overview stats, Users (Free/Paid tabs + usage counts), Reviews (Pending/Approved tabs + approve action), Contact Submissions, a Career Tips CMS (publish/unpublish), and an Admins page (create admin, one-time password reset). Still explicitly out of scope: editing/deleting regular users, and revenue tracking (blocked on item 3/Stripe).
5. **Google Sign-In** ~~planned~~ **DONE (session 12)** — see section 26. One open item from this work: the silent account-auto-linking behavior (section 22 item 18) is worth a security review before relying on it with real user passwords in production.
6. **CV Upload Parser** — upload PDF → AI extracts → fills real CV Builder sections (explicitly postponed during ATS session — this is a prerequisite for any future "fully personalized rebuilt CV" feature, distinct from the current lightweight CVRebuildPreview which uses placeholder content + injected real name/contact only)
7. **ATS target_role enforcement** — add UI warning when empty (see section 18 known gap)
8. **`/features/ats-checker` marketing page** — linked from Home and the new footer, doesn't exist yet (session 9 finding, re-confirmed session 12, see section 22 item 16)
9. ~~**"Zeni" persona/name/avatar unification**~~ **CONFIRMED SHIPPED (corrected session 16)** — was wrongly logged as "still planned"; the onboarding chat, `RightPanel` tab, and CV Builder FAB/drawer all actually say "Zeni" already. See rewritten section 24.6.
10. ~~**Production Deployment** — Vercel (frontend) + Railway (backend) + Supabase (DB)~~ **DONE, differently than planned (session 17)** — actual deployment is a single Nginx-fronted server (`zenzhire.com` → Next.js `:3000`, `/api` → FastAPI `:8000`), not the originally-planned Vercel/Railway/Supabase split. PAYable confirmed live in production. See new section 35 — including an open action item (local dev `.env` still has `PAYABLE_ENV=live` pointed at ngrok, not reverted to sandbox).
11. **Re-enable Career Mentor onboarding** (~2 weeks from 2026-07-21, i.e. around early August) — flip `CAREER_MENTOR_ENABLED` back to `true` in `frontend/lib/feature-flags.ts` once it's had more real-world testing post-launch. See 24.7.
12. **⚠️ HIGH PRIORITY — pre-launch regression testing** (full 14-template pass, Cover Letter, ATS Checker) — planned but not executed session 14. See new section 32.

---

## 22. Known Issues / Pending Work

1. ~~**Debug screenshot** — `route.ts` saves to `C:/Users/kavidu/debug-screenshot.png`~~ **RESOLVED (confirmed session 6)** — grepped the entire frontend for `debug-screenshot`, `writeFile`, and `screenshot(` in both PDF routes: zero matches. Already removed from the codebase; this item and its section 10 callout were just never cleaned up in the doc.
2. ~~**Modern template PDF** — sidebar color tested with fixed overlay approach, verify on multi-page CVs~~ **RESOLVED 2026-07-04** — Modern migrated to the shared pagination engine; the sidebar band is now derived per-page from `computePageBreaks()`'s own output in both preview and PDF, not a `position:fixed` overlay. See section 10.2.
3. ~~**Stripe not set up**~~ **RESOLVED (differently than planned) session 13** — payment integration was built against **PAYable**, not Stripe (business decision, not this doc's call) — see new section 28. Code-complete (checkout, webhook, admin override) but **not yet verified end-to-end**: PAYable's sandbox auth is currently returning 404 for our credentials, see item 24 below and section 28.4.
4. **CV upload parser** — planned feature, not built (see Phase 2 #4)
5. **Mobile responsiveness** — not fully tested on mobile, including the new ATS sidebar layout (verify sidebar stacks correctly on narrow screens) — not independently re-verified this session (requires visual/device testing, not a code audit)
6. **Email verification** — not implemented in auth — confirmed still true (no verification-related code found, session 6 re-check)
7. **ATS target_role optional but high-impact** — no UI warning yet when left empty (see section 18) — confirmed still true (no warning/banner text found near the `target_role` input, session 6 re-check)
8. **sentence-transformers / semantic keyword matching** — uses lazy-loaded `_get_sentence_model()`; not yet confirmed whether this is reliably installed/working in all environments — falls back to exact-match silently if unavailable. Should be verified before production. (Confirmed the lazy-load pattern is still exactly as described, session 6 re-check.)
9. **Stale template count in Pro upsell copy** (found during session 4 template audit) — `(dashboard)/dashboard/templates/page.tsx`'s `ProUpgradeModal` hardcodes the feature bullet `"5 premium CV templates"`, but there are actually **9** Pro templates (modern, tech, creative, executive, gcc, portrait, milestone, vega, aurora — unchanged since Aurora/session 7, confirmed Nova/session 8 shipped FREE so didn't add a 10th). Fix: bump the copy or, better, derive the count from `TEMPLATES.filter(t => t.plan === "pro").length` (from the now-shared `frontend/lib/templates-data.ts`, session 9) so it can't drift again. **Confirmed still unfixed (session 12 direct code re-check, `grep -n "premium CV template"` — line still reads exactly `"5 premium CV templates"`).**
10. **Orphaned `cv_sections.data._layout` field** ({marginBottom, lineHeight}) — leftover from the removed per-section spacing/line-height steppers in `SortableSection.tsx`'s toolbar. No template reads it anymore (all 13, including Aurora added session 7, derive spacing solely from the global `CVCustomization.spacing` value — confirmed zero references to `_layout` anywhere in `components/cv-builder`, session 6 re-check). Safe to ignore — existing stored values are inert, not read anywhere — but clean up with a migration (drop the key from `data` JSONB, or leave it since it's harmless dead data) before production deployment.
11. **`duplicate_cv` doesn't copy `customization`** (found during the preview/PDF pagination-drift investigation, 2026-07-04) — `backend/app/api/routes/cv.py`'s `duplicate_cv` route copies `title`/`template_id`/sections but never sets `customization=source.customization` on the new `CVDocument`, so a duplicated CV silently resets to `DEFAULT_CUSTOMIZATION` instead of keeping the original's accent color/font/spacing/etc. Fix: add `customization=_merge_customization(source.customization, None)` to `duplicate_cv`'s `CVDocument(...)` call. **Confirmed still unfixed (session 12 direct code re-check — the route's `CVDocument(...)` call, lines ~199-204, still only sets `user_id`/`title`/`template_id`/`is_primary`).**
12. ~~**Shared pagination engine: `CONTINUATION_TOP_GAP` gap-accounting edge case**~~ **RESOLVED (confirmed session 6)** — re-read `lib/pagination.ts`'s current `computePageBreaks()` directly: it already reserves `CONTINUATION_TOP_GAP` out of every continuation page's budget as part of the break decision itself (`pageBottom = c.top + (pageHeight - CONTINUATION_TOP_GAP)`), not as a later `margin-top` injection that the decision couldn't see coming. The function's own doc comment explicitly describes the old, broken behavior in the past tense. This was fixed at some point after being logged but the doc was never updated — see section 10.2 for the full corrected note.
13. **References section email/phone rendering in white/near-white text (unreadable)** — previously logged as "fixed on Classic and Modern only, needs verifying on the rest." **Re-audited session 6:** checked every one of the (then 12) templates' source for the `Phone:`/`Email:` (or bare email/phone) rendering in their References section — every one uses either no explicit color (inherits the surrounding readable text color) or an explicit readable gray (`#555`, `#4b5563`, `#6b7280`, or each template's own `LIGHT` constant, all `#6b7280`). Found no white/near-white color anywhere. **Appears resolved across all 12 templates as of session 6** — but this is a source-code audit, not a re-run visual/PDF screenshot check, so treat as high-confidence rather than fully closed until someone visually confirms. Aurora (added session 7) also uses this same safe `DARK`/`MID`/`LIGHT` convention for its References text — it renders in the white main column, not the colored sidebar, so it was never at risk of the *other* new contrast issue found this session (see section 6's Aurora entry and 10.4 lesson 7) either.
14. **`backend/app/models/__init__.py` never imports `CoverLetter` — and now also never imports `CareerTip`.** Confirmed both still missing session 12 (current file only imports `User`, `CV`, `CVDocument`/`CVSection`, `ATSResult`, `ContactSubmission`, `Review`). `alembic/env.py`'s `import app.models` therefore never registers either table with `Base.metadata` through that path, so `alembic revision --autogenerate` could miss real future changes to `cover_letters` or `career_tips`, or generate a spurious drop. Harmless at runtime (both models are imported directly by their own route files, which is enough for the live app) but should be fixed before it causes an autogenerate surprise. Fix: add `from app.models.cover_letter import CoverLetter` and `from app.models.career_tip import CareerTip` to `backend/app/models/__init__.py`. Also relevant to any standalone DB script — see section 25.1's `⚠️` note, which now applies to both models.
15. **Migration drift check (session 12):** `alembic current` and `alembic heads` both report `016_add_google_oauth_users` — single head, DB fully up to date, chain confirmed linear `012 → 013 → 014 → 015 → 016`, no pending/unapplied migrations.
16. ~~**`/features/ats-checker` is linked but doesn't exist (found session 9).**~~ **RESOLVED.** Built both `/features/ats-checker` and `/features/cv-builder` as real public SEO landing pages (`frontend/app/features/{cv-builder,ats-checker}/{page,layout}.tsx`), each with a keyword-rich single `<h1>`, an `<h2>`-structured "how it works"/features/FAQ layout, and `FAQPage` JSON-LD. Both reuse `SiteHeader`/`SiteFooter` and the existing dark-navy design system, cross-link to each other and to `/templates`/`/signup`, and are listed in the new `frontend/app/sitemap.ts` (which itself didn't exist yet either — built fresh, covering all public marketing routes). Verified the 404 is gone and both pages render correctly at 1440px and 390px. Separate from the working authenticated `/ats-checker` tool (section 18), which this doesn't touch.
17. **Stale file path in item 9 above, corrected (session 9):** the `ProUpgradeModal` with the hardcoded `"5 premium CV templates"` copy now lives at `app/(dashboard)/dashboard/templates/page.tsx` — the file moved when `/templates` was repurposed as the public marketing page (see section 13's rewrite). Same bug, same fix needed, just a different path if you go looking for it.
18. **NEW (session 12): Google OAuth silently auto-links to an existing email/password account with no re-authentication.** See section 26.3 for the full detail and code. Not necessarily wrong behavior (it's a common, deliberate UX tradeoff), but it should be a conscious decision rather than an unreviewed side effect — flag for a security/product review before this goes live for real users with real passwords already set.
19. ~~**NEW (session 12): the free-tier AI usage limit is inconsistent between the Pricing page and the actual code, and neither is backend-enforced.**~~ **RESOLVED session 13** — both fixed to 3/day: `RightPanel.tsx`'s `AI_FREE_LIMIT` constant corrected `5 → 3`, and `POST /cv/ai/improve` now enforces it server-side via new `users.ai_usage_count`/`ai_usage_date` columns. See section 27.
20. ~~**NEW (session 12): 6 of the 8 locked Free/Pro feature limits have no real server-side enforcement.**~~ **RESOLVED session 13** — all 8 now genuinely enforced server-side, verified with real Free/Pro test accounts via direct API calls. See rewritten section 27.
21. ~~**NEW (session 12): no plan-expiry support for a time-limited pass.**~~ **RESOLVED session 13** — added `users.pro_until` (nullable datetime, migration `017_add_pro_until_ai_usage`) and a `User.is_pro` property computed from it. See section 27.1.
22. **NEW (session 13): `backend/app/core/config.py`'s `Settings` was crashing on import, breaking the entire backend and Alembic.** `.env` had `PAYABLE_*` keys with no matching fields in `Settings` (pydantic-settings' default `extra="forbid"` behavior), so any code path that imported `app.core.config` — which is nearly everything, including `alembic/env.py` — raised a `pydantic_core.ValidationError` before doing anything else. Found while trying to run the session-13 migration. **Fixed** by adding `extra = "ignore"` to `Settings.Config` and then, once the PAYable env vars were actually needed (section 28), adding real typed fields for all of them so they're validated rather than silently ignored.
23. **NEW (session 13): `frontend/tsconfig.json` had an invalid `ignoreDeprecations` value, silently blocking all type-checking.** `"ignoreDeprecations": "6.0"` is not a value TypeScript 5.9 (the installed version) recognizes — it only accepts `"5.0"` — so `tsc --noEmit` failed immediately with `error TS5103` before checking a single file. No one had run a working typecheck on this frontend in this state. **Fixed**: `ignoreDeprecations` corrected to `"5.0"`, and `target` bumped `es5 → es2017` (also fixes 3 real `TS2802` errors in `RightPanel.tsx`/`cv-builder/onboarding/page.tsx` that needed `es2015`+ for `Set` spread iteration — remember to delete `frontend/tsconfig.tsbuildinfo` after a `tsconfig.json` change if `tsc` seems to ignore it, its incremental cache doesn't always self-invalidate on config edits). Typecheck now runs clean except 5 pre-existing, unrelated errors (`ats-checker/page.tsx`, `CoverLetterPreview.tsx`, `api/generate-pdf/route.ts`, `lib/pagination-test-data.ts`) — none touched this session, not investigated further.
24. ~~**NEW (session 13, OPEN): PAYable sandbox Direct Auth is rejecting our business credentials.**~~ **RESOLVED session 14.** This was a PAYable-side provisioning/credential issue, since fixed by them — no code or credential change was needed on our end; the exact same request that 404'd in session 13 now succeeds. Checkout session creation, a real sandbox payment, and independently-verified webhook delivery (`checkValue` recomputed and matched byte-for-byte) are all now confirmed working end-to-end, and `pro_until` was confirmed correctly set on the real test account. See rewritten section 28.4. Still not production-ready — temporary ngrok tunnels + sandbox credentials — see new 28.5 for the production checklist.
25. ~~**NEW (session 14): cover letter creation had no error handling at all.**~~ **RESOLVED session 14** — a Free user hitting the 1-cover-letter limit via the dashboard quick-action or the cover-letter list page's "New Cover Letter" button previously got zero feedback of any kind, not even a console-visible error. Both call sites now show `PlanLimitDialog` like every other plan-limit moment in the app. See 27.3.
26. **NEW (session 14, OPEN, HIGH PRIORITY): full regression testing not yet done this session for templates, Cover Letter, and ATS Checker.** A 14-template regression test plan was designed but not executed; Cover Letter and ATS Checker have had no systematic test pass at all this session. See new section 32 for the specific list — this is a pre-launch blocker, not a minor gap.
27. **NEW (session 16, OPEN, post-launch product decision): `add_metrics`/`add_impact` AI actions can fabricate plausible-sounding numbers.** `ai_service.py`'s `add_metrics` prompt explicitly permits "realistic estimates" (e.g. "~30%," "a team of 5") when no real number is available — in tension with this product's stated "honest, not flattering, no fabricated numbers" scoring philosophy (section 1). Not a bug, not touched this session — flagged for a product decision (rephrase the prompt to require real user-supplied numbers, or surface a visible "estimated" disclaimer). See section 15's new subsection for full context. **Re-confirmed still open, session 18** — `ai_service.py`'s 10-line diff in the session-17 commit was the unrelated bullet-stripping fix (section 18), not a change to this prompt.
28. **NEW (session 18, OPEN): Cover Letter template fallback for the 6 newer CV templates still silently substitutes Classic with a misleading "success" toast.** Session 17 was assumed to have added an honest "not available yet" message for CVs using Portrait/Milestone/Corporate/Vega/Aurora/Nova (none of which have a Cover Letter equivalent) — direct code audit found this is not the case. `CV_TO_CL_TEMPLATE` (`cover-letter/[id]/page.tsx`) is unchanged and still falls through to `?? "classic"`, with a toast literally reading `"Template auto-matched to classic from your CV"` — worded as a successful match, not a warning. See section 12's correction for full detail. Fix: either add a real conditional message for CV templates not present in the mapping, or at minimum reword the toast to be honest when the fallback path is hit.
29. **NEW (session 18, OPEN, security/financial risk): local dev `backend/.env` has `PAYABLE_ENV=live` with real credentials, still pointed at ngrok tunnel URLs.** Not sandbox, not reverted as assumed. A checkout run from this local dev environment right now would hit PAYable's real production API — any successful test payment would be a real charge. See section 35.3. Fix: revert `PAYABLE_ENV` to `sandbox` (with sandbox credentials) on this machine before any further local billing-flow testing.
30. **NEW (session 18, OPEN, low priority): two stray process-ID files committed to git.** `backend/_uvicorn.pid` and `frontend/_next2.pid` were accidentally added in the session-17 commit (`4e27999`). Harmless (unread by any code path) but should be `git rm`'d and `.gitignore`'d.
31. **NEW (session 18, OPEN, low priority): mobile hamburger menu is duplicated, not shared, between `SiteHeader.tsx` and `Navbar.tsx`.** Both were independently fixed in session 17 with the identical hand-rolled open/close-state/outside-click/route-change pattern, copy-pasted rather than extracted into a shared hook/component. Not a bug — both work correctly as of session 17 — but a future fix to one won't automatically apply to the other. See section 23.5.
32. **NEW (session 18, OPEN, minor): mobile CV Builder "fit to screen" zoom is computed once on mount, not on resize/rotation.** See section 33 for full detail — not a launch blocker, but worth a `resize`/`ResizeObserver` listener before calling mobile CV editing fully polished.

**Session 18 re-verification of prior items (direct code/DB re-checks, not assumption):**
- Item 11 (`duplicate_cv` doesn't copy `customization`) — **confirmed still unfixed** (`backend/app/api/routes/cv.py`'s `duplicate_cv`, current `CVDocument(...)` call still only sets `user_id`/`title`/`template_id`/`is_primary`).
- Item 14 (`models/__init__.py` missing `CoverLetter`/`CareerTip` imports) — **confirmed still unfixed** (current file imports `User`, `CV`, `CVDocument`/`CVSection`, `ATSResult`, `ContactSubmission`, `Review`, `BillingTransaction` — still no `CoverLetter` or `CareerTip`).
- Item 7 / section 18's `target_role` UI warning — **confirmed still not built** (no warning/banner text found near the ATS Checker's `target_role` input).
- Item 26 (full 14-template + Cover Letter + ATS regression pass) — **status unchanged, still not executed** (no test-suite artifacts or evidence of a systematic pass found; this can't be verified from code alone, only from its continued absence).
- Section 22 item 10 (orphaned `cv_sections.data._layout` field from the removed granular per-section spacing/line-height steppers) — **re-confirmed still accurate**: zero references to `_layout` anywhere in `components/cv-builder`, current session. Safe to ignore, still a pre-production cleanup candidate rather than an active bug.
- Migration drift check (session 18): `alembic current` and `alembic heads` both report `020_add_personal_details` — single head, DB fully up to date, chain confirmed linear through the new cover-letter migration.

---

## 23. Marketing Site — Public Pages (built session 9, 2026-07-08)

Everything in this section is new this session. Before session 9, `/` was effectively a placeholder and there was no real marketing site — item 1 of section 21's Phase 2 list ("Landing Page — `/` marketing page with hero, features, pricing, testimonials") is now **done** except testimonials, which became the dedicated `/reviews` page described below instead of being embedded directly in the Home page.

### 23.1 Shared components — `frontend/components/marketing/`

| File | Purpose |
|---|---|
| `SiteHeader.tsx` | Sticky top nav (`sticky top-0`, `bg-[#0d1117]/85 backdrop-blur-md`). Logo + Templates/Pricing/About/Contact links + Sign in/Get Started buttons. Used at the top of every public page. |
| `SiteFooter.tsx` | The comprehensive footer (rebuilt session 9) — **single source of truth**, reused on every public page, so editing this one file updates all of them at once. Brand column (logo + 1-line description) + Product/Company/Legal link columns + a "Share ZenzHire" row (real share-intent links: Twitter/X, Facebook, LinkedIn, WhatsApp — pre-filled message + `https://zenzhire.com`) + a "Follow us" row (Twitter, LinkedIn, Instagram, Facebook, Telegram, TikTok — all `href="#"` placeholders, ready to swap in real URLs) + a bottom copyright/legal bar. Grid is `grid-cols-1 sm:grid-cols-2 md:grid-cols-5` — verify this stays a single column below `sm` if the column count/content ever changes, or the Legal column can end up orphaned alone in a 2-col row (this exact bug was found and fixed session 9). |
| `TikTokIcon.tsx` | Custom inline SVG (fill-based, 24×24 viewBox) — lucide-react has no TikTok glyph. Sized/used identically to lucide icons (`className="w-4 h-4"` etc.) wherever it appears. |
| `WhatsAppIcon.tsx` | Same pattern as `TikTokIcon.tsx` — lucide-react has no WhatsApp glyph either. |
| `TemplateCarousel.tsx` | Pre-existing (Home page template showcase section), unchanged this session. |

Note: lucide-react **does** have `Twitter`, `Linkedin`, `Instagram`, and `Facebook` — only TikTok and WhatsApp needed custom SVGs. For "Telegram" specifically, lucide's `Send` icon (paper plane) is reused as a visual stand-in rather than a custom SVG, since Telegram's own logo *is* a paper plane and `Send` already matches the stroke-outline style of every other icon in these rows.

### 23.2 Public pages

| Route | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Home/landing — hero, honesty-positioning callout, value props, "how it works," template showcase, ATS teaser, final CTA. Pre-existing, refined across sessions before 9. |
| `/templates` | `app/templates/page.tsx` | Public marketing gallery — see section 13's rewrite for the split from the authenticated picker. |
| `/pricing` | `app/pricing/page.tsx` | Monthly/Yearly toggle (yearly default, "Save 33%"), Free vs Pro comparison, separate 7-Day Pro Pass callout card, FAQ, final CTA. **Payment integration built session 13** — `Upgrade to Pro`/`Get 7-Day Access` open a billing-details modal then call the real PAYable checkout flow for logged-in users (unverified end-to-end pending section 28.4's blocker); `Get Started Free` still links to `/signup`. See section 28. |
| `/about` | `app/about/page.tsx` | Hero, "Why ZenzHire exists" two-column mission section (icon+heading left, copy right — deliberately not just another centered text block), 4-card "What we built" recap, a bordered "Built by Centival Software Solutions" credibility card, final CTA. |
| `/contact` | `app/contact/page.tsx` | Two-column: contact form (name/email/message, client validation, POSTs to backend, success/error states) + direct contact info card (`support@zenzhire.com` mailto link, `+94 78 782 0078` tel link, 6 follow-us social icons). Real end-to-end flow, not just a UI mock — see 23.3. |
| `/partners` | `app/partners/page.tsx` | Simple "Partner Program — Coming Soon" placeholder, per explicit instruction not to build a full program yet. CTA links to `/contact`. |
| `/privacy` | `app/privacy/page.tsx` | Generic SaaS privacy policy template (11 sections: data collected, usage, cookies, sharing, retention, user rights, termination, security, children's privacy, changes, contact). **Carries a highly visible disclaimer banner right below the title** (not buried in fine print): *"This is a template policy and has not been reviewed by a lawyer. Please consult a legal professional before relying on this document for your business."* This is placeholder legal content, not something to treat as actually reviewed/binding. |
| `/terms` | `app/terms/page.tsx` | Same pattern/disclaimer as `/privacy` — 11 sections covering acceptance, service description, accounts, user content ownership, subscriptions/billing (Monthly/Yearly/7-Day Pass), acceptable use, termination, disclaimers, liability limits, changes, contact. |
| `/reviews` | `app/reviews/page.tsx` | Public review submission (name, 1–5 star rating, text) + list of **approved-only** reviews below it. Explicitly shows **no fabricated reviews** — an empty state ("Be the first to leave a review!") renders until real reviews exist and have been manually approved. Approval is now a real in-app admin action (see 25.4/25.7), not a manual DB flip. |
| `/career-tips` | `app/career-tips/page.tsx` | **NEW (session 11, previously undocumented — added session 12).** Public listing of published career tips (title, cover image, caption preview), newest first. Empty by default until an admin publishes one via `/admin/career-tips` (see 25.5) — no seeded/fabricated content. |
| `/career-tips/[id]` | `app/career-tips/[id]/page.tsx` | **NEW (session 12).** Single career tip detail view — full title, image, rich-text (Tiptap-authored) caption rendered via the same safe `HtmlContent` sanitization pattern used elsewhere in the app. 404s cleanly if the tip was deleted/unpublished. |

All nine pages share the same dark-navy/blue-accent design system (`#0d1117` bg, `#161b22` surface, `#30363d` borders, `#2563eb` primary blue) and the `SiteHeader`/`SiteFooter` pair — verified rendering correctly (no console errors, no mobile overflow) at both 1440px and 390px across all of them.

### 23.3 New backend: `contact_submissions` and `reviews`

Two new tables, both public-facing (no auth required to submit), both added via their own Alembic migration, both confirmed with `alembic current == alembic heads` immediately after applying.

```sql
-- Contact form submissions (migration 010_create_contact_submissions.py)
contact_submissions (id, name, email, message, created_at)

-- Reviews (migration 011_create_reviews.py)
reviews (id, name, rating, text, approved boolean default false, created_at)
```

New files:
- `backend/app/models/contact_submission.py`, `backend/app/models/review.py` (both registered in `app/models/__init__.py` — this project has previously been bitten by forgetting that step, see section 22 item 14 re: `CoverLetter`; both new models were added correctly this time)
- `backend/app/schemas/contact.py` (`ContactCreate`/`ContactRead`), `backend/app/schemas/review.py` (`ReviewCreate`/`ReviewRead`) — both use Pydantic `field_validator` to reject blank name/message/text server-side, not just client-side
- `backend/app/api/routes/contact.py`, `backend/app/api/routes/reviews.py` — both registered in `main.py`

New endpoints:
```
POST /api/v1/contact/    public, no auth. Validates non-empty name/message + valid email format (422 on failure). Saves to contact_submissions. No email/SMTP sending — DB row only, queried manually for now.

POST /api/v1/reviews/    public, no auth. Validates non-empty name/text + rating 1-5. Always saves with approved=false regardless of input — there is no way for a submitter to self-approve.
GET  /api/v1/reviews/    public. Returns ONLY rows where approved=true, newest first. This is the sole gate preventing spam/fake reviews from appearing immediately.
```

~~⚠️ Approving a review is a manual DB operation — no admin UI exists for this~~ **DONE (session 11)** — `POST /api/v1/admin/reviews/{id}/approve` (admin-only) plus an "Approve" button on `/admin/dashboard` now do this through the app; no more manual `UPDATE reviews SET approved = true` needed. See section 25. This was originally verified end-to-end via manual DB flip (submitted a real review through the actual rendered form, confirmed hidden while `approved=false`, manually flipped it, confirmed it rendered correctly, reverted); session 11 re-verified the same flow but through the real approval button instead of a manual query.

`frontend/lib/api.ts` additions: `contactApi.submit()`, `reviewsApi.list()` / `reviewsApi.submit()` — same axios instance/interceptor pattern as every other API group in that file (JWT attached if present, but neither endpoint requires it).

### 23.4 Design/process notes worth remembering for future public pages

- Every public page needs `SiteHeader` at the top and `SiteFooter` at the bottom, wrapped in a `min-h-screen bg-[#0d1117]` div — copy this shape from any existing public page (`/about` is a good compact reference) rather than reinventing it.
- **Verification method for these pages**: this project has no dedicated Playwright/E2E test suite for the marketing site — verification each time was ad hoc Playwright scripts (launched via `node <script>.js` from `frontend/`, using the locally-installed `playwright` package already in `node_modules`) that screenshot at 1440px and 390px and check `page.on("console", ...)` for errors, written to the scratchpad and deleted after use. There is no `chromium-cli` tool available in this environment — don't assume it exists.
- A background dev server hydration warning (`Warning: Prop dangerouslySetInnerHTML did not match...`) appears on `/` and `/templates` during Playwright checks — this traces back to the Home page's embedded `/cv-template-preview/[templateId]` iframes (Aurora/Nova previews in the hero), is **pre-existing and unrelated to any session-9 change**, and should not be mistaken for a new bug when re-verifying these pages in the future.
- lucide-react coverage check before reaching for a custom SVG: it has `Twitter`, `Linkedin`, `Instagram`, `Facebook`, `Send`, `Star`, `Mail`, `Phone`, `Handshake`, `MessageSquareText` — all used as-is this session. Only TikTok and WhatsApp needed hand-rolled icons (see 23.1).

### 23.5 Home page hero rework + nav/mobile-menu fixes (session 17, 2026-07-22/23)

**Hero, now built on a shared component.** New `frontend/components/templates/TemplatePreviewFrame.tsx` (94 lines) — its own doc comment states the intent directly: *"Used by both the public template gallery and the home page hero mockup so they can never drift into two different (and differently broken) cropping behaviors."* Locks to a real A4 aspect ratio (`aspectRatio: "794 / 1122"`) and scales an iframe via `useLayoutEffect` (not `onLoad`, since React never fires a synthetic `onLoad` for iframes). `app/page.tsx`'s hero (177 lines changed) now renders one CV mockup through this component (`<TemplatePreviewFrame templateId="aurora" accentColor="#111827" photoSize={146} />`) in both its desktop (`hidden xl:block`, absolutely positioned) and mobile (`xl:hidden`, stacked-flow) versions, instead of a one-off hero-specific mockup. Second confirmed usage: `TemplateGalleryCard.tsx` (`<TemplatePreviewFrame templateId={template.id} accentColor={previewColor} />`) — so this is genuinely shared, not just similarly-named.

Within the same hero: **Zeni** (`/zeniai.png`) is now absolutely positioned beside the CV card on desktop, bottom-aligned with the card's own bottom edge "so the two read as one composed pair, not two floating elements" (component's own comment); on mobile it sits next to the ATS score pill instead, in normal flow. The **ATS badge** was repositioned to hang off the card's bottom-left corner, "mostly outside the card... never sits over the middle of the CV content." A new one-line mention of Cover Letters was added under the hero CTAs (*"Matching cover letters generated automatically from your CV"*).

**"Home" nav link** (`fc73644`) — a 3-line addition to `SiteHeader.tsx`, adding a "Home" link as the **first** item in the nav order (before Templates/Pricing/Career Tips/About/Contact).

**Mobile hamburger menu — fixed independently in both places, not via a shared component.** Before: neither `SiteHeader.tsx` (marketing) nor `Navbar.tsx` (dashboard) had *any* mobile nav fallback — both only rendered a `hidden md:flex`/similar desktop-only link row, so nav links were completely unreachable below the `md` breakpoint. `d13256b` fixed both (112 and 85 changed lines respectively) with the **same hand-rolled pattern copy-pasted into each file independently**: a `useState` for open/closed, a `menuRef` + `mousedown` outside-click listener, a `useEffect` that closes the menu on route change, a `Menu`/`X` icon toggle, and a `md:hidden` dropdown panel. There is no shared `useMobileMenu` hook or `MobileMenu` component — worth knowing if either implementation needs a future fix, since it won't automatically apply to the other. See section 22 for this noted as a minor duplication (not a bug) worth consolidating eventually.

---

## 24. Career Mentor Redesign (session 10, 2026-07-14)

### 24.1 Background

Real Pro-tier user testing on the CV Builder found the fixed right-hand AI panel (`RightPanel.tsx`, always visible as the third column) confusing and hard to understand. This directly drove a UX redesign of how the AI assistant surfaces in the product.

The redesign was **deliberately scoped to two sprints only** — Sprint 1 (a floating entry point for the existing AI panel) and Sprint 2 (a new conversational onboarding flow). During planning, a broader "Career Brain" architecture was discussed — a Context Manager (shared current-section/CV/template state), a Writing Coach (live grammar/inline suggestions), Live ATS (background scoring, reframing the ATS Checker as a "Deep Review"), a formal Career Brain v1 orchestration layer, Career Memory (cross-session persistence), an AI Router, and a longer-term Job Platform / Company Hiring AI / Interview Coach vision. None of this was built this session — it's explicitly deferred to a post-launch roadmap (see 24.4), per the reasoning given during planning: **"a Brain with no users is just architecture."**

### 24.2 Sprint 1 — Floating AI entry point

- Removed the fixed 3-column CV Builder desktop layout (`LeftPanel | CentrePanel | RightPanel`) in favor of 2 columns (`LeftPanel | CentrePanel`), giving the CV preview more width. (`frontend/app/(dashboard)/cv-builder/[id]/page.tsx`)
- Added a floating sparkle FAB, `bottom-24 right-4` on mobile / `bottom-6 right-6` on desktop, always visible regardless of active section, opening a slide-in drawer (full width on mobile, `sm:w-[400px]` on desktop) that wraps the existing `RightPanel` component unchanged.
- All existing AI Assistant functionality — per-section actions, Target Role field, CV Score, Quick Fixes, free-tier usage gating, active-section indicator — was preserved exactly; `RightPanel.tsx` itself only changed its outer wrapper (`w-80 border-l` → `w-full h-full`, to fit the new drawer instead of a fixed column) and one label.
- The "AI Assistant" tab inside `RightPanel` was relabeled **"Career Mentor"** (copy-only change, no logic change).
- The old separate mobile purple AI FAB + bottom sheet (`mobileSheet === "ai"`) was removed — superseded by the new drawer, which now appears identically on mobile and desktop. The separate mobile "Sections" FAB/sheet was left untouched (`mobileSheet` narrowed from `"closed" | "sections" | "ai"` to `"closed" | "sections"`).

### 24.3 Sprint 2 — Career Mentor conversational onboarding

**Backend** — new `backend/app/services/career_mentor.py`: a pure, DB-free step engine (no ORM/DB calls in this file) describing the conversation flow. ⚠️ **Grown since session 10 and never re-documented — corrected session 12.** `FLOW` currently has **24 nodes (23 real questions + a terminal `"complete"` node)**, up from the 19/18 originally logged — confirmed by direct read of the current file, not the old count. Three branch points now, not two:
- `has_experience` (Yes → Branch A: `exp_company/exp_title/exp_start/exp_end/exp_work`, with an `exp_work_followup` re-ask if the answer comes back too vague/short; No → falls into `has_projects`)
- `has_projects` (Yes → `project_name/project_work`, same `project_work_followup` vague-answer re-ask pattern; No → skips straight to education, so no phantom empty Experience/Projects section is ever created)
- `has_certifications` (**new**, Yes → `certifications_list`; No → skips straight to `languages`)

New nodes not in the original write-up: `target_role` and `career_stage` (now the first two questions asked, before `has_experience`) and `languages`. `career_stage` (Student / Graduate / Experienced Professional) doesn't just get stored — a new `_STAGE_QUESTION_OVERRIDES` dict swaps in tone-adjusted question wording for `exp_work`/`project_work`/`summary_intro`/`skills` based on the chosen stage (e.g. Students get "even a class project counts," Experienced Professionals get "what was the impact/measurable results"), falling back to the default `FLOW` wording for "Graduate" or anything unrecognized.

All branches converge on a common suffix: `edu_institution/edu_degree/edu_dates`, `skills`, `has_certifications` (→ `certifications_list` or skip), `languages`, `summary_intro/summary_enjoy/summary_years`. The progress bar (`progress_for()`) always assumes the longest path until branch questions are actually answered, so the "Step X of Y" total never has to jump backward mid-conversation.

New route file `backend/app/api/routes/career_mentor.py` (registered in `main.py`, prefix `/career-mentor`), two endpoints:
- `POST /career-mentor/start` — calls the **existing** `cv_routes.create_cv()` to create a real `CVDocument` up front (not a separate draft/staging model), pre-fills the personal_details section with the logged-in user's `full_name`/`email`, then returns the first step.
- `POST /career-mentor/answer` — on most steps just accumulates the answer into a `context` dict passed back and forth with the frontend; on the steps that actually produce CV content it writes into the CV's sections using the **existing** `_write_section_data`/`cv_routes.add_section` patterns (full JSONB reassignment, not in-place mutation). **This list also grew beyond the original "five steps"**: `exp_work`/`exp_work_followup` → Experience, `project_work`/`project_work_followup` → Projects (created via `add_section` if it doesn't exist yet), `edu_dates` → Education, `skills` → Skills, `certifications_list` → Certificates (**new** — created via `add_section` if absent), `languages` → Languages (**new** — only written if the answer is non-empty), `summary_years` → Profile Summary. For `exp_work`/`project_work`/`summary_years` it calls the **existing** `ai_service.improve_cv_text()` (`improve_bullet` / `generate_summary` actions) to turn the user's raw conversational answer into CV-quality text. Still no new AI prompts, no new CV data model — same write path and AI service every other part of the CV Builder already uses.

**Frontend** — new `frontend/app/(dashboard)/cv-builder/onboarding/page.tsx`, a chat-style UI:
- `frontend/lib/api.ts` gained `careerMentorApi.start()` / `.answer()`.
- `/dashboard/templates`' `handleSelect()` no longer creates a CV directly — it now routes to `/cv-builder/onboarding?template={id}` (the direct-create POST and its customization-defaults logic were deleted from that page entirely, not just bypassed).
- Scrolling chat history, text input or button choices depending on the step's `input_type`, a progress bar, and a "Skip for now — I'll fill this in myself" exit that's visible on every screen (routes straight to `/cv-builder/{cvId}`, or `/cv-builder` if the CV hasn't been created yet).
- Originally scoped to the "core 5" sections (Personal Details, Summary, Experience-or-Projects, Education, Skills) — **now also conditionally covers Certificates and Languages** (see the corrected 24.3 above), so it's closer to 7 sections in the branches that answer "Yes" to both `has_certifications` and provide a languages answer. Still not all 16 CV sections — Awards, Publications, Declaration, etc. are left for the user to add manually in the normal editor after onboarding, by design.
- Verified end-to-end with real test accounts: Branch A (has experience), Branch B with a project, Branch B declining both has_experience and has_projects (confirmed no phantom empty Experience/Projects sections get created — matches the backend's conditional section-writing above), the Skip-for-now exit, and mobile at 390px.

### 24.4 Polish pass (visual/experience only — no logic changes)

All in the same `onboarding/page.tsx`, layered on top of the Sprint 2 flow above with no changes to the step engine or write logic:
- A typing indicator (three pulsing dots, `TypingBubble`) shown for ~750ms before each Mentor message reveals.
- A recurring Mentor avatar (the same sparkle mark used on the FAB) on every message bubble.
- Warmer, per-step reactive copy (`getAck()`) acknowledging each answer in a distinct smaller "ack" bubble before the next question appears (e.g. "No worries — let's look at projects instead" when `has_experience` is answered "No").
- A live checklist (`ChecklistPanel`, desktop sidebar / mobile collapsible toggle) showing Personal Details/Experience/Education/Skills/Summary getting checked off as their underlying `context` keys fill in during the conversation, with a brief flash animation on the item that just completed.
- A dedicated `WelcomeScreen` before question 1 ("👋 Welcome to ZenzHire! I'm your Career Mentor...") with its own "Let's start" button, rather than dropping straight into the first question.
- A celebratory completion screen (pulsing ring + checkmark, "🎉 Your CV is ready!") with a plain-language recap of what was built (e.g. "Here's what I built for you — Personal Details, Experience, Education, Skills, and Summary, all ready to review") before handing off to `/cv-builder/{cvId}`.

### 24.5 Post-launch roadmap (explicitly NOT built this session)

Logged here for future reference, not implemented: **Context Manager** (shared current-section/CV/template state across AI features), **Writing Coach** (live grammar/inline suggestions as the user types, distinct from the existing on-demand AI actions), **Live ATS** (background scoring while editing, reframing the ATS Checker as a "Deep Review"), **Career Brain v1** (a formal orchestration layer tying the above together), **Career Memory** (persistence of user preferences/history across sessions), an **AI Router** (dispatching between specialized AI capabilities), and the longer-term **Job Platform / Company Hiring AI / Interview Coach** vision. These were deliberately deferred until real usage data from the Career Mentor onboarding above exists to inform whether/how they should be built — don't start scaffolding any of these without checking whether that data now exists.

### 24.6 "Zeni" persona/name/avatar unification — ✅ CONFIRMED SHIPPED (corrected session 16; was wrongly logged as "still planned, not built" since session 12)

⚠️ **This entire section was stale.** It previously said the rename hadn't happened and all user-facing copy still said "Career Mentor." A direct grep of the current code (session 16) shows the rename is fully live in the product:
- `RightPanel.tsx` — the tab is `<TabBtn id="ai" label="Zeni" />`.
- `(dashboard)/cv-builder/[id]/page.tsx` — the floating FAB's `title`/`aria-label` and the drawer header all say "Zeni" (`title="Zeni"`, `aria-label="Open Zeni AI assistant"`, drawer header `<span>Zeni</span>`).
- `cv-builder/onboarding/page.tsx` — a dedicated `ZeniAvatar` component (replacing the old `MentorAvatar`/`Sparkles`-icon approach) renders `/zeniai.png` on every message bubble; the welcome screen says *"I'm Zeni, your AI Career Partner"*; the chat header, typing indicator (`aria-label="Zeni is typing"`), and the submitting-state copy ("Zeni is responding...") all say "Zeni."

No trace of "Career Mentor" remains in any of these three user-facing surfaces (confirmed by direct grep, not just a spot-check). It's unclear which session actually did this rename — it wasn't logged anywhere in this file until now — but the code is unambiguous that it's done. Nothing further needed here; if a future session finds "Career Mentor" copy anywhere else in the product (it shouldn't, based on this grep), treat that as a newly-discovered miss, not a reversion of this note.

### 24.7 ⚠️ Temporarily DISABLED for launch (session 14, 2026-07-21)

Deliberate, temporary, fully reversible — **not** a removal, and not because anything was found broken. A single feature flag, `CAREER_MENTOR_ENABLED` (`frontend/lib/feature-flags.ts`, currently `false`), controls whether `/dashboard/templates`' `handleSelect()` routes into the onboarding chat (`/cv-builder/onboarding?template=...`) or straight to the normal CV Builder editor. With the flag off, `handleSelect()` falls back to the pre-Sprint-2 direct-create behavior (`POST /cv/` then `router.push(/cv-builder/{id})`) — exactly how "New CV" worked before this feature existed.

Nothing else changed: `career_mentor.py` (backend service + routes), `onboarding/page.tsx` (the chat UI), and all Career Mentor DB writes are completely untouched and still fully functional — hitting `POST /career-mentor/start`/`/answer` directly still works exactly as documented in 24.3. This is purely an entry-point gate, done to reduce risk on launch day while the feature gets more real-world testing (it shipped session 10 and hasn't had a long production track record yet — session 12 also found the "Zeni" rename from 24.6 still pending). **Plan: re-enable by flipping the flag back to `true` in ~2 weeks**, once the polish items from 24.5/24.6 have had another look.

If re-enabling: (1) flip the flag, (2) decide whether 24.6's Zeni rename should land at the same time or stay separately scoped, (3) re-verify both code paths still work post-re-enable — the direct-create fallback and the onboarding-create path now both exist side by side gated by this one flag, and both need to keep working independently.

---

## 25. Admin Dashboard (session 11, 2026-07-18 — rewritten session 12, 2026-07-19)

⚠️ **This entire section was rewritten during the session 12 audit.** The commit that shipped this feature (`e7053aa`) turned out to contain a much bigger `/admin/` section than the previous version of this doc described (which only covered 4 read-only sections from an earlier point in that same session). What follows is verified directly against the current code, not the original write-up.

A full multi-page internal admin tool at `/admin/*` (own `layout.tsx` with sidebar nav — not a single page). **Seven sections as of session 18**: Overview, Users, Reviews, Contact Submissions, Career Tips, Admins, **Earnings (NEW, session 18 — see section 36)**. The "still out of scope: revenue tracking" note below is now resolved by the new Earnings section; editing/deleting regular users and any settings/config management page remain out of scope.

### 25.1 Auth — reused entirely, no parallel system

- `users.is_admin` (`Boolean`, `nullable=False`, `default=False`) added via `alembic/versions/012_add_is_admin_to_users.py` — same `users` table, same JWT/login flow as every other account. `UserRead` (and therefore `GET /auth/me`) includes `is_admin`.
- `require_admin` dependency in `app/api/dependencies.py`:
  ```python
  def require_admin(current_user: User = Depends(get_current_user)) -> User:
      if not current_user.is_admin:
          raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
      return current_user
  ```
  Applied **router-wide**: `router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[Depends(require_admin)])` — every current and future route in `admin.py` is automatically covered, can't forget to gate a new one.
- One seeded admin account, `admin@zenzhireadminit.com`, created through the real `POST /auth/signup` endpoint, then `is_admin` flipped to `true` via a one-off script — not a separate signup path. The Admins page (25.4) now provides a real in-app way to create further admins, so this bootstrap-via-script approach should no longer be needed going forward.
- ⚠️ Any standalone script that queries `User` directly must still import `app.models.cover_letter.CoverLetter` first (see section 22 item 14) — `User.cover_letters` is a string-based `relationship(...)` that SQLAlchemy can't resolve unless `CoverLetter` has been imported into its registry first. **This same gotcha now also applies to `CareerTip`** if a script ever needs `User` alongside career tips, since neither model is imported by `app/models/__init__.py`.

### 25.2 Frontend route protection — client-side guard, not middleware

No `middleware.ts` exists in this codebase; auth is entirely client-side (JWT in a non-httpOnly cookie via `js-cookie`). `frontend/app/admin/layout.tsx` — not each individual page — owns the guard, shared by every `/admin/*` route:
```js
if (!user) { router.replace("/login"); return; }
if (!user.is_admin) { router.replace("/dashboard"); return; }
```
While unauthorized/loading, only a spinner renders — no admin markup, table, or number ever flashes, matching the "don't reveal the route exists" requirement. The layout also owns the sidebar nav and the footer (avatar/name/email, logout, "← Back to app" link to `/dashboard`) — none of that is duplicated per-page.

### 25.3 Sidebar navigation & notification dots

Six items, in this exact order, each with a Lucide icon:

| Label | Route | Notification dot |
|---|---|---|
| Overview | `/admin/dashboard` | none |
| Users | `/admin/users` | none |
| Reviews | `/admin/reviews` | yes — pending review count |
| Contact Submissions | `/admin/contact` | yes — new-submission flag |
| Career Tips | `/admin/career-tips` | none |
| Admins | `/admin/admins` | none |
| Earnings | `/admin/earnings` | none (NEW, session 18 — see section 36) |

Dots are driven by a single `GET /admin/notifications` call, fired once when the admin layout mounts and again on every route change within `/admin/*`:
- Reviews dot: `pending_reviews_count > 0` (count of `Review` rows where `approved=false`). Nothing marks this "viewed" — it only clears once every pending review is actually approved (visiting the Reviews page does not dismiss it).
- Contact dot: a boolean comparing the newest `ContactSubmission.created_at` against the current admin's own `users.contact_last_viewed_at` (new column, `alembic/versions/014_add_contact_last_viewed_to_users.py`). Navigating to `/admin/contact` calls `POST /admin/contact-submissions/mark-viewed` (sets `contact_last_viewed_at = now()` for that admin) immediately before refetching notifications, so this dot clears per-admin as soon as that page is opened.
- This is poll-on-navigation, not real-time — no websocket/interval polling.

### 25.4 The six admin pages

- **Overview** (`admin/dashboard/page.tsx`) — `GET /admin/stats`: 3 stat cards (Total Users, Total CVs, Total Cover Letters) + a "CVs per Template" breakdown grid (group-by count on `CVDocument.template_id`, sorted descending), still using raw `template_id` strings rather than the UI display names from section 6's table. Read-only.
- **Users** (`admin/users/page.tsx`) — **Free / Paid tabs**, each refetching `GET /admin/users?plan=free|pro`. Table: Email, Plan badge, Signup Date, **CVs Created, ATS Analyses** (usage counts per user). Read-only — no edit/delete/upgrade actions, still explicitly out of scope.
- **Reviews** (`admin/reviews/page.tsx`) — **Pending / Approved tabs** with live counts in the tab labels (e.g. `Pending (3)`), both lists fetched on mount (`GET /admin/reviews/pending`, `GET /admin/reviews/approved`). Only the Pending tab has an action: "Approve" → `POST /admin/reviews/{id}/approve` (optimistic row move to Approved). There is no reject/delete endpoint — a pending review can only be approved or left pending.
- **Contact Submissions** (`admin/contact/page.tsx`) — `GET /admin/contact-submissions`, read-only table (Name, Email, Message, Date). Also fires the "mark viewed" call described in 25.3.
- **Career Tips** (`admin/career-tips/page.tsx`) — a real lightweight CMS. See 25.5 below (new this session — it existed in the code before but had never been documented).
- **Admins** (`admin/admins/page.tsx`) — create-admin form + admins table with a per-row "Reset password" action. See 25.6 below (also new this session).

`frontend/lib/api.ts`'s `adminApi` object now covers all of: `stats, pendingReviews, approvedReviews, approveReview, contactSubmissions, markContactViewed, notifications, users, careerTips, createCareerTip, deleteCareerTip, admins, createAdmin, resetAdminPassword` — same axios-instance/interceptor pattern as every other API group in that file.

### 25.5 Career Tips CMS (previously undocumented)

Backend: `career_tips` table (`id, title, image_url, caption, published_at, created_at`), created in `013_create_career_tips.py`; `title` was added a session later in `015_add_title_to_career_tips.py` — the table briefly existed without it. Public, unauthenticated routes (`app/api/routes/career_tips.py`, no `/admin` prefix):
```
GET /api/v1/career-tips/          list all, newest by published_at first
GET /api/v1/career-tips/{id}      single tip, 404 if missing
```
Admin-only management routes live in `admin.py` instead (`GET/POST /admin/career-tips`, `DELETE /admin/career-tips/{id}`).

The admin publish form uses the same `RichTextEditor` component (Tiptap — `@tiptap/react` + `starter-kit` + `Underline`/`TextAlign`/`Link` extensions) that the CV Builder already uses, reused here for the tip's caption. The cover image is read client-side via `FileReader.readAsDataURL` (5MB cap) and submitted as a base64 data URI directly in the `image_url` field — **there is no separate file/blob storage step**; the base64 string is what gets stored in Postgres. This is fine for a low-volume internal tool but would bloat the table and response payloads at any real scale — worth revisiting before this CMS sees heavy use.

⚠️ **There is no publish/unpublish toggle field in the schema.** The admin UI's list-item button is labeled "Unpublish," but it calls `DELETE /admin/career-tips/{id}` — a hard delete, not a status flip. "Publishing" a tip == inserting the row (it's public immediately, no draft state); "unpublishing" == permanently deleting it. If a real draft/publish workflow is ever needed, this will need an actual `is_published` (or similar) column — right now every row in the table is, by definition, already live.

Public pages consuming this: `/career-tips` (list) and `/career-tips/[id]` (detail) — see section 23.2's updated table.

### 25.6 Admins page — create & reset-password flow (previously undocumented)

- **Create admin**: form (full name, email, password) → `POST /admin/admins`. Backend checks email uniqueness across the whole `users` table (400 if taken), then creates a `User` row directly with `is_admin=True` and a bcrypt-hashed password via the same `hash_password()` every signup uses. No email verification or invite step — the creating admin enters a plaintext password directly into the form, which is then sent over the wire and hashed server-side.
- **Reset password**: "Reset password" button on any admin row → `POST /admin/admins/{admin_id}/reset-password`. Backend generates a random password via `secrets.token_urlsafe(12)`, hashes and stores it, and returns the **plaintext** new password in the response body — the only time it's ever shown. The frontend displays it once in a modal ("This is shown only once — copy it now and share it securely.") with a copy-to-clipboard button.
- `GET /admin/admins` lists every `User` row where `is_admin=True`.
- This is the in-app replacement for session 11's original bootstrap approach (a one-off DB script) — new admins no longer need direct DB access to be created.

### 25.7 Backend: full `/admin/*` route list (`app/api/routes/admin.py`, registered in `main.py`)

```
GET  /api/v1/admin/stats                        totals + cvs_per_template
GET  /api/v1/admin/notifications                 pending_reviews_count, new_contact_submissions
GET  /api/v1/admin/reviews/pending               reviews where approved=false, newest first
GET  /api/v1/admin/reviews/approved              reviews where approved=true, newest first
POST /api/v1/admin/reviews/{id}/approve          sets approved=true (no reject/delete route exists)
GET  /api/v1/admin/contact-submissions           all contact_submissions, newest first
POST /api/v1/admin/contact-submissions/mark-viewed   sets current admin's contact_last_viewed_at = now()
GET  /api/v1/admin/users?plan=free|pro           id/email/plan/created_at + cv_count/ats_count, filterable
GET  /api/v1/admin/career-tips                   list, newest first
POST /api/v1/admin/career-tips                   create (201)
DELETE /api/v1/admin/career-tips/{id}            hard delete (204; 404 if missing)
GET  /api/v1/admin/admins                        users where is_admin=true
POST /api/v1/admin/admins                        create new admin (201; 400 if email taken)
POST /api/v1/admin/admins/{admin_id}/reset-password  regenerate & return a random plaintext password
```
All reuse existing models directly (`User`, `CVDocument`, `CoverLetter`, `ContactSubmission`, `Review`, `CareerTip`) — no duplicated tables. Response schemas in `app/schemas/admin.py`; the reviews endpoints reuse the existing `ReviewRead` schema, career tips reuse `CareerTipRead`/`CareerTipCreate`.

---

## 26. Google Sign-In (session 12, 2026-07-19)

Real server-side OAuth 2.0 **Authorization Code flow**, hand-rolled with `httpx` (new dependency, `requirements.txt` — no `authlib`/`google-auth`/OIDC library used). Not a client-side Google Identity Services popup/One Tap — the browser is redirected to Google and back.

### 26.1 Flow

1. `GoogleButton.tsx` → `loginWithGoogle()` (`frontend/lib/auth.ts`) does a plain `window.location.href` navigation to `GET /api/v1/auth/google/login`.
2. `google_login` (`backend/app/api/routes/auth.py`) generates a random `state`, sets it as an httponly cookie, and 302-redirects to `accounts.google.com/o/oauth2/v2/auth` (`response_type=code`, `scope=openid email profile`).
3. Google redirects back to `GET /api/v1/auth/google/callback`, which validates `state` against the cookie, then exchanges the code **server-to-server** for an access token (`httpx.post` to Google's token endpoint) and fetches `email` / `email_verified` / `sub` (→ `google_id`) / `name` from Google's userinfo endpoint.
4. On success, mints ZenzHire's own JWT (`create_access_token(user.id)` — same token type/flow as email/password login) and redirects to `{FRONTEND_URL}/auth/callback#token={token}` (URL **fragment**, not a query param, so the token never lands in server logs).
5. `frontend/app/auth/callback/page.tsx` reads the token out of the URL hash, stores it in the same `token` cookie the rest of the app already uses (via `js-cookie`), and routes to `/dashboard`. No separate auth path downstream — from this point on a Google-originated session is indistinguishable from an email/password one.

### 26.2 Data model changes

`backend/alembic/versions/016_add_google_oauth_to_users.py`:
- `users.hashed_password` changed from `nullable=False` → `nullable=True` (Google-only accounts have no password). ⚠️ The migration's `downgrade()` reverts this to `nullable=False`, which would break any existing Google-only account if ever rolled back — worth remembering before running `alembic downgrade` against a database with real Google signups in it.
- New columns: `google_id` (nullable, populated for Google-linked accounts) and `auth_provider` (distinguishes `"local"` vs `"google"` signups, though nothing currently branches on this value besides account creation — see 26.3).

New env vars (`backend/.env.example`): `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `FRONTEND_URL`. (`STRIPE_*` placeholders were already present before this session and remain unused — see section 22 item 3.)

**Frontend placement**: on both `(auth)/login/page.tsx` and `(auth)/signup/page.tsx`, `<GoogleButton />` sits **below** the email/password form, separated by an "Or" divider (`h-px` gradient lines either side of an uppercase "Or" label) — not above it, and not side-by-side. Same layout on both pages.

### 26.3 ⚠️ Account-linking behavior — silent, no re-authentication

```python
user = db.query(User).filter(User.email == email).first()
if user:
    if not user.google_id:
        user.google_id = google_id
        db.commit()
else:
    user = User(email=email, full_name=full_name, hashed_password=None,
                google_id=google_id, auth_provider="google")
    ...
```
If a Google login's email matches an **existing email/password account**, it is auto-linked — `google_id` is attached with **no password re-entry, no confirmation step, and no check of the existing account's `auth_provider`**. This is intentional convenience (it means a user who signed up with email/password can later just click "Sign in with Google" and land in the same account), but it also means: whoever controls a given email address at Google can sign into the matching ZenzHire account, full stop, regardless of what password was set on it. There's no ID-token signature/`aud`/`iss` verification either (the code trusts the userinfo response from a token it itself validated via the code exchange, which is an acceptable simplification, but there's no defense-in-depth check beyond that). **Flag this for a security pass before relying on it in production** — see section 22 item 18.

---

## 27. Locked Free/Pro Feature Plan (finalized session 12, 2026-07-19) — source of truth, with real enforcement status

This is the authoritative feature/plan matrix, matching `frontend/app/pricing/page.tsx`. **Rewritten session 13 — all 8 rows are now genuinely enforced server-side**, not just documented as a plan. Original session-12 version of this table (mostly frontend-only) is preserved in git history if needed; this replaces it in place rather than appending a correction, per this doc's own convention for significant rewrites (see how section 25 was handled).

Every row below was verified session 13 with a real Free-tier test account and a real Pro test account (`pro_until` set to a future date) making **direct API calls**, not just clicking through the UI — confirming the backend actually rejects over-limit Free requests and actually lifts every limit for Pro.

| Feature | Free | Pro | Actual backend enforcement |
|---|---|---|---|
| CV Templates | 5 templates (classic, academic, minimal, corporate, nova) | All 14 | **Enforced.** `create_cv`/`update_cv` in `backend/app/api/routes/cv.py` reject a non-Pro `template_id` outside `FREE_TEMPLATE_IDS` (new constant, `backend/app/models/cv_document.py`) with a 403 explaining the upgrade. |
| CVs | 1 CV, unlimited PDF downloads of it | Unlimited, unlimited downloads | **Enforced.** `create_cv` and `duplicate_cv` both count the user's existing `CVDocument` rows and reject a 2nd for Free with a clear 403 message. |
| Cover Letters | 1 saved, unlimited downloads | Unlimited | **Enforced.** Same pattern as CVs, in `create_cover_letter`/`duplicate_cover_letter`. |
| ATS Checker | 5 checks total (lifetime) | Unlimited | **Enforced** — unchanged logic (counts `ATSResult` rows), but switched from `current_user.plan == "free"` onto the new `is_pro` check for consistency with everything else. |
| Career Mentor (Zeni) onboarding | Included (free for all) | Unlimited, repeatable per new CV | **Still not separately capped**, but the stated rationale ("naturally bounded by the 1-CV limit") now actually holds, since CVs themselves are capped at 1 for Free as of this session. |
| Zeni ongoing AI help | 3 uses/day | Unlimited | **Enforced, and the number mismatch is fixed.** New `users.ai_usage_count`/`ai_usage_date` columns track real per-day usage server-side in `POST /cv/ai/improve`; Free is capped at 3/day (was coded as 5 client-side, see session 12 item 19 — frontend `AI_FREE_LIMIT` constant also corrected to 3 to match). |
| CV Score | Basic overall score only | Full 8 sub-score breakdown + history | **Enforced server-side.** New `GET /cv/{id}/score` endpoint (`backend/app/services/score_service.py`, a faithful Python port of `RightPanel.tsx`'s scoring functions) omits `sub_scores` entirely from the response body for Free users — not computed-then-hidden, genuinely withheld. |
| Auto Fix | Locked | Included | **Enforced.** `AIImproveRequest` gained an `is_auto_fix` flag; `POST /cv/ai/improve` returns 403 for any Free-plan request with that flag set, before touching the AI service. |
| Job Match Score | Locked | Included | **Enforced.** New `POST /cv/{id}/job-match` endpoint (same `score_service.py` port) requires `is_pro`; no client-side equivalent computation is exposed to Free users' data. |

### 27.1 `pro_until` / `is_pro` — the new enforcement primitive

`users.plan` (the old `free`/`pro` enum) is **no longer the source of truth for access** — it's now just a display label. The real check, everywhere, is:

```python
# backend/app/models/user.py
@property
def is_pro(self) -> bool:
    return self.pro_until is not None and self.pro_until > datetime.now(timezone.utc)
```

`pro_until` (nullable `DateTime(timezone=True)`, migration `017_add_pro_until_ai_usage`) is `NULL` for a user who has never been Pro, or a future datetime for active Pro access — this is what makes the 7-Day Pass representable as a real time-limited entitlement (session 12 item 21, now resolved) instead of just a Pricing-page line item. `require_pro` (`backend/app/api/dependencies.py`) and every inline plan check across `ats.py`/`cv.py`/`cover_letter.py` now read `current_user.is_pro`, not `current_user.plan`.

**⚠️ Known gap:** nothing currently reverts `plan` back to `"free"` when `pro_until` expires — `is_pro` still correctly returns `false` after expiry (it's computed live, not cached), so **enforcement is unaffected**, but the `plan` label can drift stale in the admin user list until the next real purchase resets it. Not fixed this session; low priority since it's cosmetic-only.

### 27.2 Pricing (unchanged, still matches `frontend/app/pricing/page.tsx` exactly)

- **Free** — $0/month.
- **7-Day Pass** — $2.99 one-time, full Pro feature access for 7 days, no auto-renewal. **Now backed by a real `pro_until` expiry** (session 12 item 21 caveat resolved) — see section 28.
- **Pro Monthly** — $9.99/month.
- **Pro Yearly** — $79.99/year (displayed as $6.67/month, "Save 33%"), default toggle position.
- CTA buttons (`Upgrade to Pro`, `Get 7-Day Access`) now call the real `POST /billing/checkout` flow for logged-in users (see section 28) instead of linking to `/signup`; `Get Started Free` still links to `/signup` as before, since Free doesn't require checkout.

### 27.3 Plan-limit failures now surface via a real dialog, not `alert()` (session 14, 2026-07-21)

Every row in the table above that can reject a Free-tier request now shows a proper in-app `PlanLimitDialog` (`frontend/components/shared/PlanLimitDialog.tsx`) instead of a raw browser `alert()` popup — built on the app's existing shared `Dialog` primitive rather than a new one-off component, and reused as-is across every call site: CV creation, cover letter creation, Auto Fix, the AI daily limit, and (new this session) the CV Builder's own template switcher.

`LeftPanel.tsx`'s template picker previously let a Free user click any of the 9 Pro templates with zero indication anything was locked — the click either round-tripped to the backend and came back as a raw 403, or (see below, for cover letters) nothing happened at all. It now visually locks Pro templates (small lock icon + dimmed/muted styling, consistent with the gallery pages' own Free/Pro treatment) and shows `PlanLimitDialog` immediately on click, with no wasted round-trip. Free templates are now listed before Pro ones in the picker too, matching the gallery's ordering convention.

**Two previously-completely-silent failures found and fixed while doing this**: cover letter creation — both the dashboard's "Cover Letter" quick-action button and the cover-letter list page's "New Cover Letter" button — had **no error handling at all** on the create call. A Free user who already had their 1 cover letter got no dialog, no toast, no console error a human would ever notice — just a silently-failed click. Both now go through the same `PlanLimitDialog` pattern as everything else. See section 22 item 25.

---

## 28. PAYable Payment Integration (session 13, 2026-07-19 — verified end-to-end session 14, 2026-07-21)

Real money flow for the Pro/7-Day Pass upgrades described in section 27. Built against **PAYable's Direct API** (not Stripe — see section 22 item 3). **Status: fully verified end-to-end in sandbox as of session 14** — a real sandbox payment was completed, the webhook was received and independently verified, and `pro_until` was confirmed correctly set on the test account. See 28.4/28.5. Still running on temporary infrastructure (ngrok tunnels, sandbox credentials) — see 28.5 for what production deployment still needs.

### 28.1 Backend

New/changed, all under `backend/`:

| File | Purpose |
|---|---|
| `app/core/config.py` | New typed `Settings` fields: `payable_env`, `payable_merchant_key`, `payable_merchant_token`, `payable_business_key`, `payable_business_token`, `payable_origin_domain`, `payable_webhook_url`, plus `backend_url` (used to build the `returnUrl` PAYable redirects the customer's browser to). All read from `.env`, never hardcoded. |
| `app/models/billing_transaction.py` | New `BillingTransaction` table (migration `018_create_billing_transactions`) — `user_id`, `plan`, `invoice_id` (unique), `amount`, `currency_code`, `status` (`pending`/`success`/`failed`), `payable_order_id`, `payable_transaction_id`, `raw_webhook_payload` (JSONB), timestamps. This is the webhook's lookup table (by `invoice_id`) and idempotency guard, and doubles as an audit trail — deliberately not just parsing the invoice ID string back apart. |
| `app/services/billing.py` | The PAYable client. `PLAN_CONFIG` maps `monthly`/`yearly`/`pass7` → amount (`"9.99"`/`"79.99"`/`"2.99"`, USD, matching section 27.2's pricing exactly) and `pro_until` extension in days (30/365/7). `_get_access_token()` does the Direct Auth call (Basic `base64(businessKey:businessToken)` → Bearer token). `_checkout_check_value()` / `_webhook_check_value()` implement PAYable's two documented SHA512 digest formulas exactly (checkout: `merchantKey\|invoiceId\|amount\|currencyCode\|SHA512(merchantToken)`, uppercased and outer-hashed; webhook: same shape plus `payableOrderId`/`payableTransactionId`/`statusCode`/`invoiceNo`). `create_checkout_session()` computes the amount server-side from the plan (never trusts a price from the frontend), creates the `BillingTransaction` row, and returns PAYable's `paymentPage` URL. `handle_webhook()` verifies the incoming `checkValue` with a timing-safe comparison (`hmac.compare_digest`) before trusting anything else in the payload, looks up the transaction by `invoiceNo`, and on `statusMessage == "SUCCESS"` extends `pro_until` **from whichever is later — `now()` or the user's current `pro_until`** (so a renewal before expiry doesn't waste remaining time), guarded so a duplicate webhook delivery for an already-`"success"` transaction is a no-op rather than double-extending. |
| `app/api/routes/billing.py` | `POST /billing/checkout` (authenticated) → `CheckoutResponse{payment_page, invoice_id}`. `POST /billing/webhook` (public, no auth — PAYable calls this server-to-server; authenticity comes from the `checkValue` digest, not a session) → always responds `{"Status": 200}` per PAYable's doc, even when the invoice isn't found (logged for manual review, not crashed) — a `checkValue` mismatch is the one case that gets a real `400` instead, since that's a genuine forged/corrupted request. `GET /billing/return` (public) → 302 redirect to the frontend `/billing/return` page; deliberately does **no** plan activation itself, since the customer's browser landing here is not guaranteed (they could close the tab) — only the webhook grants access. |
| `app/api/routes/admin.py` | New `POST /admin/users/{id}/set-pro` (already behind the router's existing `require_admin` dependency) — manually sets/clears a user's `pro_until` for support cases (refunds, goodwill, chargebacks, or — right now — working around section 28.4's blocker for internal testing once credentials are fixed). This is the "admin-settable `pro_until`" escape hatch flagged as missing in session 12 item 21/section 27.1; real upgrades go through the webhook, this is the manual override. |
| `app/schemas/billing.py`, `app/schemas/user.py`, `app/schemas/admin.py` | `CheckoutRequest` (plan + billing/phone fields, see 28.2), `CheckoutResponse`, `AdminSetProRequest`/`Response`. `UserRead` and `AdminUserRead` both gained `pro_until` and `is_pro` fields — **this matters**, see 28.3. |

`app/models/__init__.py` also now imports `BillingTransaction` (kept the section-22-item-14 gotcha in mind this time).

### 28.2 Frontend

- `frontend/components/billing/BillingModal.tsx` — new. PAYable's standard (non-"Optional Mode") checkout requires `customerMobilePhone` and a full billing address, and nothing in this app collects either anywhere today (deliberate choice, confirmed with the project owner rather than sending fabricated placeholder data to a live payment processor) — this modal collects phone/street/city/postcode/country right before redirect, prefilling nothing since we don't have the data yet.
- `frontend/app/pricing/page.tsx` — `Upgrade to Pro`/`Get 7-Day Access` are now buttons: logged-out → `/signup` (unchanged), logged-in → open `BillingModal` → `POST /billing/checkout` → `window.location.href = payment_page`.
- `frontend/app/billing/return/page.tsx` — new. Lands here after the backend's `GET /billing/return` redirect. Calls `useAuth()`'s `refetch()` once (webhook may land a moment after the browser redirect does — this page does not block on it) and auto-redirects to `/dashboard` after 4s, with an immediate manual link too.
- `frontend/lib/api.ts` — new `billingApi.checkout()`.
- `frontend/types/index.ts` — `User` interface gained `pro_until`/`is_pro`, matching the backend schema change.

### 28.3 The `isPro`-everywhere fix (important, found mid-session)

Before this session, every frontend page derived Pro status as `user?.plan === "pro"` (`Navbar.tsx`, `ats-checker/page.tsx`, `dashboard/templates/page.tsx`, `cv-builder/[id]/page.tsx`). Section 27.1 explains why that's now wrong: `plan` is a cosmetic label, and **nothing in the webhook flow sets it directly to `"pro"` except as a side effect** of a successful payment (`handle_webhook` does set `user.plan = PlanType.pro` for admin-list cosmetics, but the real gate was always meant to be `pro_until`/`is_pro`). Left unfixed, a real paying customer would have a correctly-updated backend (`is_pro` returning `true`, every API limit correctly lifted) but a frontend that still rendered every Pro feature as locked, because it was reading the wrong field. All four files switched to `user?.is_pro`.

### 28.4 Sandbox verification — RESOLVED, fully verified end-to-end (session 14, 2026-07-21)

Session 13 left this blocked: `POST https://sandboxipgpayment.payable.lk/ipg/auth/direct-api` was returning `404 {"status":404,"error":"Invalid authentication"}` for our `PAYABLE_BUSINESS_KEY`/`PAYABLE_BUSINESS_TOKEN`, reproduced identically on two separate days, confirmed external since it fails before any of this integration's own `checkValue` logic runs. **This was in fact a PAYable-side provisioning/credential issue, since resolved by PAYable** — no code or credential change was needed on our end; the exact same request that 404'd in session 13 now succeeds.

Full round-trip completed and verified this session:
1. **Checkout session creation** — `POST /billing/checkout` successfully authenticates via Direct Auth, computes the `checkValue` digest, and gets back a real `paymentPage` URL from PAYable's sandbox.
2. **Real sandbox payment completed** — paid through PAYable's hosted checkout page using a Visa test card, including the 3-D Secure step via PAYable's ACS Emulator (the sandbox's stand-in for a real bank's 3DS challenge).
3. **Webhook received and independently verified, not just trusted** — `POST /billing/webhook` received a real callback from PAYable. Verification here means more than "no error was thrown": the `checkValue` in the incoming payload was recomputed locally from the raw payload fields using the exact same SHA512 formula `handle_webhook()` uses, and the recomputed digest was confirmed to match PAYable's value **byte-for-byte** before trusting anything else in the payload — this rules out the failure mode where a webhook handler silently accepts a malformed or forged callback because its signature check has a bug that happens to always pass.
4. **`pro_until` confirmed correctly set** on the real test account afterward, matching the expected extension for the plan purchased (see `PLAN_CONFIG` in `billing.py` for the day counts per plan).

**What's still temporary, not yet production-ready:**
- The webhook and return URLs currently point at **ngrok tunnels** (`PAYABLE_WEBHOOK_URL`, `BACKEND_URL`, `FRONTEND_URL` in `.env`), which rotate their public URL on every restart. Fine for continued sandbox testing, but **must** be replaced with the real deployed backend/frontend URLs before this can work for real users — not optional cleanup, a hard requirement, same caveat session 13 already flagged here.
- `.env`'s `PAYABLE_ENV=sandbox` and the sandbox merchant/business credentials are still in use. Going live requires switching to PAYable's production environment and real (non-sandbox) credentials — a separate step from the tunnel-URL swap above, both needed before any real customer can pay.

### 28.5 Production checklist (added session 14, so this isn't rediscovered later)

Before this can take real payments:
1. Deploy the backend somewhere with a stable public URL (Railway, per section 21's existing deployment plan) and point `BACKEND_URL`/`PAYABLE_WEBHOOK_URL` at it — no more ngrok.
2. Deploy the frontend (Vercel, per section 21) and point `FRONTEND_URL` at it.
3. Switch `PAYABLE_ENV` to production and swap in PAYable's live merchant/business credentials — confirm with PAYable whether this requires a separate application/approval step beyond just having sandbox access working.
4. Re-run the same end-to-end verification this section describes (checkout → real payment → webhook → `pro_until`) once against production credentials before considering this launch-ready — sandbox success doesn't guarantee production credentials/webhook URL are configured correctly on PAYable's dashboard.

---

## 29. Email Infrastructure (NEW, session 14, 2026-07-21)

Real outbound email, sent via Gmail SMTP — nothing in this codebase sent a real email before this session (the existing `contact_submissions` table, section 23.3, was explicitly documented as DB-only with a note "No email/SMTP sending" — that note is now out of date, see below).

**`backend/app/services/email.py`** — new, single shared `send_email(to, subject, body, html_body=None)` function using Python's stdlib `smtplib`/`email.message` (no new dependency — deliberately not `fastapi-mail`, stdlib was sufficient). Connects to `SMTP_HOST`/`SMTP_PORT` (Gmail: `smtp.gmail.com`/`587`), `STARTTLS`, authenticates with `SMTP_USER`/`SMTP_PASSWORD` (a Gmail **App Password**, not the account's real login password — Gmail rejects plain account passwords for SMTP), sends from `SMTP_FROM`. Returns `True`/`False` rather than raising, so callers can decide whether a failed send should block the primary action — every current caller treats email as best-effort/additive and does not fail the request if sending fails (logged via `logger.exception` instead).

New `Settings` fields (`backend/app/core/config.py`), all read from `.env`, never hardcoded: `smtp_host`, `smtp_port`, `smtp_user`, `smtp_password`, `smtp_from`, `contact_notify_email` (the address contact-form notifications go to — falls back to `smtp_from`/`smtp_user` if unset).

**Used by:**
- **Contact form** (`backend/app/api/routes/contact.py`) — after the existing DB save (unchanged, additive not replacing), sends a notification email to `contact_notify_email` with the submitter's name/email/message.
- **Password reset** (section 30) — the reset link email.

⚠️ **Verification method worth remembering**: the natural first check is `send_email()`'s return value plus absence of a logged exception — necessary but not sufficient, since a message can be accepted by the SMTP server and still never reach an inbox (e.g. spam filtering). The stronger check that actually closed this out was confirming **real delivered emails** in the target inbox. Apply the same standard to any future email feature: "no error was thrown" is not the same claim as "the email arrived."

---

## 30. Password Reset Flow (NEW, session 14, 2026-07-21)

Full forgot-password → email → reset-password flow, using the email infrastructure from section 29.

**Data model**: `backend/alembic/versions/019_add_password_reset_to_users.py` — new `users.password_reset_token` (string, unique, indexed, nullable) and `users.password_reset_expires` (`DateTime(timezone=True)`, nullable). Confirmed `alembic current == alembic heads == 019_add_password_reset` after applying.

**Backend** (`backend/app/api/routes/auth.py`):
- `POST /auth/forgot-password` — looks up the user by email. **Always returns the identical generic message** (`"If that email exists, we've sent a password reset link."`) regardless of whether the email exists, to avoid leaking account existence — verified directly: a real registered email and a made-up one both get byte-identical responses, and only the real one triggers a DB write + email. If found, generates a token via `generate_reset_token()` (`secrets.token_urlsafe(32)`, new in `backend/app/core/security.py`), sets a 1-hour expiry (`PASSWORD_RESET_TOKEN_EXPIRE_MINUTES = 60`), and emails a link to `{FRONTEND_URL}/reset-password?token=...`.
- `POST /auth/reset-password` — validates the token exists and hasn't expired (400 with a clear message if not — same message for both "invalid" and "expired," doesn't distinguish, another small anti-enumeration choice), re-runs the **same** `password_strength_error()` validator signup uses (not a separate/looser check), then hashes and sets the new password, clears both `password_reset_token`/`password_reset_expires` (so the token is single-use — verified a reused token is rejected after a successful reset).

**Frontend**: `/forgot-password` and `/reset-password` pages (`frontend/app/(auth)/`), styled identically to the existing login/signup auth pages (same gradient hero shell). `/reset-password` reuses signup's exact password field pattern — `PasswordStrengthMeter` + the same zod schema shape — rather than reimplementing validation. `frontend/lib/auth.ts` gained `forgotPassword()`/`resetPassword()`. Login page gained a "Forgot password?" link next to the password field.

**Verified end-to-end**, not just unit-level: non-existent email → generic response, no DB write, no email sent; invalid random token → rejected; a real token with its expiry manually backdated → rejected (same message); a valid token with a weak new password → rejected server-side with the specific missing-requirements message (proving the strength check isn't only client-side); a valid token with a strong password → success, confirmed via direct login calls that the **old** password now fails (401) and the **new** one works (200); the used token rejected on a second attempt. Also driven through the actual browser UI once (not just API calls) to confirm the real user-facing flow — login → "Forgot password?" → submit → success screen → (grabbed the real token) → `/reset-password?token=...` → typed a new password, watched the strength meter update live → submit → success screen → confirmed via API that the new password works.

---

## 31. Profile Page (NEW, session 14, 2026-07-21)

New `/dashboard/profile` (`frontend/app/(dashboard)/profile/page.tsx`), linked from the navbar (`Navbar.tsx` gained a "Profile" nav link, and the avatar circle is now also a link to it — previously purely decorative).

**Account info**: name, email, "Member since" (`user.created_at`), and an inline **Change Password** form (current password + new password + confirm, same `PasswordStrengthMeter`/strength-validator reuse as section 30) — collapses back to a link on success/cancel rather than being a separate page/modal.

**Backend**: `POST /auth/change-password` (new, `auth.py`) — verifies the current password via `verify_password()` before allowing a change (401 if wrong), re-runs the same `password_strength_error()` validator as everywhere else. `GET /auth/usage-stats` (new) returns real, live-computed usage:
```
{ cv_count, cv_limit, ats_count, ats_limit, ai_usage_count, ai_usage_limit, active_plan }
```
`*_limit` fields are `null` for Pro users (rendered as "Unlimited"), or the actual Free-tier constant otherwise. **Deliberately imports the limit constants directly from `cv.py`/`ats.py`** (`FREE_CV_LIMIT`, `AI_FREE_DAILY_LIMIT`, `ats.py`'s `FREE_LIMIT`) rather than redefining them in `auth.py` — same "single source of truth, no duplicated list to drift" principle already established for the template Free/Pro split (section 6) and applied again here on purpose. `ai_usage_count` specifically re-implements the **same lazy daily-reset check** `cv.py`'s `ai_improve_text` uses (`ai_usage_count` only reflects today's usage if `ai_usage_date == today`, else it's stale from a previous day and should read as 0) — reading the raw column directly without this check would show yesterday's count as if it were today's, a subtle bug that's easy to miss since the column itself doesn't self-clear until the user's next AI call.

**Subscription section**: Free/Pro badge; for Pro, also shows the specific plan type (Monthly/Yearly/7-Day Pass) when determinable — resolved from the user's most recent **successful** `BillingTransaction` row (`billing_transactions.plan`, section 28.1), since `users.plan` itself only distinguishes free/pro, not billing cadence — plus "Expires on {date}" pulled directly from the real `pro_until`. "Upgrade to Pro" (Free) / "Manage Subscription" (Pro) both link to `/pricing`.

**Usage section**: 3 stat tiles (CVs Created, ATS Checks (lifetime), Zeni Chats Today) pulling from `usage-stats` above — genuinely real numbers, not hardcoded placeholders.

Sign-out button also duplicated here (already exists in the navbar) for convenience.

**Verified with real accounts**, both API-level and through the actual rendered page: a Free account seeded with 1 CV / 1 ATS check / 1 AI use today showed `1 of 1` / `1 of 5` / `1 of 3` correctly. Change-password confirmed via re-login (old password fails, new one works), both via direct API and by actually clicking through the profile page's form in a browser. A Pro account seeded with a `yearly` `BillingTransaction` and a future `pro_until` showed "Pro · Yearly," the correct expiry date, and "Unlimited" on all three usage tiles.

---

## 32. ⚠️ TESTING STILL OUTSTANDING BEFORE LAUNCH — HIGH PRIORITY (session 14, 2026-07-21)

None of the items below were found broken — they simply **have not been checked this session**, because session time went to the email/password-reset/profile work in sections 29-31 instead. Treat this as a pre-launch blocker list, not a nice-to-have.

1. **Full 14-template regression pass — plan already written, not yet executed.** Earlier this session a full regression test plan was designed covering, per template: selection/lock state (Free vs Pro, now also relevant to the new `PlanLimitDialog` lock UI in 27.3), live preview rendering, PDF export zero-px parity with the live preview, full-content-fill behavior (long CVs, pagination), customization options (accent color/font/spacing/heading style/skill style), and photo upload. The plan exists but was never run against the actual app this session.
2. **Cover Letter feature — no systematic test pass this session.** AI generation, PDF export, template matching (8 templates, section 12), and the 1-free-limit enforcement (which this session's own 27.3 fix directly touched — the dashboard quick-action and list-page "New Cover Letter" button both had their error handling changed) have not been re-verified beyond the specific limit-dialog check already covered in 27.3.
3. **ATS Checker — no systematic test pass this session.** All 7 analysis layers (section 18), the 5-lifetime-check limit enforcement, and the Free-vs-Pro-unlimited behavior have not been touched or re-verified this session.

**Next session should run all three before considering this build launch-ready.**

---

## 33. Mobile CV Builder Zoom (session 17, 2026-07-23)

`git show 0d3319b` — a "fit to screen" zoom calculation for the CV Builder on mobile viewports (`frontend/app/(dashboard)/cv-builder/[id]/page.tsx`). Zoom state type widened from a closed `75 | 100 | 125` union to a plain `number`, and a new mount-only effect added:
```js
useEffect(() => {
  if (window.innerWidth >= 768) return;
  const availableWidth = window.innerWidth - 48; // matches CentrePanel's 24px flex padding on each side
  const fitPercent = Math.floor((availableWidth / 794) * 100); // 794 = A4_W
  setZoom(Math.max(25, Math.min(100, fitPercent)));
}, []);
```
(`794` is `A4_W`, the CV page-width constant already defined in `CentrePanel.tsx`.)

⚠️ **This is a one-time calculation on mount (`[]` dependency array), not a live-recalculated one.** It does not re-run on window resize or device rotation — a user who rotates their phone or resizes a split-screen window keeps whatever zoom was computed at the moment the page first loaded. `CentrePanel.tsx`'s own diff only widened its `Props` types to accept a plain `number` — no zoom-calculation logic lives there, and its toolbar still only exposes 3 fixed preset buttons (`75/100/125`). Since the computed mobile-fit value is an arbitrary integer (clamped 25–100), it generally won't exactly match any of those 3 presets, so none will render as visually "active" until the user manually taps one. Not a launch blocker, but worth fixing properly (a `resize`/`orientationchange` listener, or a `ResizeObserver` on the CV Builder's container) before calling mobile CV editing fully polished.

---

## 34. Small UX Fixes (session 17, 2026-07-22/23)

All from the same `4e27999` commit, verified against current HEAD.

### 34.1 Delete confirmation dialogs
New `frontend/components/shared/DeleteConfirmDialog.tsx` (55 lines) — a real modal ("Are you sure you want to delete '{itemName}'? This cannot be undone.") replacing raw `window.confirm()` calls. Used in both `cv-builder/page.tsx` and `cover-letter/page.tsx` (confirmed zero remaining `window.confirm` calls in either file).

### 34.2 Subskills removed from the Skills editor UI — non-destructive
`frontend/components/cv-builder/SectionForms.tsx` lost the `RichTextEditor`-based "Subskills / Details" sub-field block from `SkillsForm`'s UI. The underlying `entry.subskills` data field is untouched: new skill entries are still created with `subskills: ""`, `RightPanel.tsx`'s AI-assist flow still reads/writes it, and `ModernTemplate.tsx` still renders it in the exported CV. This is a UI-only removal — any CV with existing subskills content keeps rendering it in the output, the user simply can't edit that specific field from the Skills form panel anymore.

### 34.3 Download Success popup
New `frontend/components/shared/DownloadSuccessDialog.tsx` (84 lines) — shown after a successful CV or Cover Letter PDF download (`CentrePanel.tsx` for CVs, `cover-letter/[id]/page.tsx` for cover letters), with a checkmark header, a "Follow us" row (rendering `SOCIAL_LINKS`, hidden entirely if empty), a "Share ZenzHire with a friend" row (`SHARE_LINKS`), and a link to `/reviews`. **Shows on every successful download, not just the first** — no `localStorage`/one-time gating exists at either call site.

### 34.4 Centralized social/share links
Two new files, previously each page/component defined its own local, partially-placeholder (`href: "#"`) link arrays:
- `frontend/lib/social-links.ts` — `SOCIAL_LINKS`, built from `NEXT_PUBLIC_FACEBOOK_URL`/`INSTAGRAM_URL`/`LINKEDIN_URL`/`TIKTOK_URL`/`TWITTER_URL`/`WHATSAPP_URL` (all in `frontend/.env.example`, all empty by default) — "any left empty are hidden rather than rendered as dead links." This is the "our own profile pages" set (footer follow-us row, `DownloadSuccessDialog`).
- `frontend/lib/share-links.ts` — `SHARE_LINKS`, hardcoded pre-filled share-intent URLs (Twitter/Facebook/LinkedIn/WhatsApp) built from a constant `SITE_URL = "https://zenzhire.com"` — needs no env vars since the share target is always ZenzHire itself, not a per-deployment profile URL.

`SiteFooter.tsx` now imports both instead of maintaining its own local arrays (Telegram is the one remaining hardcoded `href="#"` placeholder in the follow-us row, since it has no dedicated env var).

---

## 35. Production Deployment (session 17, 2026-07-22/23 — reported by project owner, partially independently verified session 18)

⚠️ **Verification note:** the facts below about the live production server (Nginx config, PAYable production credentials, the production admin account) were done directly on the remote production server/DB, outside of any coding session in this repo — there is no local trace of them (no `nginx.conf`, deployment script, or `DEPLOY.md` exists anywhere in this repo; confirmed by search). They're recorded here as reported, not independently re-derived from code. The one claim that *is* independently checkable from this machine — the local dev `.env`'s PAYable environment — **was checked directly, and contradicts what was assumed**. See 35.3.

### 35.1 Architecture
Both backend and frontend are deployed and live on the real production server. Routing is handled by Nginx on a single domain, no separate API subdomain:
- `zenzhire.com` → proxied to the Next.js frontend on `:3000`
- `zenzhire.com/api` → proxied to the FastAPI backend on `:8000`

This resolves what was previously listed as entirely undone in section 21 (item 10, "Production Deployment — Vercel + Railway + Supabase") — the actual deployment target ended up being a single Nginx-fronted server, not the Vercel/Railway/Supabase split originally planned. That planning note should be treated as superseded, not as a description of what was actually built.

### 35.2 PAYable — confirmed live in production
Production's `PAYABLE_ENV=live`, with real (non-sandbox) merchant/business credentials and a real (non-ngrok) webhook URL pointed at the production backend. This is the step section 28.5's production checklist called out as still needed as of session 14 — it's now done, on the production server specifically.

### 35.3 ⚠️ Local dev `.env` was NOT reverted to sandbox — verified session 18, active risk
Directly checked `backend/.env` on this local dev machine (session 18, 2026-07-24):
```
FRONTEND_URL=https://<ngrok-subdomain>.ngrok-free.app
BACKEND_URL=https://<ngrok-subdomain>.ngrok-free.app
PAYABLE_ENV=live
PAYABLE_WEBHOOK_URL=https://<ngrok-subdomain>.ngrok-free.app/api/v1/billing/webhook
```
This is **not** sandbox — local dev is currently configured with `PAYABLE_ENV=live` and real-looking merchant/business key/token values, still pointed at temporary ngrok tunnel URLs rather than either the sandbox environment or the real production URLs. **Practical risk**: running a checkout from this local dev environment right now would attempt to hit PAYable's real production API with live credentials, not a sandbox — any successful payment would be a real charge, and any webhook delivery would depend on whichever ngrok tunnel happens to be running at that moment. This should be reverted to `PAYABLE_ENV=sandbox` with sandbox credentials before any further local billing-flow testing. See section 22 for this logged as an open action item.

### 35.4 Production admin account
A production admin account was created directly on the production database (not via any local script or migration in this repo) — separate from the local dev admin accounts documented in section 25.1 (`admin@zenzhireadminit.com`, plus whichever accounts have since been flipped to `is_admin=true` locally, e.g. `it23565876@my.sliit.lk` as of session 18).

### 35.5 ⚠️ Operational lesson: local dev and production are fully separate — nothing carries over automatically
Local dev and production run against **separate databases and separate `.env` files** entirely. Any account, `is_admin` flag, Pro/`pro_until` status, or test data set up on the local dev DB has no effect on production, and vice versa — the same setup step (e.g. "make this user an admin," "grant this account permanent Pro") must be performed **twice**, once per environment, if it's needed in both. Worth remembering before assuming a locally-verified account/permission state is also true in production, or reporting a production issue as fixed because the equivalent local-dev fix worked.

### 35.6 Minor cleanup found during the session 18 audit
Two stray process-ID files were accidentally committed to git in `4e27999`: `backend/_uvicorn.pid` and `frontend/_next2.pid`. Harmless (not read by any code path), but should be deleted and `.gitignore`'d rather than left tracked — see section 22.

---

## 36. Admin Dashboard — Earnings (session 18, 2026-07-24)

New `/admin/earnings` page, added as a 7th sidebar item (`Overview, Users, Reviews, Contact Submissions, Career Tips, Admins, Earnings`) to the existing `admin/layout.tsx` — same `require_admin`-gated pattern (section 25.1) as every other admin route, same dashboard shell/styling, no new design system, no new tables. Reads exclusively from the existing `BillingTransaction`/`User` tables — no new data collection.

### 36.1 Backend — 3 new endpoints (`backend/app/api/routes/admin.py`, `backend/app/schemas/admin.py`)
- `GET /admin/earnings/stats` → `AdminEarningsStats`: total revenue, revenue this month, revenue today (all `status == "success"` transactions, `amount` cast from its native `String` column to `Numeric` for SQL-side summing), revenue-by-plan breakdown (keyed off `PLAN_CONFIG`'s plan ids from `services/billing.py`, so it can't drift from the real plan list), total Pro/Free counts, conversion rate, and new-signup counts for the last 7 days / current calendar month.
- `GET /admin/earnings/transactions` → `AdminTransactionRead[]`, joined to `User.email`, with optional `status`/`search` (by email, case-insensitive) query filters — unpaginated, matching every other admin list endpoint's existing convention (section 25's `list_users` etc.).
- `GET /admin/earnings/pro-members` → `AdminProMemberRead[]`, every currently-active Pro user (`pro_until IS NOT NULL AND pro_until > now()`), sorted `pro_until` ascending, with `plan` derived from each user's most recent **successful** `BillingTransaction` (falls back to `"unknown"` for accounts made Pro via the admin manual-override endpoint rather than a real purchase — e.g. the permanent-Pro test account, which correctly shows `"unknown"` since it has no purchase record).

No Alembic migration needed — purely new read endpoints over existing columns.

### 36.2 Frontend
`frontend/app/admin/earnings/page.tsx` (new), reusing the exact existing stat-card/table/tab/badge Tailwind classes from `admin/dashboard/page.tsx` and `admin/users/page.tsx` (dark navy `#0d1117`/`#161b22`/`#30363d` palette, same table/badge patterns). New `formatCurrency()` helper added to `lib/utils.ts` (alongside the existing `formatDate()`), new types/methods added to `adminApi` in `lib/api.ts`. Pro Members rows expiring within 7 days get a small orange "Expiring soon" badge.

### 36.3 Verification performed (session 18)
- Ran the 3 new endpoint functions directly against the real local Postgres DB and independently cross-checked every number against raw SQL (`SELECT status, sum(cast(amount as numeric)) FROM billing_transactions GROUP BY status`, etc.) — all matched exactly (1 success transaction, $2.99 total revenue, 4 active Pro members, all confirmed both ways).
- `tsc --noEmit` shows no new errors from these files (2 pre-existing unrelated errors in `generate-pdf/route.ts` and `pagination-test-data.ts` were already there before this session).
- Hit all 3 new endpoints with a non-admin JWT and with no token at all — both returned `403`, same as every other `/admin/*` route.
- Logged into the real app as an admin (via a temporary test admin account, deleted afterward) and screenshotted all 4 sections — numbers on screen matched the DB exactly, including the "Expiring soon" badge correctly flagging a Pro member expiring within the 7-day window.

---

## 37. SEO Landing Pages + Site Navigation Restructure (session 19, 2026-07-29)

Two new public marketing pages, resolving known issue #16 above (the `/features/ats-checker` 404 open since session 9), plus home page SEO improvements and a `SiteHeader.tsx` nav restructure. Neither `frontend/app/features/` nor `frontend/app/sitemap.ts` existed anywhere in the project before this session (confirmed via filesystem search, not assumed) — both built fresh.

### 37.1 New pages: `/features/cv-builder`, `/features/ats-checker`

`frontend/app/features/{cv-builder,ats-checker}/{page.tsx,layout.tsx}`. Each `page.tsx` is a plain Server Component — the FAQ accordions use native `<details>/<summary>`, so no `"use client"`/React state is needed; each sibling `layout.tsx` exports `metadata` (title, description, canonical via the existing `SITE_URL` constant from `lib/share-links.ts`, OpenGraph). Both pages reuse `SiteHeader`/`SiteFooter` and the exact existing dark-navy design system (same hex tokens and section/card patterns already used on `app/page.tsx`/`app/pricing/page.tsx` — no new design system introduced), cross-link to each other and to `/templates`/`/signup`, and each carry a `FAQPage` JSON-LD `<script>` tag matching their visible FAQ content exactly. Structure per page: hero with a single keyword-rich `<h1>` → "how it works" (3 steps) → features grid → cross-link callout to the other feature page → FAQ → final CTA, all subsections `<h2>`/`<h3>`.

**Content honesty — every fact pulled from real code, not the source guide's numbers (flagged upfront as possibly stale):**
- Template count: `lib/templates-data.ts` counted directly — 14 total, 5 free (classic, academic, minimal, corporate, nova), 9 Pro.
- ATS Checker free limit: `backend/app/api/routes/ats.py`'s `FREE_LIMIT = 5` — a lifetime total, not daily, worded that way on the page to avoid implying a recurring allowance.
- Zeni AI daily limit: `backend/app/api/routes/cv.py`'s `AI_FREE_DAILY_LIMIT = 3`.
- Pricing: matched to `app/pricing/page.tsx`'s real LKR figures — Rs. 3,500/month, Rs. 30,000/year (Rs. 2,500/month equivalent), Rs. 1000 7-Day Pass (one-time, no auto-renewal).
- The ATS page's "7-layer analysis" section names the real 7 layers read directly from the authenticated tool's `app/(dashboard)/ats-checker/page.tsx`'s `ANALYSIS_STEPS` array (ATS Compatibility Check, Sections & Structure, Keyword & Skill Matching, Content Quality Analysis, Language & Grammar, Professional Data Check, AI Recruiter Simulation) — not invented category names.
- No fake user counts, review counts, or testimonials on either page.

### 37.2 `frontend/app/sitemap.ts` (new)

Didn't exist before this session (neither does `robots.ts` — out of scope, not touched). Built using Next.js's `MetadataRoute.Sitemap` App Router convention, reusing the existing `SITE_URL` constant. Lists all public marketing routes — home, both new feature pages, templates, pricing, reviews, career-tips, about, contact, partners, privacy, terms — with per-route `changeFrequency`/`priority`. Dynamic `career-tips/[id]` entries aren't enumerated (DB-backed, would need a data fetch at build time — the `/career-tips` index page itself is listed and links out to them).

### 37.3 Home page (`app/page.tsx`)

- Hero `<h1>` rewritten from "Build a CV that actually gets you hired — not just downloaded" to the keyword-rich **"AI CV Builder With an Honest ATS Score"** — the previous line kept, moved into the supporting paragraph directly below so no copy was lost. Confirmed via direct grep: exactly one `<h1>` on the page, every other heading `<h2>`/`<h3>`.
- New "features" link section added directly after the hero — two descriptive-anchor cards ("Explore the AI CV builder" / "Try the free ATS resume checker") linking to the two new pages.
- New 3-question FAQ section (`<details>` + `FAQPage` JSON-LD, same pattern as the feature pages) added before the final CTA: "Is ZenzHire free?", "Are the CVs ATS-friendly?", "What is the 7-Day Pass?".
- **Found and fixed incidentally while verifying the real template count for the above**: two stale "13 Professional Templates" / "Pick from 13 professional designs" copy references in `VALUE_PROPS`/`STEPS` — corrected to the real 14. Unrelated to the nav/SEO work itself, just caught along the way.

### 37.4 `SiteHeader.tsx` nav restructure

`NAV_LINKS` reordered to the exact 6 items: Home, Templates, CV Builder (`/features/cv-builder`), ATS Checker (`/features/ats-checker`), Pricing, Career Tips. About and Contact removed. Since desktop (`hidden md:flex`) and the mobile hamburger menu both map over the same `NAV_LINKS` array, one edit updated both renders. **Confirmed before removing them**: About, Contact, and Reviews were all already present in `SiteFooter.tsx`'s Company column (along with Partner Program) — footer needed no changes there, so nothing became unreachable.

### 37.5 `SiteFooter.tsx`

Added `{ label: "CV Builder", href: "/features/cv-builder" }` to `PRODUCT_LINKS`, next to the pre-existing "ATS Checker" entry (`/features/ats-checker`, already linked before this session — it just 404'd until now).

### 37.6 Verification performed (session 19)

- Both new pages rendered via the real dev server (fresh `.next` cache + clean process restart, after an earlier stale multi-process dev-server state was caught serving unstyled/uncompiled output) at 1440px, using the real `SiteHeader`/`SiteFooter` (not a mock) — layout, header, footer, feature grids, cross-links, and the `<details>` FAQ accordion (click-tested, expands/collapses correctly) all confirmed visually correct via real screenshots.
- **390px confirmed via real Playwright screenshots** (the browser-extension automation tool's `resize_window` turned out not to actually constrain the rendered viewport in this session — matches this doc's own section 26.2-era note that this project has no dedicated E2E suite and mobile checks are done via ad-hoc `node`-run Playwright scripts, not the extension). `cv-builder`/`ats-checker`/home all confirmed at a true 390×844 viewport: no horizontal overflow (`scrollWidth > clientWidth` checked programmatically, false on all three), hero/CTA/FAQ sections reflow correctly, footer's Company column (About/Contact/Partner Program/Reviews) fully reachable, and the hamburger menu opens to the correct 6-item order (Home, Templates, CV Builder, ATS Checker, Pricing, Career Tips). One pre-existing, unrelated console warning found on the home page load (a React hydration mismatch from `AcademicTemplate.tsx` via the `TemplatePreviewFrame`/`TemplateCarousel` component embedding a live template preview) — not touched this session, not caused by any change here.
- `/features/ats-checker` confirmed to no longer 404 — direct request returns the real page (`200`), confirmed both via `curl` and by loading it in the browser.
- Both `/features/cv-builder` and `/features/ats-checker` confirmed present in the real `/sitemap.xml` output from the dev server (fetched and read directly, not assumed from the source file).
- Home page confirmed single-`<h1>` two ways: direct source grep AND a grep of the real rendered HTML response (1 `<h1>`, 7 `<h2>`s).
- `tsc --noEmit` confirmed no new type errors introduced by any file touched this session (pre-existing unrelated errors in `generate-pdf/route.ts`/`pagination-test-data.ts` untouched, same 2 as session 18).
- New 6-item header nav order confirmed correct via both rendered screenshot and a grep of the real HTML response's link order; confirmed About/Contact appear exactly once each (footer only, not header) via `grep -c` on the rendered HTML.

---