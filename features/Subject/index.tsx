import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Subject, fetchSubjectsByTerm } from "../../lib/subjectService";

// ─── Icon map ─────────────────────────────────────────────────────────────────
type SubjectIconName =
  | "calculator-variant-outline"
  | "flask-outline"
  | "flask"
  | "leaf"
  | "alphabetical"
  | "book-open-variant"
  | "clock-time-four-outline"
  | "earth"
  | "chart-line"
  | "bank-outline"
  | "flask-empty-outline"
  | "layers-outline";

function iconForSubject(name: string): SubjectIconName {
  const n = name.toLowerCase();
  if (n.includes("math")) return "calculator-variant-outline";
  if (n.includes("physics")) return "flask-outline";
  if (n.includes("chemistry")) return "flask";
  if (n.includes("biology")) return "leaf";
  if (n.includes("english")) return "alphabetical";
  if (n.includes("literature")) return "book-open-variant";
  if (n.includes("history")) return "clock-time-four-outline";
  if (n.includes("geography")) return "earth";
  if (n.includes("economics")) return "chart-line";
  if (n.includes("government")) return "bank-outline";
  if (n.includes("science")) return "flask-empty-outline";
  return "layers-outline";
}

// ─── Card colour palette ───────────────────────────────────────────────────────
const CARD_COLORS = [
  { bg: "#EFF6FF", icon: "#2452FF", border: "#BFDBFE" },
  { bg: "#F0FDF4", icon: "#16A34A", border: "#BBF7D0" },
  { bg: "#FFF7ED", icon: "#EA580C", border: "#FED7AA" },
  { bg: "#FAF5FF", icon: "#7C3AED", border: "#E9D5FF" },
  { bg: "#FFF1F2", icon: "#E11D48", border: "#FECDD3" },
  { bg: "#F0FDFA", icon: "#0D9488", border: "#99F6E4" },
];

// ─── Subject Card ─────────────────────────────────────────────────────────────
function SubjectCard({
  subject,
  index,
  examName,
}: {
  subject: Subject;
  index: number;
  examName: string;
}) {
  const router = useRouter();
  const palette = CARD_COLORS[index % CARD_COLORS.length];
  const [pressed, setPressed] = useState(false);

  return (
    <View
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: palette.border,
        opacity: pressed ? 0.9 : 1,
      }}
    >
      {/* Top row */}
      <View className="flex-row items-center">
        {/* Icon */}
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center mr-3"
          style={{ backgroundColor: palette.bg }}
        >
          <MaterialCommunityIcons
            name={iconForSubject(subject.subjectName)}
            size={26}
            color={palette.icon}
          />
        </View>

        {/* Name */}
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-white font-bold text-base leading-tight mb-0.5">
            {subject.subjectName}
          </Text>
          <View className="flex-row items-center gap-1 mt-1">
            <MaterialCommunityIcons
              name="robot-outline"
              size={12}
              color="#6B7280"
            />
            <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
              AI-Generated Questions
            </Text>
          </View>
        </View>
      </View>

      {/* Start button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPressIn={() => setPressed(true)}
        onPressOut={() => setPressed(false)}
        onPress={() =>
          router.push({
            pathname: "/(main)/test",
            params: {
              subjectId: subject._id,
              subjectName: subject.subjectName,
              examName,
            },
          })
        }
        className="mt-3 rounded-xl py-3 flex-row items-center justify-center gap-2"
        style={{ backgroundColor: palette.icon }}
      >
        <Ionicons name="play" size={14} color="white" />
        <Text className="text-white font-bold text-sm">Start Test</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (t: string) => void;
}) {
  return (
    <View
      className="mx-4 mt-4 flex-row items-center bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 gap-3"
      style={{
        borderWidth: 1,
        borderColor: "#E2E8F0",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
        elevation: 2,
      }}
    >
      <Ionicons name="search-outline" size={18} color="#9CA3AF" />
      <TextInput
        value={value}
        onChangeText={onChange}
        placeholder="Search subjects…"
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

// ─── Empty / Error State ──────────────────────────────────────────────────────
function EmptyState({
  query,
  error,
  onRetry,
}: {
  query: string;
  error: string | null;
  onRetry: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <Ionicons
          name={error ? "cloud-offline-outline" : "search-outline"}
          size={28}
          color="#9CA3AF"
        />
      </View>
      <Text className="text-gray-900 dark:text-white font-bold text-base text-center mb-1">
        {error ? "Failed to load subjects" : "No results found"}
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center leading-5 mb-4">
        {error ??
          (query.length > 0
            ? `No subjects matched "${query}".`
            : "No subjects are available for this term.")}
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

// ─── Subject Screen ───────────────────────────────────────────────────────────
export default function SubjectScreen() {
  const { termId, termName, examName } = useLocalSearchParams<{
    termId: string;
    termName: string;
    examName: string;
  }>();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const loadSubjects = useCallback(async () => {
    if (!termId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSubjectsByTerm(termId);
      setSubjects(res.data.subjects);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to load subjects.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [termId]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);

  const filtered = useMemo(() => {
    if (!search.trim()) return subjects;
    const q = search.trim().toLowerCase();
    return subjects.filter((s) => s.subjectName.toLowerCase().includes(q));
  }, [subjects, search]);

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2452FF" />
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">
          Loading subjects…
        </Text>
      </View>
    );
  }

  const ListHeader = (
    <>
      {/* Blue banner — same as Exam/Term */}
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
            position: "absolute",
            top: -30,
            right: -30,
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: "rgba(255,255,255,0.08)",
          }}
        />
        <View
          style={{
            position: "absolute",
            top: 20,
            right: 30,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: "rgba(255,255,255,0.06)",
          }}
        />
        <View className="flex-row items-center gap-2 mb-1">
          <Ionicons
            name="layers-outline"
            size={16}
            color="rgba(255,255,255,0.85)"
          />
          <Text className="text-white/80 text-xs font-semibold uppercase tracking-widest">
            {termName}
          </Text>
        </View>
        <Text className="text-white text-xl font-bold mb-1">{examName}</Text>
        <Text className="text-white/75 text-sm leading-5">
          {subjects.length} subject{subjects.length !== 1 ? "s" : ""} available
          — choose one to start
        </Text>
      </View>

      {/* Search */}
      <SearchBar value={search} onChange={setSearch} />

      {/* Section header */}
      <View className="flex-row items-center justify-between px-4 mt-5 mb-3">
        <Text className="text-gray-900 dark:text-white text-base font-bold">
          Subjects
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
          {filtered.length} subject{filtered.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </>
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        renderItem={({ item, index }) => (
          <SubjectCard subject={item} index={index} examName={examName ?? ""} />
        )}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={
          <EmptyState query={search} error={error} onRetry={loadSubjects} />
        }
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
