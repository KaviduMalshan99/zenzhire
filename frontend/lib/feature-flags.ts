// Temporary launch-day flags. Flip back and remove once no longer needed.

// Career Mentor conversational onboarding (the "New CV" -> chat wizard flow)
// is disabled for launch to reduce risk; it needs more real-world testing.
// Re-enable by flipping this to true — no other code changes required.
// The Career Mentor backend routes, DB usage, and UI code are untouched and
// still fully functional; this only controls the "New CV" entry point.
export const CAREER_MENTOR_ENABLED = false;

// 2-week promotional "50% OFF" display on the Pricing page's 7-Day Pass
// card (started 2026-07-25). Display-only — the actual PAYable checkout
// amount is unaffected (still Rs. 1000 see backend/app/services/billing.py's
// PLAN_CONFIG). Flip to false to remove the promo banner once it ends;
// no other code changes required.
export const SHOW_PASS7_PROMO = true;
