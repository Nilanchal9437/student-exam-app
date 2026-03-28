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
// Use your machine's LAN IP so Expo Go / physical devices can reach the backend.
//
// Scenarios:
//   Android Emulator only  → "http://10.0.2.2:5000/api"
//   Physical device / Expo Go (current) → "http://192.168.31.208:5000/api"
//   iOS Simulator          → "http://localhost:5000/api"
export const API_BASE_URL = "http://192.168.31.208:5000/api";

// Storage keys — keep in sync with authContext
export const STORAGE_KEYS = {
  ACCESS_TOKEN: "@auth/accessToken",
  REFRESH_TOKEN: "@auth/refreshToken",
  USER: "@auth/user",
} as const;

// ─── Axios instance ───────────────────────────────────────────────────────────
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10_000,
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
