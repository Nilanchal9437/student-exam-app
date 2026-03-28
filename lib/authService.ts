/**
 * lib/authService.ts
 * Authentication only — register, login, forget-password.
 * All other domain services live in separate files:
 *   profileService.ts  — get/update profile, change password
 *   examService.ts     — exam listing & detail
 *   testService.ts     — exam questions (MCQ)
 *   resultService.ts   — submit & fetch results
 */

import apiClient from "./apiClient";

// ─── Shared types (re-exported for convenience) ───────────────────────────────
export interface UserProfile {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  className?: string;
  avatar?: string;
  role: string;
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: UserProfile;
    accessToken: string;
    refreshToken: string;
  };
}

export interface MessageResponse {
  success: boolean;
  message: string;
}

export interface ApiError {
  success: false;
  message: string;
}

// ─── Register ─────────────────────────────────────────────────────────────────
export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
}

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/users/register", payload);
  return data;
}

// ─── Login ────────────────────────────────────────────────────────────────────
export interface LoginPayload {
  email: string;
  password: string;
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>("/users/login", payload);
  return data;
}

// ─── Forget / Reset Password ──────────────────────────────────────────────────
// No email link — user enters email + new password directly.
export interface ForgetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export async function forgetPassword(
  payload: ForgetPasswordPayload
): Promise<MessageResponse> {
  const { data } = await apiClient.post<MessageResponse>(
    "/users/forget-password",
    payload
  );
  return data;
}
