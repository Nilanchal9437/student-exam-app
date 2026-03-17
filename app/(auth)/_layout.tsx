import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";

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
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "Create Account",
          headerStyle: {
            backgroundColor: t.bg,
          },
          headerTintColor: t.text,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            color: t.text,
          },
          headerShadowVisible: false, // remove the bottom border line
          contentStyle: { backgroundColor: t.bg },
        }}
      />
      <Stack.Screen
        name="login"
        options={{
          title: "Login",
          headerStyle: {
            backgroundColor: t.bg,
          },
          headerTintColor: t.text,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            color: t.text,
          },
          headerShadowVisible: false, // remove the bottom border line
          contentStyle: { backgroundColor: t.bg },
        }}
      />
      <Stack.Screen
        name="forget-password"
        options={{
          title: "Forgot Password",
          headerStyle: {
            backgroundColor: t.bg,
          },
          headerTintColor: t.text,
          headerTitleStyle: {
            fontWeight: "700",
            fontSize: 17,
            color: t.text,
          },
          headerShadowVisible: false,
          contentStyle: { backgroundColor: t.bg },
        }}
      />
    </Stack>
  );
}
