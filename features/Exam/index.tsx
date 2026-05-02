import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Exam, fetchExams } from "../../lib/examService";

// ─── Types ────────────────────────────────────────────────────────────────────
type FilterTab = "all" | "free" | "premium";

// ─── Level → icon mapping ─────────────────────────────────────────────────────
type ExamIconName =
  | "book-open-variant"
  | "bank"
  | "head-check"
  | "note-edit"
  | "pencil-box-outline"
  | "flask-outline"
  | "calculator-variant-outline"
  | "laptop"
  | "school-outline";

function iconForLevel(level: string): ExamIconName {
  const map: Record<string, ExamIconName> = {
    Primary: "school-outline",
    JSS: "book-open-variant",
    SS: "head-check",
    JAMB: "bank",
    WAEC: "note-edit",
    NECO: "pencil-box-outline",
    University: "laptop",
  };
  return map[level] ?? "flask-outline";
}

// ─── Premium Banner ───────────────────────────────────────────────────────────
function PremiumBanner() {
  return (
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
      <Text className="text-white text-xl font-bold mb-1">Premium Access</Text>
      <Text className="text-white/75 text-sm leading-5 mb-5" style={{ maxWidth: 240 }}>
        Unlock unlimited practice tests and official past questions for your upcoming examinations.
      </Text>
      <View className="self-start flex-row items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
        <Ionicons name="shield-checkmark-outline" size={14} color="white" />
        <Text className="text-white text-xs font-semibold">Secure Payment Processing</Text>
      </View>
    </View>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({ value, onChange }: { value: string; onChange: (t: string) => void }) {
  return (
    <View
      className="mx-4 mt-4 flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 gap-3"
      style={{ borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
    >
      <Ionicons name="search-outline" size={18} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search examinations..."
        placeholderTextColor="#9CA3AF"
        className="flex-1 text-gray-900 dark:text-white text-sm font-medium"
        style={{ padding: 0 }}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
        clearButtonMode="while-editing"
      />
      {value.length > 0 && (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onChange("")}>
          <Ionicons name="close-circle" size={18} color="#9CA3AF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Filter Tabs ──────────────────────────────────────────────────────────────
const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All Exams" },
  { key: "free", label: "Free" },
  { key: "premium", label: "Premium" },
];

function FilterTabs({
  active, onSelect, counts,
}: {
  active: FilterTab;
  onSelect: (tab: FilterTab) => void;
  counts: Record<FilterTab, number>;
}) {
  return (
    <View className="flex-row px-4 mt-3 gap-2">
      {FILTER_TABS.map((tab) => {
        const isActive = active === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            activeOpacity={0.8}
            onPress={() => onSelect(tab.key)}
            className="flex-row items-center gap-1.5 px-4 py-2 rounded-full"
            style={{ backgroundColor: isActive ? "#2452FF" : "#F1F5F9" }}
          >
            <Text className="text-xs font-semibold" style={{ color: isActive ? "#fff" : "#6B7280" }}>
              {tab.label}
            </Text>
            <View
              className="rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
              style={{ backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#E2E8F0" }}
            >
              <Text className="text-[10px] font-bold" style={{ color: isActive ? "#fff" : "#6B7280" }}>
                {counts[tab.key]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Unlock stub (to be implemented later) ────────────────────────────────────
function showUnlockAlert(name: string) {
  Alert.alert(
    "🔒 Premium Exam",
    `"${name}" requires a premium subscription.\n\nUnlock functionality coming soon!`,
    [{ text: "OK", style: "default" }]
  );
}

// ─── Exam Card ────────────────────────────────────────────────────────────────
function ExamCard({ exam }: { exam: Exam }) {
  const router = useRouter();
  const [pressed, setPressed] = useState(false);
  const isFree = !exam.isPremium;
  const icon = iconForLevel(exam.level);

  return (
    <View
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 flex-row items-center"
      style={{
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
        borderWidth: 1,
        borderColor: isFree ? "#DCFCE7" : "#F1F5F9",
        opacity: isFree ? 1 : 0.85,
      }}
    >
      {/* Icon */}
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center"
        style={{ backgroundColor: isFree ? "#DCFCE7" : "#F3F4F6" }}
      >
        {/* Dim the icon for locked exams */}
        <MaterialCommunityIcons
          name={isFree ? icon : "lock"}
          size={26}
          color={isFree ? "#16A34A" : "#9CA3AF"}
        />
      </View>

      {/* Info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-2 mb-0.5 flex-wrap">
          <Text className="text-gray-900 dark:text-white font-bold text-base leading-tight">{exam.name}</Text>
          {isFree ? (
            <View className="bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
              <Text className="text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide">Free</Text>
            </View>
          ) : (
            <View className="bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-full flex-row items-center gap-1">
              <Ionicons name="lock-closed" size={9} color="#D97706" />
              <Text className="text-amber-600 dark:text-amber-400 text-[10px] font-bold uppercase tracking-wide">Premium</Text>
            </View>
          )}
        </View>

        {/* Level tag */}
        <View className="flex-row items-center gap-1 mt-1">
          <MaterialIcons name="school" size={12} color="#6B7280" />
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold tracking-wide uppercase">
            {exam.level}
          </Text>
        </View>
      </View>

      {/* Action — free: Start | premium: Locked */}
      {isFree ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onPress={() =>
            router.push({
              pathname: "/(main)/term",
              params: { examId: exam._id, examName: exam.name },
            })
          }
          className="rounded-xl py-2.5 px-4 flex-row items-center gap-1.5"
          style={{ backgroundColor: pressed ? "#15803D" : "#16A34A" }}
        >
          <Ionicons name="play" size={13} color="white" />
          <Text className="text-white font-bold text-sm">Start</Text>
        </TouchableOpacity>
      ) : (
        // TODO: replace with real payment/unlock flow
        <TouchableOpacity
          activeOpacity={0.75}
          onPress={() => showUnlockAlert(exam.name)}
          className="rounded-xl py-2.5 px-4 flex-row items-center gap-1.5"
          style={{ backgroundColor: "#E5E7EB" }}
        >
          <Ionicons name="lock-closed" size={13} color="#6B7280" />
          <Text className="font-bold text-sm" style={{ color: "#6B7280" }}>Locked</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query, error, onRetry }: { query: string; error: string | null; onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <Ionicons name={error ? "cloud-offline-outline" : "search-outline"} size={28} color="#9CA3AF" />
      </View>
      <Text className="text-gray-900 dark:text-white font-bold text-base text-center mb-1">
        {error ? "Failed to load exams" : "No results found"}
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center leading-5 mb-4">
        {error ?? (query.length > 0 ? `No exams matched "${query}".` : "No exams match the selected filter.")}
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

// ─── Exam Screen ──────────────────────────────────────────────────────────────
export default function ExamScreen() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  const loadExams = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExams();
      setExams(res.data.exams);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to load exams.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadExams(); }, [loadExams]);

  // Client-side filter + search
  const filtered = useMemo(() => {
    let list = exams;
    if (activeFilter === "free") list = list.filter((e) => !e.isPremium);
    if (activeFilter === "premium") list = list.filter((e) => e.isPremium);
    if (search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) => e.name.toLowerCase().includes(q) || e.level.toLowerCase().includes(q)
      );
    }
    return list;
  }, [exams, search, activeFilter]);

  const counts = useMemo<Record<FilterTab, number>>(
    () => ({
      all: exams.length,
      free: exams.filter((e) => !e.isPremium).length,
      premium: exams.filter((e) => e.isPremium).length,
    }),
    [exams]
  );

  const ListHeader = (
    <>
      <PremiumBanner />
      <SearchBar value={search} onChange={setSearch} />
      <FilterTabs active={activeFilter} onSelect={setActiveFilter} counts={counts} />
      <View className="flex-row items-center justify-between px-4 mt-5 mb-3">
        <Text className="text-gray-900 dark:text-white text-base font-bold">
          Available Examinations
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
          {filtered.length} exam{filtered.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2452FF" />
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">Loading exams…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => <ExamCard exam={item} />}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={<EmptyState query={search} error={error} onRetry={loadExams} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        removeClippedSubviews
        initialNumToRender={8}
        maxToRenderPerBatch={10}
        windowSize={10}
      />
    </View>
  );
}
