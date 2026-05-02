/**
 * lib/termService.ts
 * Terms — fetch terms belonging to an exam.
 * Endpoint: GET /api/terms?exam=<examId>
 */

import apiClient from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Term {
  _id: string;
  exam: string;
  name: string;
  createdAt: string;
}

export interface TermListResponse {
  success: boolean;
  message: string;
  data: { count: number; terms: Term[] };
}

// ─── Fetch all terms for a given exam ────────────────────────────────────────
export async function fetchTermsByExam(examId: string): Promise<TermListResponse> {
  const { data } = await apiClient.get<TermListResponse>("/terms", {
    params: { exam: examId },
  });
  return data;
}

// ─── Fetch a single term ──────────────────────────────────────────────────────
export async function fetchTermById(
  id: string
): Promise<{ success: boolean; data: { term: Term } }> {
  const { data } = await apiClient.get(`/terms/${id}`);
  return data;
}
