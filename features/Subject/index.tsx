import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import React, { useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ─── Data ──────────────────────────────────────────────────────────────────────
type Subject = {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  iconFamily: "MaterialIcons" | "MaterialCommunityIcons" | "Ionicons";
  aiQuestions: string;
  free: boolean;
};

const SUBJECTS: Subject[] = [
  {
    id: "math",
    title: "Mathematics",
    subtitle: "Calculus, Algebra, Geometry",
    icon: "function-variant",
    iconFamily: "MaterialCommunityIcons",
    aiQuestions: "AI-Generated Questions",
    free: true,
  },
  {
    id: "physics",
    title: "Physics",
    subtitle: "Mechanics, Optics, Electricity",
    icon: "flask-outline",
    iconFamily: "MaterialCommunityIcons",
    aiQuestions: "AI-Generated Questions",
    free: true,
  },
  {
    id: "biology",
    title: "Biology",
    subtitle: "Genetics, Ecology, Anatomy",
    icon: "leaf-outline",
    iconFamily: "Ionicons",
    aiQuestions: "AI-Generated Questions",
    free: false,
  },
  {
    id: "literature",
    title: "Literature",
    subtitle: "Drama, Poetry, Prose",
    icon: "book-open-variant",
    iconFamily: "MaterialCommunityIcons",
    aiQuestions: "AI-Generated Questions",
    free: false,
  },
  {
    id: "history",
    title: "History",
    subtitle: "Global Events, Civilizations",
    icon: "time-outline",
    iconFamily: "Ionicons",
    aiQuestions: "AI-Generated Questions",
    free: false,
  },
  {
    id: "geography",
    title: "Geography",
    subtitle: "Cartography, Environment",
    icon: "earth",
    iconFamily: "MaterialCommunityIcons",
    aiQuestions: "AI-Generated Questions",
    free: false,
  },
  {
    id: "chemistry",
    title: "Chemistry",
    subtitle: "Organic, Inorganic, Physical",
    icon: "flask",
    iconFamily: "MaterialCommunityIcons",
    aiQuestions: "AI-Generated Questions",
    free: false,
  },
  {
    id: "english",
    title: "English Language",
    subtitle: "Grammar, Comprehension, Writing",
    icon: "alphabetical",
    iconFamily: "MaterialCommunityIcons",
    aiQuestions: "AI-Generated Questions",
    free: false,
  },
];

// ─── SubjectIcon Helper ────────────────────────────────────────────────────────
function SubjectIcon({
  icon,
  iconFamily,
  color,
}: {
  icon: string;
  iconFamily: Subject["iconFamily"];
  color: string;
}) {
  if (iconFamily === "MaterialCommunityIcons") {
    return (
      <MaterialCommunityIcons name={icon as any} size={32} color={color} />
    );
  }
  if (iconFamily === "Ionicons") {
    return <Ionicons name={icon as any} size={32} color={color} />;
  }
  return <MaterialIcons name={icon as any} size={32} color={color} />;
}

// ─── Upgrade Banner ───────────────────────────────────────────────────────────
function UpgradeBanner() {
  return (
    <View
      className="mx-4 mt-4 mb-2 rounded-[18px] px-5 py-[18px] overflow-hidden"
      style={{
        backgroundColor: "#2452FF",
        shadowColor: "#2452FF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      {/* Decorative circles */}
      <View
        className="absolute rounded-full"
        style={{
          right: -30,
          top: -30,
          width: 120,
          height: 120,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
      <View
        className="absolute rounded-full"
        style={{
          right: 20,
          bottom: -40,
          width: 100,
          height: 100,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
      />

      {/* Badge */}
      <View className="self-start bg-white/20 px-[10px] py-1 rounded-full mb-[10px]">
        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
          Current Plan: Free
        </Text>
      </View>

      {/* Headline */}
      <Text className="text-white text-[22px] font-extrabold mb-1 leading-7">
        Unlock All Subjects
      </Text>
      <Text className="text-white/80 text-[13px] leading-[19px] mb-4">
        Get unlimited AI-generated quizzes for only ₦1,500/month
      </Text>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.88}
        className="self-start bg-white px-5 py-[10px] rounded-xl"
      >
        <Text className="text-brand-blue font-bold text-sm">Upgrade Now</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({
  value,
  onChangeText,
  isDark,
}: {
  value: string;
  onChangeText: (v: string) => void;
  isDark: boolean;
}) {
  return (
    <View className="mx-4 mt-4 mb-2 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-[14px] px-[14px] py-[11px] gap-x-[10px]">
      <Ionicons
        name="search-outline"
        size={18}
        color={isDark ? "#6B7280" : "#9CA3AF"}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search subjects..."
        placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
        className="flex-1 text-sm text-gray-900 dark:text-gray-50 p-0"
      />
      {value.length > 0 && (
        <TouchableOpacity onPress={() => onChangeText("")}>
          <Ionicons
            name="close-circle"
            size={18}
            color={isDark ? "#6B7280" : "#9CA3AF"}
          />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Free Subject Card ────────────────────────────────────────────────────────
function FreeSubjectCard({
  subject,
  isDark,
}: {
  subject: Subject;
  isDark: boolean;
}) {
  return (
    <View
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isDark ? 0 : 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Free Access Badge */}
      <View className="absolute top-[14px] right-[14px] bg-emerald-50 px-2 py-[3px] rounded-lg">
        <Text className="text-emerald-600 text-[10px] font-bold uppercase tracking-wider">
          Free Access
        </Text>
      </View>

      {/* Icon */}
      <View className="w-[52px] h-[52px] rounded-[14px] bg-brand-blue-light dark:bg-gray-700 items-center justify-center mb-3">
        <SubjectIcon
          icon={subject.icon}
          iconFamily={subject.iconFamily}
          color="#2452FF"
        />
      </View>

      {/* Title & subtitle */}
      <Text className="text-[17px] font-bold text-gray-900 dark:text-gray-50 mb-[3px]">
        {subject.title}
      </Text>
      <Text className="text-[13px] text-gray-500 dark:text-gray-400 mb-[10px]">
        {subject.subtitle}
      </Text>

      {/* AI label */}
      <View className="flex-row items-center gap-x-[5px] mb-[14px]">
        <MaterialCommunityIcons
          name="robot-outline"
          size={13}
          color={isDark ? "#9CA3AF" : "#6B7280"}
        />
        <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {subject.aiQuestions}
        </Text>
      </View>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.88}
        className="bg-brand-blue rounded-xl py-[13px] items-center"
      >
        <Text className="text-white font-bold text-[15px]">Start Learning</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Locked Subject Card ──────────────────────────────────────────────────────
function LockedSubjectCard({
  subject,
  isDark,
}: {
  subject: Subject;
  isDark: boolean;
}) {
  return (
    <View
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 opacity-80"
    >
      {/* Lock icon top-right */}
      <View className="absolute top-[14px] right-[14px]">
        <Ionicons
          name="lock-closed"
          size={18}
          color={isDark ? "#4B5563" : "#D1D5DB"}
        />
      </View>

      {/* Icon */}
      <View className="w-[52px] h-[52px] rounded-[14px] bg-gray-50 dark:bg-gray-700 items-center justify-center mb-3">
        <SubjectIcon
          icon={subject.icon}
          iconFamily={subject.iconFamily}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
      </View>

      {/* Title & subtitle */}
      <Text className="text-[17px] font-bold text-gray-700 dark:text-gray-400 mb-[3px]">
        {subject.title}
      </Text>
      <Text className="text-[13px] text-gray-400 dark:text-gray-500 mb-[10px]">
        {subject.subtitle}
      </Text>

      {/* AI label */}
      <View className="flex-row items-center gap-x-[5px] mb-[14px]">
        <MaterialCommunityIcons
          name="robot-outline"
          size={13}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
        <Text className="text-xs text-gray-400 dark:text-gray-500 font-medium">
          {subject.aiQuestions}
        </Text>
      </View>

      {/* Locked button */}
      <TouchableOpacity
        activeOpacity={0.88}
        className="bg-gray-100 dark:bg-gray-700 rounded-xl py-[13px] items-center flex-row justify-center gap-x-[6px]"
      >
        <Ionicons
          name="lock-closed"
          size={14}
          color={isDark ? "#6B7280" : "#9CA3AF"}
        />
        <Text className="text-gray-400 dark:text-gray-500 font-bold text-[15px]">
          Locked
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View className="px-4 mt-5 mb-2">
      <Text className="text-lg font-extrabold text-gray-900 dark:text-gray-50">
        {title}
      </Text>
    </View>
  );
}

// ─── Subject Screen ───────────────────────────────────────────────────────────
export default function SubjectScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [search, setSearch] = useState("");

  const freeSubjects = SUBJECTS.filter(
    (s) =>
      s.free &&
      (s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.subtitle.toLowerCase().includes(search.toLowerCase())),
  );

  const lockedSubjects = SUBJECTS.filter(
    (s) =>
      !s.free &&
      (s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.subtitle.toLowerCase().includes(search.toLowerCase())),
  );

  type ListItem =
    | { type: "banner" }
    | { type: "search" }
    | { type: "sectionHeader"; title: string }
    | { type: "freeCard"; subject: Subject }
    | { type: "lockedCard"; subject: Subject };

  const listData: ListItem[] = [
    { type: "banner" },
    { type: "search" },
    ...(freeSubjects.length > 0
      ? [
          { type: "sectionHeader" as const, title: "Free Subjects" },
          ...freeSubjects.map((s) => ({
            type: "freeCard" as const,
            subject: s,
          })),
        ]
      : []),
    ...(lockedSubjects.length > 0
      ? [
          { type: "sectionHeader" as const, title: "Premium Subjects" },
          ...lockedSubjects.map((s) => ({
            type: "lockedCard" as const,
            subject: s,
          })),
        ]
      : []),
  ];

  const renderItem = ({ item }: { item: ListItem }) => {
    switch (item.type) {
      case "banner":
        return <UpgradeBanner />;
      case "search":
        return (
          <SearchBar value={search} onChangeText={setSearch} isDark={isDark} />
        );
      case "sectionHeader":
        return <SectionHeader title={item.title} />;
      case "freeCard":
        return <FreeSubjectCard subject={item.subject} isDark={isDark} />;
      case "lockedCard":
        return <LockedSubjectCard subject={item.subject} isDark={isDark} />;
      default:
        return null;
    }
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="px-5 pt-[14px] pb-[14px] bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <Text className="text-2xl font-extrabold text-gray-900 dark:text-gray-50">
          Subjects
        </Text>
        <Text className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
          Choose a subject to start practising
        </Text>
      </View>

      {/* Content List */}
      <FlatList
        data={listData}
        keyExtractor={(item, index) => {
          if (item.type === "freeCard" || item.type === "lockedCard") {
            return item.subject.id;
          }
          return `${item.type}-${index}`;
        }}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      />
    </View>
  );
}
