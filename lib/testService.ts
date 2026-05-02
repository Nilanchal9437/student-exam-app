/**
 * lib/testService.ts
 * Exam questions (MCQ) — fetch questions for a subject.
 * Endpoint: GET /api/tests?subject=<subjectId>
 */

import apiClient from "./apiClient";

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface QuestionOption {
  A: string;
  B: string;
  C: string;
  D: string;
}

export interface Question {
  _id: string;
  exam: string;
  term: string;
  subject: string;
  question: string;
  options: QuestionOption;
  answer: "A" | "B" | "C" | "D";
  explanation: string;
  marks: number;
  order: number;
}

export interface QuestionListResponse {
  success: boolean;
  message: string;
  data: { count: number; questions: Question[] };
}

// ─── Fetch all questions for a given subject ──────────────────────────────────
export async function fetchQuestionsBySubject(
  subjectId: string
): Promise<QuestionListResponse> {
  const { data } = await apiClient.get<QuestionListResponse>("/tests", {
    params: { subject: subjectId },
  });
  return data;
}
