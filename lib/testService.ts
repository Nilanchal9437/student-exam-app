/**
 * lib/testService.ts
 * Exam questions (MCQ) — fetch questions for an exam.
 * Endpoint: GET /api/tests?exam=<examId>
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

// ─── Fetch all questions for a given exam ─────────────────────────────────────
export async function fetchQuestionsByExam(
  examId: string
): Promise<QuestionListResponse> {
  const { data } = await apiClient.get<QuestionListResponse>("/tests", {
    params: { exam: examId },
  });
  return data;
}
