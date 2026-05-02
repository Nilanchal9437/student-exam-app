/**
 * lib/subjectService.ts
 * Subjects — fetch subjects belonging to a term.
 * Endpoint: GET /api/subjects?term=<termId>
 */

import apiClient from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Subject {
  _id: string;
  term: string;
  subjectName: string;
  createdAt: string;
}

export interface SubjectListResponse {
  success: boolean;
  message: string;
  data: { count: number; subjects: Subject[] };
}

// ─── Fetch all subjects for a given term ──────────────────────────────────────
export async function fetchSubjectsByTerm(termId: string): Promise<SubjectListResponse> {
  const { data } = await apiClient.get<SubjectListResponse>("/subjects", {
    params: { term: termId },
  });
  return data;
}

// ─── Fetch a single subject ───────────────────────────────────────────────────
export async function fetchSubjectById(
  id: string
): Promise<{ success: boolean; data: { subject: Subject } }> {
  const { data } = await apiClient.get(`/subjects/${id}`);
  return data;
}
