import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ─── Data ─────────────────────────────────────────────────────────────────────
const EXAM_TYPES = [
  { id: "jamb", label: "JAMB", sub: "UTME", color: "#F97316", bg: "#FFF7ED" },
  { id: "waec", label: "WAEC", sub: "SSCE", color: "#3B82F6", bg: "#EFF6FF" },
  { id: "neco", label: "NECO", sub: "SSCE", color: "#10B981", bg: "#ECFDF5" },
];

const LEADERBOARD = [
  { rank: 12, name: "You (Alex J.)", pts: 1240, isMe: true },
  { rank: 1, name: "Sarah Emeka", pts: 2850, isMe: false },
];

const SUBJECTS = [
  {
    id: "math",
    title: "Mathematics",
    topics: "12 topics available",
    free: true,
    color: "#1a5c3a",
    icon: "calculate",
  },
  {
    id: "english",
    title: "English Language",
    topics: "8 topics available",
    free: true,
    color: "#b84c17",
    icon: "menu-book",
  },
  {
    id: "physics",
    title: "Physics",
    topics: "Upgrade to Unlock",
    free: false,
    color: "#1e293b",
    icon: "science",
  },
  {
    id: "biology",
    title: "Biology",
    topics: "Upgrade to Unlock",
    free: false,
    color: "#1e293b",
    icon: "biotech",
  },
] as const;

// ─── VIP Banner ───────────────────────────────────────────────────────────────
function VIPBanner() {
  return (
    <View
      className="mx-4 mt-4 rounded-2xl px-5 py-5"
      style={{
        backgroundColor: "#2452FF",
        shadowColor: "#2452FF",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
      }}
    >
      {/* Badge */}
      <View className="self-start bg-white/20 px-3 py-1 rounded-full mb-3">
        <Text className="text-white text-xs font-bold tracking-widest uppercase">
          Premium Access
        </Text>
      </View>

      {/* Headline */}
      <Text className="text-white text-2xl font-bold mb-1">Upgrade to VIP</Text>
      <Text className="text-white/80 text-sm leading-5 mb-4">
        Unlock all 20+ subjects, detailed solutions, and unlimited mock exams.
      </Text>

      {/* CTA */}
      <TouchableOpacity
        activeOpacity={0.88}
        className="bg-white rounded-xl py-3 items-center justify-center"
      >
        <Text className="text-brand-blue font-bold text-base">
          Go Premium Now
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View className="flex-row items-center justify-between px-4 mt-6 mb-3">
      <Text className="text-gray-900 dark:text-white text-lg font-bold">
        {title}
      </Text>
      {action && (
        <TouchableOpacity activeOpacity={0.7} onPress={onAction}>
          <Text className="text-brand-blue text-sm font-semibold">
            {action}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Exam Prep Cards ──────────────────────────────────────────────────────────
function ExamPrepSection() {
  const router = useRouter();
  return (
    <>
      <SectionHeader
        title="Exam Prep"
        action="See All"
        onAction={() => router.push("/exam")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
      >
        {EXAM_TYPES.map((exam) => (
          <TouchableOpacity
            key={exam.id}
            activeOpacity={0.8}
            className="items-center justify-center bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl py-4 px-5"
            style={{ minWidth: 96 }}
          >
            <View
              className="w-14 h-14 rounded-full items-center justify-center mb-2"
              style={{ backgroundColor: exam.bg }}
            >
              <Text
                style={{ color: exam.color, fontSize: 15, fontWeight: "800" }}
              >
                {exam.label}
              </Text>
            </View>
            <Text className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
              {exam.sub}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </>
  );
}

// ─── Daily Leaderboard ────────────────────────────────────────────────────────
function LeaderboardSection() {
  return (
    <View className="mx-4 mt-5 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
      {/* Header row */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center gap-2">
          <Text style={{ fontSize: 18 }}>🏆</Text>
          <Text className="text-gray-900 dark:text-white font-bold text-base">
            Daily Leaderboard
          </Text>
        </View>
        <View className="flex-row items-center gap-1">
          <Ionicons name="time-outline" size={13} color="#9CA3AF" />
          <Text className="text-gray-400 text-xs font-medium">
            Ends in 4h 20m
          </Text>
        </View>
      </View>

      {/* Rows */}
      {LEADERBOARD.map((entry) => (
        <View
          key={entry.name}
          className={`flex-row items-center px-4 py-3 ${
            entry.isMe
              ? "bg-brand-blue/5 dark:bg-blue-900/20"
              : "bg-white dark:bg-gray-800"
          }`}
        >
          {/* Rank */}
          <Text
            className={`w-6 text-sm font-bold ${
              entry.isMe
                ? "text-brand-blue"
                : "text-gray-400 dark:text-gray-500"
            }`}
          >
            {entry.rank}
          </Text>

          {/* Avatar */}
          <View
            className={`w-9 h-9 rounded-full items-center justify-center mr-3 ${
              entry.isMe ? "bg-brand-blue/20" : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <Ionicons
              name="person"
              size={18}
              color={entry.isMe ? "#2452FF" : "#9CA3AF"}
            />
          </View>

          {/* Name */}
          <Text
            className={`flex-1 text-sm font-semibold ${
              entry.isMe
                ? "text-gray-900 dark:text-white"
                : "text-gray-700 dark:text-gray-300"
            }`}
          >
            {entry.name}
          </Text>

          {/* Points */}
          <Text
            className={`text-sm font-bold ${
              entry.isMe
                ? "text-brand-blue"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {entry.pts.toLocaleString()} pts
          </Text>
        </View>
      ))}

      {/* View full ranking */}
      <TouchableOpacity
        activeOpacity={0.7}
        className="py-3 items-center border-t border-gray-100 dark:border-gray-700"
      >
        <Text className="text-brand-blue font-semibold text-sm">
          View Full Ranking
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Subject Card ─────────────────────────────────────────────────────────────
function SubjectCard({
  title,
  topics,
  free,
  color,
  icon,
}: {
  title: string;
  topics: string;
  free: boolean;
  color: string;
  icon: string;
}) {
  return (
    <View className="flex-1 mb-4">
      {/* Thumbnail */}
      <View
        className="rounded-2xl h-36 items-center justify-center overflow-hidden mb-2"
        style={{ backgroundColor: color }}
      >
        {/* FREE badge */}
        {free && (
          <View className="absolute top-3 left-3 bg-green-500 px-2 py-0.5 rounded-full z-10">
            <Text className="text-white text-xs font-bold tracking-wider uppercase">
              Free
            </Text>
          </View>
        )}

        {/* Subject icon */}
        {free ? (
          <MaterialIcons
            name={icon as any}
            size={44}
            color="rgba(255,255,255,0.25)"
          />
        ) : (
          <View className="items-center gap-2">
            <View className="bg-white/15 rounded-full p-3">
              <Ionicons name="lock-closed" size={24} color="white" />
            </View>
          </View>
        )}
      </View>

      {/* Label */}
      <Text className="text-gray-900 dark:text-white font-bold text-sm px-1">
        {title}
      </Text>
      <Text
        className={`text-xs px-1 mt-0.5 font-medium ${
          free ? "text-gray-500 dark:text-gray-400" : "text-brand-blue"
        }`}
      >
        {topics}
      </Text>
    </View>
  );
}

// ─── My Subjects ─────────────────────────────────────────────────────────────
function MySubjectsSection() {
  const pairs = [
    [SUBJECTS[0], SUBJECTS[1]],
    [SUBJECTS[2], SUBJECTS[3]],
  ];

  return (
    <>
      <SectionHeader title="My Subjects" action="Add Subject" />
      <View className="px-4">
        {pairs.map((pair, pi) => (
          <View key={pi} className="flex-row gap-3">
            {pair.map((subject) => (
              <SubjectCard key={subject.id} {...subject} />
            ))}
          </View>
        ))}
      </View>
    </>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* VIP Upgrade Banner */}
        <VIPBanner />

        {/* Exam Prep */}
        <ExamPrepSection />

        {/* Daily Leaderboard */}
        <LeaderboardSection />

        {/* My Subjects */}
        <MySubjectsSection />
      </ScrollView>
    </View>
  );
}
