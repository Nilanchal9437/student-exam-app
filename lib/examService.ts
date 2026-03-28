/**
 * lib/examService.ts
 * Exam catalogue — list all exams, fetch a single exam by ID.
 * Endpoints: GET /api/exams · GET /api/exams/:id
 */

import apiClient from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Exam {
  _id: string;
  name: string;
  level: string;
  isPremium: boolean;
  isActive: boolean;
  createdAt: string;
}

export interface ExamListResponse {
  success: boolean;
  message: string;
  data: { count: number; exams: Exam[] };
}

// ─── Fetch all exams (with optional filters) ──────────────────────────────────
export async function fetchExams(params?: {
  level?: string;
  isPremium?: boolean;
  search?: string;
}): Promise<ExamListResponse> {
  const { data } = await apiClient.get<ExamListResponse>("/exams", { params });
  return data;
}

// ─── Fetch a single exam ──────────────────────────────────────────────────────
export async function fetchExamById(
  id: string
): Promise<{ success: boolean; data: { exam: Exam } }> {
  const { data } = await apiClient.get(`/exams/${id}`);
  return data;
}
