import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { Pressable, Text, TouchableOpacity, View } from "react-native";

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
  const [menuOpen, setMenuOpen] = useState(false);
  const headerMeta = useMemo<HeaderMeta>(() => {
    return HEADER_BY_ROUTE[pathname] ?? { title: "Exam Portal" };
  }, [pathname]);

  const handleNavigate = (route: "/(main)/profile" | "/(main)/reference") => {
    setMenuOpen(false);
    router.push(route as never);
  };

  return (
    <View className="relative z-20">
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

      {menuOpen ? (
        <>
          <Pressable
            className="absolute inset-0"
            onPress={() => setMenuOpen(false)}
          />
          <View className="absolute right-5 top-[68px] w-44 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md overflow-hidden">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleNavigate("/(main)/profile")}
              className="px-4 py-3 flex-row items-center gap-2"
            >
              <Ionicons name="person-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                Profile
              </Text>
            </TouchableOpacity>
            <View className="h-px bg-gray-200 dark:bg-gray-700" />
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleNavigate("/(main)/reference")}
              className="px-4 py-3 flex-row items-center gap-2"
            >
              <Ionicons name="book-outline" size={16} color="#6B7280" />
              <Text className="text-gray-700 dark:text-gray-200 text-sm font-medium">
                Reference
              </Text>
            </TouchableOpacity>
          </View>
        </>
      ) : null}
    </View>
  );
}
