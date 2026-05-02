/**
 * app/index.tsx
 * Root entry point — redirects based on persisted auth state.
 *
 * - isLoading → show splash/spinner (auth state not yet restored from AsyncStorage)
 * - accessToken exists → go to home (persistent login)
 * - no token → go to login
 */
import { useAuth } from "@/context/AuthContext";
import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { accessToken, isLoading } = useAuth();

  // Still reading from AsyncStorage — show a blank splash
  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#fff" }}>
        <ActivityIndicator size="large" color="#2452FF" />
      </View>
    );
  }

  // Logged in → go straight to home, never show auth screens
  if (accessToken) {
    return <Redirect href="/(main)/home" />;
  }

  // Not logged in → go to login
  return <Redirect href="/(auth)/login" />;
}
