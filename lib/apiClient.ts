/**
 * lib/apiClient.ts
 * Axios instance with base URL + JWT interceptors for student-exam-app.
 *
 * Interceptors:
 *  1. REQUEST  — attach "Authorization: Bearer <accessToken>" on every call.
 *  2. RESPONSE — on 401, clear stored tokens and let the AuthContext redirect.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

// ─── Config ───────────────────────────────────────────────────────────────────
// API Base URL configuration
//
// Uses Vercel production URL, with fallback to local IP for development
//
// Environment scenarios:
//   Production (Published App) → "https://student-app-backend-two.vercel.app/api"
//   Development (Expo Go)      → "http://192.168.31.208:5000/api" (fallback)
//   Android Emulator           → "http://10.0.2.2:5000/api"
//   iOS Simulator              → "http://localhost:5000/api"
//
// To use local backend during development, temporarily uncomment the local URL below

// Production URL (Vercel)
export const API_BASE_URL = "https://student-app-backend-two.vercel.app/api";

// For local development, uncomment this instead:
// export const API_BASE_URL = "http://192.168.31.208:5000/api";

// Storage keys — keep in sync with authContext
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@auth/accessToken",
  REFRESH_TOKEN: "@auth/refreshToken",
  USER: "@auth/user",
} as const;

// ─── Axios instance ───────────────────────────────────────────────────────────
// Timeout increased to 20s for Vercel cold starts and network latency
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20_000, // 20 seconds (Vercel may have cold start delays)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────────────────
// Attach Bearer token to every outgoing request.
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // If AsyncStorage throws, proceed without token
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ─── Response Interceptor ─────────────────────────────────────────────────────
// On 401, clear persisted auth data so AuthContext redirects to login.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear tokens — AuthContext will pick this up and navigate to login
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.ACCESS_TOKEN,
        STORAGE_KEYS.REFRESH_TOKEN,
        STORAGE_KEYS.USER,
      ]);
    }
    return Promise.reject(error);
  },
);

export default apiClient;
