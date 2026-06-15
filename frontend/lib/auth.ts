import Cookies from "js-cookie";
import api from "./api";
import type { TokenResponse, User } from "@/types";

export async function login(email: string, password: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/login", { email, password });
  Cookies.set("token", data.access_token, { expires: 7, sameSite: "lax" });
  return data;
}

export async function signup(email: string, password: string, full_name: string): Promise<TokenResponse> {
  const { data } = await api.post<TokenResponse>("/auth/signup", { email, password, full_name });
  Cookies.set("token", data.access_token, { expires: 7, sameSite: "lax" });
  return data;
}

export function logout() {
  Cookies.remove("token");
  window.location.href = "/";
}

export async function getMe(): Promise<User> {
  const { data } = await api.get<User>("/auth/me");
  return data;
}

export function getToken(): string | undefined {
  return Cookies.get("token");
}
