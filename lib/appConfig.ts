/**
 * lib/appConfig.ts
 *
 * Configuration for development vs production environment
 * Generates appropriate deep links and URLs based on app environment
 */

import Constants from "expo-constants";

// ─── Determine Environment ────────────────────────────────────────────────────
const IS_DEVELOPMENT = __DEV__;
const EXPO_PROJECT_OWNER = Constants.expoConfig?.extra?.expoProjectOwner || "nilanchal";
const APP_SLUG = Constants.expoConfig?.extra?.appSlug || "studen-exam-app";

// ─── Generated URLs ───────────────────────────────────────────────────────────
/**
 * Deep link for referral system
 * - Development: studenexamapp://ref/{userId}
 * - Production: https://expo.dev/@{owner}/{slug}?referral={userId}
 */
export function generateReferralLink(userId: string): {
  deepLink: string;
  webLink: string;
  displayLink: string;
} {
  if (IS_DEVELOPMENT) {
    // Development mode - use native deep link
    const deepLink = `studenexamapp://ref/${userId}`;
    return {
      deepLink,
      webLink: deepLink,
      displayLink: deepLink,
    };
  } else {
    // Production mode - use Expo hosted link
    const deepLink = `studenexamapp://ref/${userId}`;
    const webLink = `https://expo.dev/@${EXPO_PROJECT_OWNER}/${APP_SLUG}?referral=${userId}`;
    
    return {
      deepLink,
      webLink,
      displayLink: deepLink, // Show the deep link for sharing
    };
  }
}

/**
 * Get the base URL for the app
 * Used for generating universal links
 */
export function getAppBaseUrl(): string {
  if (IS_DEVELOPMENT) {
    return "studenexamapp://";
  } else {
    return `https://expo.dev/@${EXPO_PROJECT_OWNER}/${APP_SLUG}`;
  }
}

/**
 * Environment Info (for debugging)
 */
export const AppEnv = {
  isDevelopment: IS_DEVELOPMENT,
  projectOwner: EXPO_PROJECT_OWNER,
  appSlug: APP_SLUG,
  expoProjectId: Constants.expoConfig?.extra?.eas?.projectId,
};

export default {
  generateReferralLink,
  getAppBaseUrl,
  AppEnv,
};
