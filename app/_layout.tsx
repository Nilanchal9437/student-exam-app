import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import "../global.css";

// ─── Theme tokens (must match Login screen) ───────────────────────────────────
const LIGHT = {
  bg: "#ffffff",
  text: "#111827", // gray-900
  border: "#F3F4F6", // gray-100
};

const DARK = {
  bg: "#111827", // gray-900
  text: "#F9FAFB", // gray-50
  border: "#1F2937", // gray-800
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = isDark ? DARK : LIGHT;

  return (
    <ThemeProvider value={isDark ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar style={isDark ? "light" : "dark"} />
    </ThemeProvider>
  );
}
