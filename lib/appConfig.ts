/**
 * lib/appConfig.ts
 *
 * Configuration for development vs production environment
 * Generates appropriate deep links and URLs based on app environment
 * Dynamically fetches the latest build URL from Expo
 */

import Constants from "expo-constants";

// ─── Determine Environment ────────────────────────────────────────────────────
const IS_DEVELOPMENT = __DEV__;
const EXPO_PROJECT_OWNER = Constants.expoConfig?.extra?.expoProjectOwner || "nilanchal";
const APP_SLUG = Constants.expoConfig?.extra?.appSlug || "studen-exam-app";

// ─── Fallback to project URL ────────────────────────────────────────────────
const EXPO_PROJECT_URL = `https://expo.dev/@${EXPO_PROJECT_OWNER}/${APP_SLUG}`;

// ─── Cache for latest build URL ────────────────────────────────────────────
let cachedBuildUrl: string | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 3600000; // 1 hour in milliseconds

/**
 * Fetch the latest build URL from Expo API
 * Caches the result to avoid excessive API calls
 */
export async function getLatestBuildUrl(): Promise<string> {
  const now = Date.now();
  
  // Return cached URL if still valid
  if (cachedBuildUrl != null && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedBuildUrl;
  }

  try {
    // Fetch latest build from Expo API
    const response = await fetch(
      `https://api.expo.dev/v2/projects/${EXPO_PROJECT_OWNER}/${APP_SLUG}/latest-build`
    );
    
    if (response.ok) {
      const data = await response.json();
      const buildUrl = data?.artifacts?.buildUrl;
      if (buildUrl && typeof buildUrl === "string") {
        cachedBuildUrl = buildUrl;
        cacheTimestamp = now;
        return buildUrl;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch latest build URL:", error);
  }

  // Fallback to project URL if API fails
  return EXPO_PROJECT_URL;
}

// ─── Generated URLs ───────────────────────────────────────────────────────────
/**
 * Deep link for referral system
 * - Development: studenexamapp://ref/{userId}
 * - Production: Uses latest build URL with referral parameter
 */
export async function generateReferralLink(userId: string): Promise<{
  deepLink: string;
  webLink: string;
  displayLink: string;
}> {
  if (IS_DEVELOPMENT) {
    // Development mode - use native deep link
    const deepLink = `studenexamapp://ref/${userId}`;
    return {
      deepLink,
      webLink: deepLink,
      displayLink: deepLink,
    };
  } else {
    // Production mode - use latest build URL with referral parameter
    const deepLink = `studenexamapp://ref/${userId}`;
    const baseUrl = await getLatestBuildUrl();
    const webLink = `${baseUrl}?referral=${userId}`;
    
    return {
      deepLink,
      webLink,
      displayLink: deepLink,
    };
  }
}

/**
 * Get the base URL for the app
 * Used for generating universal links
 */
export async function getAppBaseUrl(): Promise<string> {
  if (IS_DEVELOPMENT) {
    return "studenexamapp://";
  } else {
    return await getLatestBuildUrl();
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
