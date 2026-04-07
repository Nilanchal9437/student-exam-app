/**
 * Build & Publish Guide for Expo Published App
 * 
 * Steps to build and publish your app to Expo
 */

// ─── Step 1: Install EAS CLI ──────────────────────────────────────────────────
// npm install -g eas-cli

// ─── Step 2: Login to Expo ────────────────────────────────────────────────────
// eas login
// (Enter your Expo account credentials)

// ─── Step 3: Configure EAS Build ──────────────────────────────────────────────
// Create eas.json in your project root (usually already exists)
// Make sure it includes your EAS project ID from app.json

// ─── Step 4: Build for iOS & Android ──────────────────────────────────────────
// For development/preview builds:
// eas build --platform ios --profile preview
// eas build --platform android --profile preview

// For production builds:
// eas build --platform ios
// eas build --platform android

// ─── Step 5: Submit to App Stores ─────────────────────────────────────────────
// For iOS (TestFlight/App Store):
// eas submit --platform ios

// For Android (Google Play):
// eas submit --platform android

// ─── Step 6: Publish App on Expo ──────────────────────────────────────────────
// After building, publish the updates:
// expo publish

// OR use the newer method:
// eas update

// ─── REFERRAL LINKS AFTER PUBLISHING ──────────────────────────────────────────
// Once published on Expo, the app will automatically generate:
//
// 1. DEVELOPMENT (Expo Go/local testing):
//    studenexamapp://ref/{userId}
//
// 2. PRODUCTION (Published on Expo):
//    studenexamapp://ref/{userId} (if app is installed)
//    https://expo.dev/@nilanchal/studen-exam-app?referral={userId} (web fallback)
//
// The appConfig.ts automatically detects the environment and generates
// the correct URL format!

// ─── TESTING REFERRAL LINKS ───────────────────────────────────────────────────
// 
// Test with Expo CLI (development):
// 1. Start dev server: npx expo start
// 2. Scan QR code with Expo Go
// 3. Open referral link: studenexamapp://ref/USER_ID
//
// Test with published app:
// 1. Download app from Expo: https://expo.dev/@nilanchal/studen-exam-app
// 2. Open referral link: studenexamapp://ref/USER_ID
// 3. Or use web link for users without app installed

// ─── ENVIRONMENT VARIABLES ────────────────────────────────────────────────────
// The app uses Constants from expo-constants to detect environment:
// - __DEV__ = true when running Expo Go/dev server
// - __DEV__ = false when running published app
//
// This is automatic - no additional configuration needed!

// ─── DEEP LINK CONFIGURATION ──────────────────────────────────────────────────
// app.json includes:
// - "scheme": "studenexamapp" - Custom URL scheme for deep linking
// - "package": "com.nilanchal.studenexamapp" - Android package name
// - "bundleIdentifier": "com.nilanchal.studenexamapp" - iOS bundle ID
// - "extra.expoProjectOwner": "nilanchal" - Your Expo username
// - "extra.appSlug": "studen-exam-app" - Your app slug

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    REFERRAL LINKS AUTO-DETECTION                          ║
╠════════════════════════════════════════════════════════════════════════════╣
║                                                                            ║
║  ✅ Development (Expo Go):                                               ║
║     studenexamapp://ref/{userId}                                         ║
║                                                                            ║
║  ✅ Production (Expo Published):                                         ║
║     Primary: studenexamapp://ref/{userId}                                ║
║     Fallback: https://expo.dev/@nilanchal/studen-exam-app?referral={id}  ║
║                                                                            ║
║  ✅ Works for both iOS and Android                                       ║
║  ✅ Automatically detects environment                                    ║
║  ✅ No manual configuration needed                                       ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝
`);
