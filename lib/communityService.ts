/**
 * lib/communityService.ts
 *
 * REST API wrappers for Community group management.
 * Real-time chat (send_message, reactions, typing) is handled by
 * the Socket.IO client — see useCommunitySocket hook (to be created).
 *
 * Endpoints:
 *   GET    /api/communities                          — list (filter by ?examId)
 *   POST   /api/communities                          — create group
 *   GET    /api/communities/:id                      — group detail
 *   POST   /api/communities/:id/join                 — join group
 *   POST   /api/communities/:id/leave                — leave group
 *   GET    /api/communities/:id/messages             — history (paginated)
 *   DELETE /api/communities/:cId/messages/:mId       — soft-delete message
 */

import apiClient from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface CommunityMember {
  user: { _id: string; fullName: string; avatar?: string };
  joinedAt: string;
}

export interface Community {
  _id: string;
  name: string;
  description: string;
  exam: { _id: string; name: string; level: string } | string;
  examName: string;
  createdBy: { _id: string; fullName: string; avatar?: string } | string;
  memberCount: number;
  isMember?: boolean;
  isOpen: boolean;
  maxMembers: number;
  createdAt: string;
}

export interface ReplyTo {
  messageId: string | null;
  senderName: string;
  textPreview: string;
}

export interface CommunityMessage {
  _id: string;
  community: string;
  sender: { _id: string; fullName: string; avatar?: string };
  senderName: string;
  text: string;
  replyTo: ReplyTo;
  reactions: Record<string, string[]>; // emoji → array of userIds
  isDeleted: boolean;
  createdAt: string;
}

// ─── Community CRUD ────────────────────────────────────────────────────────────
export async function fetchCommunities(params?: {
  examId?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: {
    total: number;
    page: number;
    totalPages: number;
    communities: Community[];
  };
}> {
  const { data } = await apiClient.get("/communities", { params });
  return data;
}

export async function fetchCommunityById(id: string): Promise<{
  success: boolean;
  data: { community: Community; isMember: boolean; memberCount: number };
}> {
  const { data } = await apiClient.get(`/communities/${id}`);
  return data;
}

export async function createCommunity(payload: {
  examId: string;
  name: string;
  description?: string;
}): Promise<{
  success: boolean;
  message: string;
  data: { community: Community };
}> {
  const { data } = await apiClient.post("/communities", payload);
  return data;
}

export async function joinCommunity(
  id: string,
): Promise<{
  success: boolean;
  message: string;
  data: { memberCount: number };
}> {
  const { data } = await apiClient.post(`/communities/${id}/join`);
  return data;
}

export async function leaveCommunity(
  id: string,
): Promise<{
  success: boolean;
  message: string;
  data: { memberCount: number };
}> {
  const { data } = await apiClient.post(`/communities/${id}/leave`);
  return data;
}

// ─── Message history (REST — for initial load + pagination) ───────────────────
export async function fetchMessages(
  communityId: string,
  page = 1,
  limit = 30,
): Promise<{
  success: boolean;
  data: {
    total: number;
    page: number;
    totalPages: number;
    messages: CommunityMessage[];
  };
}> {
  const { data } = await apiClient.get(`/communities/${communityId}/messages`, {
    params: { page, limit },
  });
  return data;
}

export async function deleteMessage(
  communityId: string,
  messageId: string,
): Promise<{ success: boolean; message: string }> {
  const { data } = await apiClient.delete(
    `/communities/${communityId}/messages/${messageId}`,
  );
  return data;
}
