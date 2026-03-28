/**
 * context/AuthContext.tsx
 * Global auth state — login / register / forgetPassword / logout.
 *
 * Persists tokens + user to AsyncStorage so sessions survive app restarts.
 * The root _layout.tsx wraps the app with <AuthProvider>.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { STORAGE_KEYS } from "../lib/apiClient";
import {
  UserProfile,
  forgetPassword as apiForgetPassword,
  login as apiLogin,
  register as apiRegister,
} from "../lib/authService";

// ─── Types ────────────────────────────────────────────────────────────────────
interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isLoading: boolean; // true while restoring session from AsyncStorage
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (fullName: string, email: string, password: string) => Promise<void>;
  forgetPassword: (email: string, newPassword: string, confirmPassword: string) => Promise<string>;
  logout: () => Promise<void>;
  /** Call after a successful PUT /profile to sync new user data globally */
  updateUser: (updatedUser: UserProfile) => Promise<void>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Helper — extract a human-readable error message ─────────────────────────
function extractErrorMessage(err: unknown, fallback = "Something went wrong."): string {
  if (err && typeof err === "object" && "response" in err) {
    const resp = (err as { response?: { data?: { message?: string } } }).response;
    if (resp?.data?.message) return resp.data.message;
  }
  if (err instanceof Error) return err.message;
  return fallback;
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    accessToken: null,
    isLoading: true,
  });

  // ── Restore session on mount ────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const [token, userJson] = await AsyncStorage.multiGet([
          STORAGE_KEYS.ACCESS_TOKEN,
          STORAGE_KEYS.USER,
        ]);
        const accessToken = token[1];
        const user: UserProfile | null = userJson[1] ? JSON.parse(userJson[1]) : null;
        setState({ user, accessToken, isLoading: false });
      } catch {
        setState((s) => ({ ...s, isLoading: false }));
      }
    })();
  }, []);

  // ── Persist helper ──────────────────────────────────────────────────────────
  const persistSession = useCallback(
    async (user: UserProfile, accessToken: string, refreshToken: string) => {
      await AsyncStorage.multiSet([
        [STORAGE_KEYS.ACCESS_TOKEN, accessToken],
        [STORAGE_KEYS.REFRESH_TOKEN, refreshToken],
        [STORAGE_KEYS.USER, JSON.stringify(user)],
      ]);
      setState({ user, accessToken, isLoading: false });
    },
    []
  );

  // ── Login ───────────────────────────────────────────────────────────────────
  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const res = await apiLogin({ email, password });
        await persistSession(res.data.user, res.data.accessToken, res.data.refreshToken);
        router.replace("/(main)/home");
      } catch (err) {
        throw new Error(extractErrorMessage(err, "Login failed. Please try again."));
      }
    },
    [persistSession]
  );

  // ── Register ────────────────────────────────────────────────────────────────
  // After successful signup, redirect to login — user must sign in manually.
  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      try {
        await apiRegister({ fullName, email, password });
        router.replace("/(auth)/login");
      } catch (err) {
        throw new Error(extractErrorMessage(err, "Registration failed. Please try again."));
      }
    },
    []
  );

  // ── Forget Password ─────────────────────────────────────────────────────────
  // Directly resets the password on the server — no email link needed.
  // On success, navigates to login.
  const forgetPassword = useCallback(
    async (email: string, newPassword: string, confirmPassword: string): Promise<string> => {
      try {
        const res = await apiForgetPassword({ email, newPassword, confirmPassword });
        router.replace("/(auth)/login");
        return res.message;
      } catch (err) {
        throw new Error(extractErrorMessage(err, "Failed to reset password."));
      }
    },
    []
  );


  // ── Update User ─────────────────────────────────────────────────────────────
  // Called by ProfileScreen after a successful PUT /profile so global state stays fresh.
  const updateUser = useCallback(async (updatedUser: UserProfile) => {
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedUser));
    setState((prev) => ({ ...prev, user: updatedUser }));
  }, []);

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ACCESS_TOKEN,
      STORAGE_KEYS.REFRESH_TOKEN,
      STORAGE_KEYS.USER,
    ]);
    setState({ user: null, accessToken: null, isLoading: false });
    router.replace("/(auth)/login");
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, forgetPassword, logout, updateUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
