/**
 * hooks/use-referral.ts
 * 
 * Hook to extract referral ID from deep links.
 * Handles both development and production environments:
 * - Development: studenexamapp://ref/{userId}
 * - Production: https://expo.dev/@owner/app?referral={userId}
 */

import { useEffect, useState } from "react";
import * as Linking from "expo-linking";

export function useReferral() {
  const [referrerId, setReferrerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const handleDeepLink = async () => {
      try {
        // Get the initial URL if app was launched from a deep link
        const url = await Linking.getInitialURL();
        
        if (url != null) {
          // Handle both dev and production URL formats
          const userId = extractUserIdFromUrl(url);
          if (userId && isMounted) {
            setReferrerId(userId);
          }
        }
      } catch (err) {
        console.error("Error parsing deep link:", err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    handleDeepLink();

    // Optional: Listen for deep links while app is running
    const subscription = Linking.addEventListener("url", ({ url }) => {
      const userId = extractUserIdFromUrl(url);
      if (userId && isMounted) {
        setReferrerId(userId);
      }
    });

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, []);

  return { referrerId, isLoading };
}

/**
 * Extract user ID from both development and production deep links
 */
function extractUserIdFromUrl(url: string): string | null {
  try {
    const parsed = Linking.parse(url);
    
    // Development format: studenexamapp://ref/{userId}
    if (parsed.hostname === "ref" && parsed.path) {
      const userId = parsed.path.replace(/^\//, "");
      if (userId) return userId;
    }
    
    // Production format: https://expo.dev/@owner/app?referral={userId}
    if (url.includes("referral=")) {
      const params = new URLSearchParams(url.split("?")[1]);
      const userId = params.get("referral");
      if (userId) return userId;
    }
    
    return null;
  } catch (err) {
    console.error("Error extracting user ID from URL:", err);
    return null;
  }
}
