// Temporary launch-day flags. Flip back and remove once no longer needed.

// Career Mentor conversational onboarding (the "New CV" -> chat wizard flow)
// is disabled for launch to reduce risk; it needs more real-world testing.
// Re-enable by flipping this to true — no other code changes required.
// The Career Mentor backend routes, DB usage, and UI code are untouched and
// still fully functional; this only controls the "New CV" entry point.
export const CAREER_MENTOR_ENABLED = false;
