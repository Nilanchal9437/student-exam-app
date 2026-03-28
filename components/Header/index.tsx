import { useAuth } from "@/context/AuthContext";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

type HeaderMeta = {
  title: string;
  subtitle?: string;
};

const HEADER_BY_ROUTE: Record<string, HeaderMeta> = {
  "/home": { title: "Exam Portal" },
  "/subject": { title: "Subjects" },
  "/exam": { title: "Exams", subtitle: "Verified Academic Center" },
  "/results": { title: "Results" },
  "/profile": { title: "Profile" },
  "/community": { title: "Community" },
  "/chat": { title: "Community Chat" },
  "/test": { title: "Practice Test" },
  "/scrabble": { title: "Scrabble" },
  "/reference": { title: "Referral Program", subtitle: "Earn by inviting friends" },
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const [menuOpen, setMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const headerMeta = useMemo<HeaderMeta>(() => {
    return HEADER_BY_ROUTE[pathname] ?? { title: "Exam Portal" };
  }, [pathname]);

  const handleNavigate = (route: "/(main)/profile" | "/(main)/reference") => {
    setMenuOpen(false);
    router.push(route as never);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logout(); // clears AsyncStorage + navigates to /(auth)/login
    } finally {
      setMenuOpen(false);
      setLoggingOut(false);
    }
  };

  return (
    <View className="relative z-20">
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <View className="flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-brand-blue/10 items-center justify-center">
            <MaterialCommunityIcons
              name="school-outline"
              size={22}
              color="#2452FF"
            />
          </View>
          <View>
            <Text className="text-gray-900 dark:text-white text-base font-bold leading-tight">
              {headerMeta.title}
            </Text>
            {headerMeta.subtitle ? (
              <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium">
                {headerMeta.subtitle}
              </Text>
            ) : null}
          </View>
        </View>

        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setMenuOpen((prev) => !prev)}
            className="w-9 h-9 rounded-full bg-brand-blue items-center justify-center"
          >
            <Ionicons name="menu" size={18} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Dropdown menu ───────────────────────────────────────────────── */}
      {menuOpen ? (
        <>
          {/* Invisible backdrop — tapping outside closes the menu */}
          <Pressable
            style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: -9999 }}
            onPress={() => setMenuOpen(false)}
          />

          <View className="absolute right-5 top-[68px] w-48 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
            {/* Profile */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleNavigate("/(main)/profile")}
              className="px-4 py-3 flex-row items-center gap-3"
            >
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                Profile
              </Text>
            </TouchableOpacity>

            <View className="h-px bg-gray-100 dark:bg-gray-700" />

            {/* Reference */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleNavigate("/(main)/reference")}
              className="px-4 py-3 flex-row items-center gap-3"
            >
              <Ionicons name="book-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                Reference
              </Text>
            </TouchableOpacity>

            {/* ── Divider before destructive action ── */}
            <View className="h-px bg-gray-200 dark:bg-gray-700" />

            {/* Logout */}
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={handleLogout}
              disabled={loggingOut}
              className="px-4 py-3 flex-row items-center gap-3"
              style={{ opacity: loggingOut ? 0.6 : 1 }}
            >
              {loggingOut ? (
                <ActivityIndicator size="small" color="#EF4444" />
              ) : (
                <Ionicons name="log-out-outline" size={16} color="#EF4444" />
              )}
              <Text className="text-red-500 text-sm font-semibold">
                {loggingOut ? "Logging out…" : "Logout"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}
