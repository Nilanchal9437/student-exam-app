import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Term, fetchTermsByExam } from "../../lib/termService";

// ─── Term colour palette (cycles per card) ────────────────────────────────────
const TERM_COLORS = [
  { bg: "#EFF6FF", icon: "#2452FF", border: "#BFDBFE" },
  { bg: "#F0FDF4", icon: "#16A34A", border: "#BBF7D0" },
  { bg: "#FFF7ED", icon: "#EA580C", border: "#FED7AA" },
  { bg: "#FAF5FF", icon: "#7C3AED", border: "#E9D5FF" },
];

// ─── Term Card ────────────────────────────────────────────────────────────────
function TermCard({
  term,
  index,
  examName,
}: {
  term: Term;
  index: number;
  examName: string;
}) {
  const router = useRouter();
  const palette = TERM_COLORS[index % TERM_COLORS.length];

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: "/(main)/subject",
          params: { termId: term._id, termName: term.name, examName },
        })
      }
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 flex-row items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: palette.border,
      }}
    >
      {/* Icon */}
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center mr-3"
        style={{ backgroundColor: palette.bg }}
      >
        <MaterialCommunityIcons
          name="calendar-text-outline"
          size={26}
          color={palette.icon}
        />
      </View>

      {/* Info */}
      <View className="flex-1">
        <Text className="text-gray-900 dark:text-white font-bold text-base mb-1">
          {term.name}
        </Text>
        <View className="flex-row items-center gap-1">
          <Ionicons name="book-outline" size={12} color="#6B7280" />
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">
            {examName}
          </Text>
        </View>
      </View>

      {/* Chevron */}
      <View
        className="w-9 h-9 rounded-xl items-center justify-center"
        style={{ backgroundColor: palette.bg }}
      >
        <Ionicons name="chevron-forward" size={18} color={palette.icon} />
      </View>
    </TouchableOpacity>
  );
}

// ─── Empty / Error State ──────────────────────────────────────────────────────
function EmptyState({
  error,
  onRetry,
}: {
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <Ionicons
          name={error ? "cloud-offline-outline" : "calendar-outline"}
          size={28}
          color="#9CA3AF"
        />
      </View>
      <Text className="text-gray-900 dark:text-white font-bold text-base text-center mb-1">
        {error ? "Failed to load terms" : "No terms found"}
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center leading-5 mb-4">
        {error ?? "No terms are available for this exam yet."}
      </Text>
      {error && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-brand-blue px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-bold text-sm">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Term Screen ──────────────────────────────────────────────────────────────
export default function TermScreen() {
  const router = useRouter();
  const { examId, examName } = useLocalSearchParams<{
    examId: string;
    examName: string;
  }>();

  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTerms = useCallback(async () => {
    if (!examId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchTermsByExam(examId);
      setTerms(res.data.terms);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to load terms.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [examId]);

  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2452FF" />
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">
          Loading terms…
        </Text>
      </View>
    );
  }

  const ListHeader = (
    <>
      {/* Blue info banner — same style as Exam's PremiumBanner */}
      <View
        className="mx-4 mt-4 rounded-2xl px-5 pt-6 pb-5 overflow-hidden"
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
          style={{
            position: "absolute", top: -30, right: -30,
            width: 110, height: 110, borderRadius: 55,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View
          style={{
            position: "absolute", top: 20, right: 30,
            width: 60, height: 60, borderRadius: 30,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
        <View className="flex-row items-center gap-2 mb-1">
          <MaterialCommunityIcons
            name="calendar-month-outline"
            size={16}
            color="rgba(255,255,255,0.85)"
          />
          <Text className="text-white/80 text-xs font-semibold uppercase tracking-widest">
            Select a Term
          </Text>
        </View>
        <Text className="text-white text-xl font-bold mb-1">{examName}</Text>
        <Text className="text-white/75 text-sm leading-5">
          {terms.length} term{terms.length !== 1 ? "s" : ""} available — choose one to continue
        </Text>
      </View>

      {/* Section label */}
      <View className="flex-row items-center justify-between px-4 mt-5 mb-3">
        <Text className="text-gray-900 dark:text-white text-base font-bold">
          Available Terms
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
          {terms.length} term{terms.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={terms}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <TermCard term={item} index={index} examName={examName ?? ""} />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyState error={error} onRetry={loadTerms} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        removeClippedSubviews
        initialNumToRender={8}
      />
    </View>
  );
}
