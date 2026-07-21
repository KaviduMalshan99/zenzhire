// Client-side mirror of backend/app/core/security.py's password_strength_error.
// Only for instant feedback — the backend re-checks on every signup, since
// this copy can always be bypassed by calling the API directly.

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MIN_CATEGORIES = 3;

interface Category {
  label: string;
  test: (password: string) => boolean;
}

const CATEGORIES: Category[] = [
  { label: "an uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { label: "a lowercase letter", test: (p) => /[a-z]/.test(p) },
  { label: "a number", test: (p) => /[0-9]/.test(p) },
  { label: "a special character", test: (p) => /[^A-Za-z0-9]/.test(p) },
];

export function passwordCategoryCount(password: string): number {
  return CATEGORIES.filter((c) => c.test(password)).length;
}

export function isPasswordValid(password: string): boolean {
  return password.length >= PASSWORD_MIN_LENGTH && passwordCategoryCount(password) >= PASSWORD_MIN_CATEGORIES;
}

export type PasswordStrength = "weak" | "medium" | "strong";

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < PASSWORD_MIN_LENGTH) return "weak";
  const categories = passwordCategoryCount(password);
  if (categories < 2) return "weak";
  if (categories === 2) return "medium";
  return "strong";
}

/** Specific, actionable reasons the password is currently rejected. Empty once valid. */
export function getPasswordHints(password: string): string[] {
  const hints: string[] = [];
  if (password.length < PASSWORD_MIN_LENGTH) {
    hints.push(`At least ${PASSWORD_MIN_LENGTH} characters`);
  }
  const missing = CATEGORIES.filter((c) => !c.test(password));
  if (CATEGORIES.length - missing.length < PASSWORD_MIN_CATEGORIES) {
    hints.push(`Add ${missing.map((c) => c.label).join(", ")}`);
  }
  return hints;
}
