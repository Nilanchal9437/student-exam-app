/**
 * lib/resultService.ts
 * Exam result submission and history retrieval.
 * Endpoints:
 *   POST /api/results/submit
 *   GET  /api/results/my
 *   GET  /api/results/my/:resultId
 *   GET  /api/results/my/:resultId/questions
 */

import apiClient from "./apiClient";

// ─── Submit result ─────────────────────────────────────────────────────────────
export interface AnswerPayload {
  questionId: string;
  selectedAnswer: "A" | "B" | "C" | "D" | null;
  duration: number; // seconds spent on this specific question
}

export interface SubmitResultPayload {
  subjectId: string;
  duration: number; // total exam seconds
  answers: AnswerPayload[];
}

export interface SubmitResultResponse {
  success: boolean;
  message: string;
  data: {
    result: {
      id: string;
      examName: string;
      totalQuestions: number;
      totalScore: number;
      percentage: number;
      duration: number;
      submittedAt: string;
    };
  };
}

export async function submitExamResult(
  payload: SubmitResultPayload
): Promise<SubmitResultResponse> {
  const { data } = await apiClient.post<SubmitResultResponse>(
    "/results/submit",
    payload
  );
  return data;
}

// ─── My results (list) ────────────────────────────────────────────────────────
export interface ResultRecord {
  _id: string;
  user: string;
  exam: { _id: string; name: string; level: string; isPremium: boolean } | string;
  examName: string;
  totalQuestions: number;
  totalScore: number;
  percentage: number;
  duration: number;
  submittedAt: string;
  createdAt: string;
}

export interface MyResultsResponse {
  success: boolean;
  message: string;
  data: { count: number; results: ResultRecord[] };
}

export async function fetchMyResults(): Promise<MyResultsResponse> {
  const { data } = await apiClient.get<MyResultsResponse>("/results/my");
  return data;
}

// ─── Single result detail ─────────────────────────────────────────────────────
export async function fetchResultById(
  resultId: string
): Promise<{ success: boolean; data: { result: ResultRecord } }> {
  const { data } = await apiClient.get(`/results/my/${resultId}`);
  return data;
}

// ─── Per-question breakdown (paginated) ───────────────────────────────────────
export interface TestResultRecord {
  _id: string;
  result: string;
  question: string;
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  answered: "A" | "B" | "C" | "D" | null;
  correctAnswer: "A" | "B" | "C" | "D";
  scorePoint: 0 | 1;
  duration: number;
  order: number;
}

export interface TestResultsResponse {
  success: boolean;
  message: string;
  data: {
    resultId: string;
    examName: string;
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    questions: TestResultRecord[];
  };
}

export async function fetchResultQuestions(
  resultId: string,
  page = 1,
  limit = 20
): Promise<TestResultsResponse> {
  const { data } = await apiClient.get<TestResultsResponse>(
    `/results/my/${resultId}/questions`,
    { params: { page, limit } }
  );
  return data;
}
