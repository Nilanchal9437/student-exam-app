import { useColorScheme } from "@/hooks/use-color-scheme";
import Header from "@/components/Header";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter, Stack } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ─── Theme tokens ─────────────────────────────────────────────────────────────
const LIGHT = {
  bg: "#ffffff",
  text: "#111827",
  border: "#F3F4F6",
};

const DARK = {
  bg: "#111827",
  text: "#F9FAFB",
  border: "#1F2937",
};

// ─── Tab definitions ──────────────────────────────────────────────────────────
type TabRoute = "/(main)/home" | "/(main)/exam" | "/(main)/results" | "/(main)/community" | "/(main)/profile";

type TabDef = {
  label: string;
  route: TabRoute;
  iconActive: React.ReactNode;
  iconInactive: React.ReactNode;
};

const TABS: TabDef[] = [
  {
    label: "Home",
    route: "/(main)/home",
    iconActive: <Ionicons name="home" size={22} color="#2452FF" />,
    iconInactive: <Ionicons name="home-outline" size={22} color="#9CA3AF" />,
  },
  {
    label: "Exams",
    route: "/(main)/exam",
    iconActive: (
      <MaterialCommunityIcons name="book-open" size={22} color="#2452FF" />
    ),
    iconInactive: (
      <MaterialCommunityIcons
        name="book-open-outline"
        size={22}
        color="#9CA3AF"
      />
    ),
  },
  {
    label: "Results",
    route: "/(main)/results",
    iconActive: <Ionicons name="bar-chart" size={22} color="#2452FF" />,
    iconInactive: (
      <Ionicons name="bar-chart-outline" size={22} color="#9CA3AF" />
    ),
  },
  {
    label: "Chat",
    route: "/(main)/community",
    iconActive: <Ionicons name="chatbubbles" size={22} color="#2452FF" />,
    iconInactive: (
      <Ionicons name="chatbubbles-outline" size={22} color="#9CA3AF" />
    ),
  },
  {
    label: "Profile",
    route: "/(main)/profile",
    iconActive: <Ionicons name="person" size={22} color="#2452FF" />,
    iconInactive: (
      <Ionicons name="person-outline" size={22} color="#9CA3AF" />
    ),
  },
];

// ─── Bottom Nav Bar ───────────────────────────────────────────────────────────
function BottomNav({ isDark }: { isDark: boolean }) {
  const router = useRouter();
  const pathname = usePathname();

  const t = isDark ? DARK : LIGHT;

  return (
    <View
      style={{
        backgroundColor: t.bg,
        borderTopWidth: 1,
        borderTopColor: t.border,
        flexDirection: "row",
        paddingBottom: 0, // SafeAreaView handles inset
      }}
    >
      {TABS.map((tab) => {
        const isActive =
          pathname === tab.route ||
          pathname === tab.route.replace("/(main)", "") ||
          pathname.startsWith(tab.route + "/");

        return (
          <TouchableOpacity
            key={tab.route}
            activeOpacity={0.8}
            onPress={() => router.push(tab.route)}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 10,
              gap: 3,
            }}
          >
            {/* Active indicator dot */}
            {isActive && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  width: 32,
                  height: 3,
                  borderBottomLeftRadius: 4,
                  borderBottomRightRadius: 4,
                  backgroundColor: "#2452FF",
                }}
              />
            )}

            {isActive ? tab.iconActive : tab.iconInactive}

            <Text
              style={{
                fontSize: 11,
                fontWeight: isActive ? "700" : "500",
                color: isActive ? "#2452FF" : "#9CA3AF",
              }}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────
export default function MainLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const t = isDark ? DARK : LIGHT;

  return (
    // SafeAreaView wraps both the stack content AND the bottom nav, so the nav
    // bar sits above the home indicator / gesture bar on all devices.
    <SafeAreaView
      style={{ flex: 1, backgroundColor: t.bg }}
      edges={["top", "bottom"]}
    >
      <View style={{ flex: 1 }}>
        <Header />
        <Stack>
          <Stack.Screen name="home" options={{ headerShown: false }} />
          <Stack.Screen name="exam" options={{ headerShown: false }} />
          <Stack.Screen name="term" options={{ headerShown: false }} />
          <Stack.Screen name="subject" options={{ headerShown: false }} />
          <Stack.Screen name="test" options={{ headerShown: false }} />
          <Stack.Screen name="scrabble" options={{ headerShown: false }} />
          <Stack.Screen name="community" options={{ headerShown: false }} />
          <Stack.Screen name="chat" options={{ headerShown: false }} />
          <Stack.Screen name="results" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
          <Stack.Screen name="reference" options={{ headerShown: false }} />
        </Stack>
      </View>

      {/* Persistent bottom tab bar */}
      <BottomNav isDark={isDark} />
    </SafeAreaView>
  );
}
