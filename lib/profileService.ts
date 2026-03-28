/**
 * lib/profileService.ts
 * User profile management — get profile, update profile, change password.
 * Endpoints: /api/users/profile · /api/users/change-password
 */

import apiClient from "./apiClient";
import type { UserProfile, MessageResponse } from "./authService";

// ─── Re-export shared types so consumers can import from one place ─────────────
export type { UserProfile, MessageResponse };

// ─── Get Profile ──────────────────────────────────────────────────────────────
export async function getProfile(): Promise<{
  success: boolean;
  data: { user: UserProfile };
}> {
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
