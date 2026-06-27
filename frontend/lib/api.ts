import axios from "axios";
import Cookies from "js-cookie";
import type { CoverLetter, CoverLetterListItem } from "@/types";

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
  }>) => api.put<CoverLetter>(`/cover-letter/${id}`, data),

  delete: (id: number) =>
    api.delete(`/cover-letter/${id}`),

  generate: (data: {
    cv_id?: number;
    job_title: string;
    company: string;
    job_description: string;
    tone: string;
  }) => api.post<{ content: string }>("/cover-letter/ai/generate", data),
};
