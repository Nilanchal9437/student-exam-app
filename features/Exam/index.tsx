import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
type TagIconName = "school" | "devices" | "star" | "menu-book";
type ExamIconName =
  | "book-open-variant"
  | "bank"
  | "head-check"
  | "note-edit"
  | "pencil-box-outline"
  | "flask-outline"
  | "calculator-variant-outline"
  | "laptop";

type FilterTab = "all" | "locked" | "unlocked";

export type ExamItem = {
  id: string;
  name: string;
  price: string;
  period: string;
  tag: string;
  tagIcon: TagIconName;
  iconName: ExamIconName;
  unlocked: boolean;
};

// ─── Initial Data ─────────────────────────────────────────────────────────────
// Add or remove items here – the FlatList picks up changes automatically.
const INITIAL_EXAMS: ExamItem[] = [
  {
    id: "bece",
    name: "BECE",
    price: "₦4,000",
    period: "annual access",
    tag: "JUNIOR SECONDARY",
    tagIcon: "school",
    iconName: "book-open-variant",
    unlocked: false,
  },
  {
    id: "jamb",
    name: "JAMB (UTME)",
    price: "₦8,000",
    period: "annual access",
    tag: "CBT PRACTICE MODE",
    tagIcon: "devices",
    iconName: "bank",
    unlocked: false,
  },
  {
    id: "waec",
    name: "WAEC (WASSCE)",
    price: "₦8,000",
    period: "annual access",
    tag: "PAST QUESTIONS & SOLUTIONS",
    tagIcon: "star",
    iconName: "head-check",
    unlocked: false,
  },
  {
    id: "neco",
    name: "NECO (SSCE)",
    price: "₦8,000",
    period: "annual access",
    tag: "EXAM SYLLABUS INCLUDED",
    tagIcon: "menu-book",
    iconName: "note-edit",
    unlocked: true,
  },
  {
    id: "gce",
    name: "GCE (A-Level)",
    price: "₦6,000",
    period: "annual access",
    tag: "ADVANCED LEVEL",
    tagIcon: "school",
    iconName: "pencil-box-outline",
    unlocked: false,
  },
  {
    id: "postutme",
    name: "Post-UTME",
    price: "₦5,000",
    period: "annual access",
    tag: "UNIVERSITY ENTRANCE",
    tagIcon: "devices",
    iconName: "laptop",
    unlocked: false,
  },
  {
    id: "science",
    name: "Science Bowl",
    price: "₦3,500",
    period: "annual access",
    tag: "STEM FOCUSED",
    tagIcon: "star",
    iconName: "flask-outline",
    unlocked: true,
  },
  {
    id: "math_olympiad",
    name: "Math Olympiad",
    price: "₦3,000",
    period: "annual access",
    tag: "ADVANCED MATHEMATICS",
    tagIcon: "menu-book",
    iconName: "calculator-variant-outline",
    unlocked: false,
  },
];

// ─── Header ───────────────────────────────────────────────────────────────────
function Header() {
  return (
    <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-gray-900">
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
            Exam Portal
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium">
            Verified Academic Center
          </Text>
        </View>
      </View>

      <View className="flex-row items-center gap-3">
        <TouchableOpacity
          activeOpacity={0.7}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
        >
          <Ionicons name="notifications-outline" size={18} color="#6B7280" />
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-9 h-9 rounded-full bg-brand-blue items-center justify-center"
        >
          <Ionicons name="person" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
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
      {/* Decorative circles */}
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

      <Text className="text-white text-xl font-bold mb-1">Premium Access</Text>
      <Text
        className="text-white/75 text-sm leading-5 mb-5"
        style={{ maxWidth: 240 }}
      >
        Unlock unlimited practice tests and official past questions for your
        upcoming examinations.
      </Text>

      <View className="self-start flex-row items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
        <Ionicons name="shield-checkmark-outline" size={14} color="white" />
        <Text className="text-white text-xs font-semibold">
          Secure Payment Processing
        </Text>
      </View>
    </View>
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
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
  { key: "unlocked", label: "Unlocked" },
  { key: "locked", label: "Locked" },
];

function FilterTabs({
  active,
  onSelect,
  counts,
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
            style={{
              backgroundColor: isActive ? "#2452FF" : "#F1F5F9",
            }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: isActive ? "#fff" : "#6B7280" }}
            >
              {tab.label}
            </Text>
            <View
              className="rounded-full min-w-[18px] h-[18px] items-center justify-center px-1"
              style={{
                backgroundColor: isActive
                  ? "rgba(255,255,255,0.25)"
                  : "#E2E8F0",
              }}
            >
              <Text
                className="text-[10px] font-bold"
                style={{ color: isActive ? "#fff" : "#6B7280" }}
              >
                {counts[tab.key]}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
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
    <View className="flex-row items-center justify-between px-4 mt-5 mb-3">
      <Text className="text-gray-900 dark:text-white text-base font-bold">
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

// ─── Tag Icon ─────────────────────────────────────────────────────────────────
const TAG_ICON_MAP: Record<TagIconName, React.ReactNode> = {
  school: <MaterialIcons name="school" size={12} color="#6B7280" />,
  devices: <MaterialIcons name="devices" size={12} color="#6B7280" />,
  star: <MaterialIcons name="star-border" size={12} color="#6B7280" />,
  "menu-book": <MaterialIcons name="menu-book" size={12} color="#6B7280" />,
};

// ─── Exam Card ────────────────────────────────────────────────────────────────
function ExamCard({
  exam,
  onUnlock,
}: {
  exam: ExamItem;
  onUnlock: (id: string) => void;
}) {
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  return (
    <View
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 flex-row items-center"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: exam.unlocked ? "#DCFCE7" : "#F1F5F9",
      }}
    >
      {/* Icon */}
      <View
        className="w-14 h-14 rounded-2xl items-center justify-center"
        style={{
          backgroundColor: exam.unlocked ? "#DCFCE7" : "#EEF1FF",
        }}
      >
        <MaterialCommunityIcons
          name={exam.iconName}
          size={26}
          color={exam.unlocked ? "#16A34A" : "#2452FF"}
        />
      </View>

      {/* Info */}
      <View className="flex-1 ml-3">
        <View className="flex-row items-center gap-2 mb-0.5">
          <Text className="text-gray-900 dark:text-white font-bold text-base leading-tight">
            {exam.name}
          </Text>
          {exam.unlocked && (
            <View className="bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
              <Text className="text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide">
                Active
              </Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View className="flex-row items-baseline gap-1 mb-1.5">
          <Text
            className="font-bold text-sm"
            style={{ color: exam.unlocked ? "#16A34A" : "#2452FF" }}
          >
            {exam.price}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xs font-medium">
            / {exam.period}
          </Text>
        </View>

        {/* Tag */}
        <View className="flex-row items-center gap-1">
          {TAG_ICON_MAP[exam.tagIcon]}
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold tracking-wide uppercase">
            {exam.tag}
          </Text>
        </View>
      </View>

      {/* Action button */}
      {exam.unlocked ? (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            router.push({
              pathname: "/(main)/test",
              params: { examId: exam.id, examName: exam.name },
            })
          }
          className="rounded-xl py-2.5 px-4 flex-row items-center gap-1.5 bg-green-500"
        >
          <Ionicons name="play" size={13} color="white" />
          <Text className="text-white font-bold text-sm">Start</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          activeOpacity={0.85}
          onPressIn={() => setPressed(true)}
          onPressOut={() => setPressed(false)}
          onPress={() => onUnlock(exam.id)}
          className="rounded-xl py-2.5 px-4 flex-row items-center gap-1.5"
          style={{ backgroundColor: pressed ? "#1a3fd4" : "#2452FF" }}
        >
          <Ionicons name="lock-closed" size={13} color="white" />
          <Text className="text-white font-bold text-sm">Unlock</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ query }: { query: string }) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <View className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <Ionicons name="search-outline" size={28} color="#9CA3AF" />
      </View>
      <Text className="text-gray-900 dark:text-white font-bold text-base text-center mb-1">
        No results found
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center leading-5">
        {query.length > 0
          ? `No examinations matched "${query}". Try a different search term.`
          : "No examinations match the selected filter."}
      </Text>
    </View>
  );
}

// ─── Exam Screen ─────────────────────────────────────────────────────────────
export default function ExamScreen() {
  const [exams, setExams] = useState<ExamItem[]>(INITIAL_EXAMS);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");

  // Live-filter the exam list whenever search or tab changes
  const filtered = useMemo(() => {
    let list = exams;

    if (activeFilter === "unlocked") list = list.filter((e) => e.unlocked);
    if (activeFilter === "locked") list = list.filter((e) => !e.unlocked);

    if (search.trim().length > 0) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(q) || e.tag.toLowerCase().includes(q),
      );
    }

    return list;
  }, [exams, search, activeFilter]);

  // Counts for filter tab badges
  const counts = useMemo<Record<FilterTab, number>>(
    () => ({
      all: exams.length,
      unlocked: exams.filter((e) => e.unlocked).length,
      locked: exams.filter((e) => !e.unlocked).length,
    }),
    [exams],
  );

  // Toggle unlock state dynamically
  const handleUnlock = useCallback((id: string) => {
    setExams((prev) =>
      prev.map((e) => (e.id === id ? { ...e, unlocked: true } : e)),
    );
  }, []);

  // FlatList list header (banner + search + filters + section title)
  const ListHeader = useMemo(
    () => (
      <>
        <PremiumBanner />
        <SearchBar value={search} onChange={setSearch} />
        <FilterTabs
          active={activeFilter}
          onSelect={setActiveFilter}
          counts={counts}
        />
        <SectionHeader
          title="Available Examinations"
          action="View History"
          onAction={() => {}}
        />
      </>
    ),
    // Re-render header only when search/filter state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, activeFilter, counts],
  );

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Fixed app bar */}
      <Header />
      {ListHeader}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ExamCard exam={item} onUnlock={handleUnlock} />
        )}
        ListEmptyComponent={<EmptyState query={search} />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        // Performance optimisations
        removeClippedSubviews
        initialNumToRender={6}
        maxToRenderPerBatch={8}
        windowSize={10}
      />
    </View>
  );
}
