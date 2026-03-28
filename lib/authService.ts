/**
 * lib/authService.ts
 * Strongly-typed wrappers around the auth endpoints exposed by student-app-backend.
 *
 * Endpoints (base: /api/users):
 *   POST /register       { fullName, email, password }
 *   POST /login          { email, password }
 *   POST /forget-password { email }
 *   GET  /profile        — protected
 *   PUT  /profile        — protected
 *   PUT  /change-password — protected
 */

import apiClient from "./apiClient";

// ─── Shared types ─────────────────────────────────────────────────────────────

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

// ─── Forget Password (direct reset — no email sending) ───────────────────────
export interface ForgetPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface MessageResponse {
  success: boolean;
  message: string;
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


// ─── Get Profile ──────────────────────────────────────────────────────────────
export async function getProfile(): Promise<{ success: boolean; data: { user: UserProfile } }> {
  const { data } = await apiClient.get("/users/profile");
  return data;
}

// ─── Update Profile ───────────────────────────────────────────────────────────
export interface UpdateProfilePayload {
  fullName?: string;
  email?: string;
  phone?: string;
  className?: string;
  avatar?: string;
}

export async function updateProfile(
  payload: UpdateProfilePayload
): Promise<{ success: boolean; message: string; data: { user: UserProfile } }> {
  const { data } = await apiClient.put("/users/profile", payload);
  return data;
}

// ─── Change Password ──────────────────────────────────────────────────────────
export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export async function changePassword(
  payload: ChangePasswordPayload
): Promise<MessageResponse> {
  const { data } = await apiClient.put("/users/change-password", payload);
  return data;
}
