/**
 * lib/referralService.ts
 *
 * REST API wrappers for Referral system.
 * Users can earn coins by referring other users to sign up.
 *
 * Endpoints:
 *   GET    /api/users/referral-stats           — get referral coins and count
 */

import apiClient from "./apiClient";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReferralStats {
  referralCoins: number;
  referralCount: number;
  referralCode: string;
}

export interface ReferralStatsResponse {
  success: boolean;
  message: string;
  data: ReferralStats;
}

// ─── Fetch Referral Stats ────────────────────────────────────────────────────
/**
 * Get the current user's referral statistics
 * Returns: coins earned, total referrals made, and referral code
 */
export async function fetchReferralStats(): Promise<ReferralStatsResponse> {
  const { data } = await apiClient.get("/users/referral-stats");
  return data;
}
