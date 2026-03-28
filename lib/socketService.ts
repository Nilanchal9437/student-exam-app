/**
 * lib/socketService.ts
 *
 * Manages a single shared socket.io-client connection for the app.
 * The socket is initialised with the stored JWT so the server can
 * authenticate each connection without HTTP cookies.
 *
 * React Native / Expo notes:
 *  • We force transports: ["websocket"] then fall back to ["polling"].
 *    The Node.js-only transports (polling-fetch, websocket.node etc.) are
 *    stubbed out via metro.config.js so they don't crash the bundler.
 *  • forceBase64: true is required for binary data over some RN WebSocket impls.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { STORAGE_KEYS } from "./apiClient";

// ── Socket.IO server URL ────────────────────────────────────────────────────
// Must point at the root of the server (NOT /api), same host as API_BASE_URL.
export const SOCKET_URL = "http://192.168.31.208:5000";

let socket: Socket | null = null;

/**
 * Returns (or lazily creates) the singleton socket connection.
 * Safe to call multiple times — returns the existing connected socket.
 */
export async function getSocket(): Promise<Socket> {
  // Reuse if already connected
  if (socket?.connected) return socket;

  // If socket exists but disconnected, clean up first
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  const token = await AsyncStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  const user = await AsyncStorage.getItem(STORAGE_KEYS.USER);
  socket = io(SOCKET_URL, {
    auth: { token: token ?? "", user: user ?? null },

    // ── React Native compatible transports only ──────────────────────────────
    // "websocket"  → native RN WebSocket (works great)
    // "polling"    → XHR long-poll (fallback for restricted networks)
    // We DO NOT include "polling-fetch" or any Node.js-only transports.
    transports: ["websocket", "polling"],

    // Required for some Android WebSocket implementations
    forceBase64: false,

    // Reconnect strategy
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1500,
    reconnectionDelayMax: 5000,

    // Connection timeout
    timeout: 20000,
  });

  return socket;
}

/**
 * Forcefully disconnect and destroy the singleton socket.
 * Call this on logout or when the app goes to background.
 */
export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }
}

/**
 * Returns the current socket instance (or null if not yet connected).
 */
export function getCurrentSocket(): Socket | null {
  return socket;
}
