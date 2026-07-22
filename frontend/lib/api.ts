import axios from "axios";
import Cookies from "js-cookie";
import type { CoverLetter, CoverLetterListItem, TemplateId, CareerTip } from "@/types";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL + "/api/v1",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// ── Billing API ────────────────────────────────────────────────────────────────

export interface CheckoutRequest {
  plan: "monthly" | "yearly" | "pass7";
  customer_mobile_phone: string;
  billing_address_street: string;
  billing_address_city: string;
  billing_address_postcode_zip: string;
  billing_address_country: string;
}

export const billingApi = {
  checkout: (data: CheckoutRequest) =>
    api.post<{ payment_page: string; invoice_id: string }>("/billing/checkout", data),
};

// ── Cover Letter API ───────────────────────────────────────────────────────────

export const coverLetterApi = {
  list: () =>
    api.get<CoverLetterListItem[]>("/cover-letter/"),

  get: (id: number) =>
    api.get<CoverLetter>(`/cover-letter/${id}`),

  create: (data: {
    title: string;
    template_id: string;
    cv_id?: number;
    job_title: string;
    company: string;
  }) => api.post<CoverLetter>("/cover-letter/", data),

  update: (id: number, data: Partial<{
    title: string;
    template_id: string;
    cv_id: number;
    content: string;
    job_title: string;
    company: string;
    job_description: string;
    tone: string;
    customization: object;
    personal_details: object;
  }>) => api.put<CoverLetter>(`/cover-letter/${id}`, data),

  delete: (id: number) =>
    api.delete(`/cover-letter/${id}`),

  duplicate: (id: number) =>
    api.post<CoverLetter>(`/cover-letter/${id}/duplicate`),

  generate: (data: {
    cv_id?: number;
    job_title: string;
    company: string;
    job_description: string;
    tone: string;
  }) => api.post<{ content: string }>("/cover-letter/ai/generate", data),
};

// ── Contact API ────────────────────────────────────────────────────────────────

export const contactApi = {
  submit: (data: { name: string; email: string; message: string }) =>
    api.post<{ id: number; name: string; email: string; message: string }>(
      "/contact/",
      data
    ),
};

// ── Reviews API ────────────────────────────────────────────────────────────────

export interface ReviewItem {
  id: number;
  name: string;
  rating: number;
  text: string;
  created_at: string;
}

export const reviewsApi = {
  list: () => api.get<ReviewItem[]>("/reviews/"),

  submit: (data: { name: string; rating: number; text: string }) =>
    api.post<ReviewItem>("/reviews/", data),
};

// ── Career Mentor (conversational CV onboarding) ──────────────────────────────

export interface CareerMentorStep {
  cv_id: number;
  step: string;
  question: string;
  input_type: "text" | "buttons" | "none";
  options: string[] | null;
  progress: { current: number; total: number };
  context: Record<string, string>;
  complete: boolean;
}

export const careerMentorApi = {
  start: (template_id: TemplateId) =>
    api.post<CareerMentorStep>("/career-mentor/start", { template_id }),

  answer: (data: {
    cv_id: number;
    step: string;
    answer: string;
    context: Record<string, string>;
  }) => api.post<CareerMentorStep>("/career-mentor/answer", data),
};

// ── Career Tips API (public) ──────────────────────────────────────────────────

export const careerTipsApi = {
  list: () => api.get<CareerTip[]>("/career-tips/"),
  get: (id: number) => api.get<CareerTip>(`/career-tips/${id}`),
};

// ── Admin API ──────────────────────────────────────────────────────────────────

export interface AdminStats {
  total_users: number;
  total_cvs: number;
  total_cover_letters: number;
  cvs_per_template: Record<string, number>;
}

export interface AdminContactSubmission {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  plan: "free" | "pro";
  created_at: string;
  cv_count: number;
  ats_count: number;
}

export interface AdminAdmin {
  id: number;
  email: string;
  full_name: string;
  created_at: string;
}

export interface AdminNotifications {
  pending_reviews_count: number;
  new_contact_submissions: boolean;
}

export const adminApi = {
  stats: () => api.get<AdminStats>("/admin/stats"),

  pendingReviews: () => api.get<ReviewItem[]>("/admin/reviews/pending"),

  approvedReviews: () => api.get<ReviewItem[]>("/admin/reviews/approved"),

  approveReview: (id: number) =>
    api.post<ReviewItem>(`/admin/reviews/${id}/approve`),

  contactSubmissions: () =>
    api.get<AdminContactSubmission[]>("/admin/contact-submissions"),

  markContactViewed: () =>
    api.post("/admin/contact-submissions/mark-viewed"),

  users: (plan?: "free" | "pro") =>
    api.get<AdminUser[]>("/admin/users", { params: plan ? { plan } : undefined }),

  careerTips: () => api.get<CareerTip[]>("/admin/career-tips"),

  createCareerTip: (data: { title: string; image_url: string; caption: string }) =>
    api.post<CareerTip>("/admin/career-tips", data),

  deleteCareerTip: (id: number) =>
    api.delete(`/admin/career-tips/${id}`),

  admins: () => api.get<AdminAdmin[]>("/admin/admins"),

  createAdmin: (data: { email: string; full_name: string; password: string }) =>
    api.post<AdminAdmin>("/admin/admins", data),

  resetAdminPassword: (id: number) =>
    api.post<{ email: string; new_password: string }>(`/admin/admins/${id}/reset-password`),

  notifications: () => api.get<AdminNotifications>("/admin/notifications"),
};

// ── Profile / Usage Stats API ───────────────────────────────────────────────────

export interface UsageStats {
  cv_count: number;
  cv_limit: number | null;
  ats_count: number;
  ats_limit: number | null;
  ai_usage_count: number;
  ai_usage_limit: number | null;
  active_plan: "monthly" | "yearly" | "pass7" | null;
}

export const profileApi = {
  usageStats: () => api.get<UsageStats>("/auth/usage-stats"),
};
