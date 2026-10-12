// Temporary launch-day flags. Flip back and remove once no longer needed.

// Career Mentor quick-start (PROJECT_CONTEXT.md section 38). When true, users
// with 0 CVs land on the /cv-builder/start welcome screen after signup (email
// and Google) and from the dashboard's "Create New CV" / My CVs "New CV".
// When false those entry points go to the dashboard / template picker as before.
// The template picker always creates a CV directly with the chosen template.
export const CAREER_MENTOR_ENABLED = true;

// 2-week promotional "50% OFF" display on the Pricing page's 7-Day Pass
// card (started 2026-07-25). Display-only — the actual PAYable checkout
// amount is unaffected (still Rs. 1000 see backend/app/services/billing.py's
// PLAN_CONFIG). Flip to false to remove the promo banner once it ends;
// no other code changes required.
export const SHOW_PASS7_PROMO = true;
