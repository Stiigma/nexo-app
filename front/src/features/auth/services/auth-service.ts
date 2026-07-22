import { api } from "@/common/services/api-client";
import type { AuthUser } from "@/common/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: AuthUser;
}

/** Authenticate user with email and password */
export function login(payload: LoginPayload): Promise<AuthResponse> {
  return api.post<AuthResponse>("/auth/login", payload);
}

/** End current session */
export function logout(): Promise<void> {
  return api.post<void>("/auth/logout");
}

/** Check current session — returns user or throws */
export function checkSession(): Promise<AuthResponse> {
  return api.get<AuthResponse>("/auth/me");
}
