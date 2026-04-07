/**
 * lib/referenceService.ts
 *
 * REST API wrappers for Student References (recommendations).
 * Students can give references to other students with relationship type,
 * description, and rating.
 *
 * Endpoints:
 *   POST   /api/references                    — create a reference
 *   GET    /api/references/received           — get references I received
 *   GET    /api/references/given              — get references I gave
 *   GET    /api/references/user/:userId       — get public references for a user
 *   PUT    /api/references/:referenceId       — update a reference
 *   DELETE /api/references/:referenceId       — delete a reference
 */

import apiClient from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────
export type RelationshipType =
  | "classmate"
  | "friend"
  | "study-partner"
  | "mentor"
  | "colleague";

export interface User {
  _id: string;
  fullName: string;
  email: string;
  className: string;
}

export interface Reference {
  _id: string;
  referrer: User;
  referee: User;
  relationship: RelationshipType;
  description: string;
  rating: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReferenceStats {
  averageRating: number;
  totalReferences: number;
}

export interface ReferenceListResponse {
  success: boolean;
  message: string;
  data: {
    count: number;
    total: number;
    page: number;
    pages: number;
    references: Reference[];
  };
}

export interface UserReferencesResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      _id: string;
      fullName: string;
      email: string;
      className: string;
    };
    count: number;
    total: number;
    page: number;
    pages: number;
    stats: ReferenceStats;
    references: Reference[];
  };
}

// ─── Create Reference ─────────────────────────────────────────────────────────
export async function createReference(payload: {
  refereeId: string;
  relationship: RelationshipType;
  description?: string;
  rating?: number;
}): Promise<{
  success: boolean;
  message: string;
  data: Reference;
}> {
  const { data } = await apiClient.post("/references", payload);
  return data;
}

// ─── Fetch References I Received ──────────────────────────────────────────────
export async function fetchReceivedReferences(params?: {
  page?: number;
  limit?: number;
  relationship?: RelationshipType;
}): Promise<ReferenceListResponse> {
  const { data } = await apiClient.get("/references/received", { params });
  return data;
}

// ─── Fetch References I Gave ──────────────────────────────────────────────────
export async function fetchGivenReferences(params?: {
  page?: number;
  limit?: number;
  relationship?: RelationshipType;
}): Promise<ReferenceListResponse> {
  const { data } = await apiClient.get("/references/given", { params });
  return data;
}

// ─── Fetch Public References for a User ───────────────────────────────────────
export async function fetchUserReferences(
  userId: string,
  params?: {
    page?: number;
    limit?: number;
  },
): Promise<UserReferencesResponse> {
  const { data } = await apiClient.get(`/references/user/${userId}`, { params });
  return data;
}

// ─── Update Reference ─────────────────────────────────────────────────────────
export async function updateReference(
  referenceId: string,
  payload: {
    description?: string;
    rating?: number;
    relationship?: RelationshipType;
  },
): Promise<{
  success: boolean;
  message: string;
  data: Reference;
}> {
  const { data } = await apiClient.put(`/references/${referenceId}`, payload);
  return data;
}

// ─── Delete Reference ─────────────────────────────────────────────────────────
export async function deleteReference(referenceId: string): Promise<{
  success: boolean;
  message: string;
}> {
  const { data } = await apiClient.delete(`/references/${referenceId}`);
  return data;
}
