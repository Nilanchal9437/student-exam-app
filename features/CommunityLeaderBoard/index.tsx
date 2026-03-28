/**
 * features/CommunityLeaderBoard/index.tsx
 *
 * Community Groups screen — fetches live groups from API.
 * - Non-members see a "Join" button; tapping it joins and unlocks the chat.
 * - Members see an "Open Chat" button; tapping navigates to /(main)/chat.
 * - Search filters by community name or exam name client-side.
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  Community,
  fetchCommunities,
  joinCommunity,
} from "../../lib/communityService";

// ─── Icon palette (cycled per card) ──────────────────────────────────────────
const ICON_PALETTE = [
  { icon: "school-outline",       bg: "#EEF1FF", color: "#2452FF" },
  { icon: "flask-outline",        bg: "#F3E8FF", color: "#8B5CF6" },
  { icon: "calculator-variant-outline", bg: "#ECFDF5", color: "#10B981" },
  { icon: "book-open-variant",    bg: "#FFF7ED", color: "#F97316" },
  { icon: "head-check",           bg: "#FEF2F2", color: "#EF4444" },
  { icon: "note-edit",            bg: "#F0FDF4", color: "#16A34A" },
];

function paletteFor(idx: number) {
  return ICON_PALETTE[idx % ICON_PALETTE.length];
}

// ─── Empty / Error ─────────────────────────────────────────────────────────────
function EmptyState({
  query, error, onRetry,
}: {
  query: string; error: string | null; onRetry: () => void;
}) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <Ionicons
          name={error ? "cloud-offline-outline" : "people-outline"}
          size={36} color="#9CA3AF"
        />
      </View>
      <Text className="text-gray-900 dark:text-white font-bold text-lg text-center mb-2">
        {error ? "Failed to load groups" : query ? "No groups found" : "No communities yet"}
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center leading-5 mb-5">
        {error
          ? error
          : query
          ? `No results for "${query}".`
          : "Communities will appear here once they're created."}
      </Text>
      {error && (
        <TouchableOpacity onPress={onRetry} activeOpacity={0.85}
          className="bg-brand-blue px-8 py-3 rounded-2xl">
          <Text className="text-white font-bold text-sm">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Community Card ───────────────────────────────────────────────────────────
function CommunityCard({
  item, index, onJoin, onOpen, joining,
}: {
  item: Community;
  index: number;
  onJoin: (id: string) => void;
  onOpen: (item: Community) => void;
  joining: boolean;
}) {
  const { icon, bg, color } = paletteFor(index);

  return (
    <View
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl p-4"
      style={{
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
        borderWidth: 1,
        borderColor: item.isMember ? "#DCFCE7" : "#F1F5F9",
      }}
    >
      {/* ── Top row: icon + info ── */}
      <View className="flex-row items-start gap-3 mb-3">
        <View
          className="w-14 h-14 rounded-2xl items-center justify-center flex-shrink-0"
          style={{ backgroundColor: bg }}
        >
          <MaterialCommunityIcons name={icon as any} size={26} color={color} />
        </View>

        <View className="flex-1">
          {/* Name + member badge */}
          <View className="flex-row items-center gap-2 flex-wrap mb-1">
            <Text
              className="text-gray-900 dark:text-white font-bold text-base leading-tight flex-shrink"
              numberOfLines={2}
            >
              {item.name}
            </Text>
            {item.isMember && (
              <View className="bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                <Text className="text-green-600 dark:text-green-400 text-[10px] font-bold uppercase tracking-wide">
                  Joined
                </Text>
              </View>
            )}
            {!item.isOpen && (
              <View className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                <Text className="text-gray-500 dark:text-gray-400 text-[10px] font-bold uppercase tracking-wide">
                  Closed
                </Text>
              </View>
            )}
          </View>

          {/* Exam tag */}
          <View className="flex-row items-center gap-1">
            <Ionicons name="school-outline" size={11} color="#9CA3AF" />
            <Text className="text-xs text-gray-400 dark:text-gray-500 font-semibold" numberOfLines={1}>
              {item.examName ||
                (typeof item.exam === "object" ? item.exam.name : item.examName)}
            </Text>
          </View>
        </View>
      </View>

      {/* ── Description ── */}
      {!!item.description && (
        <Text
          className="text-gray-500 dark:text-gray-400 text-xs leading-4 mb-3"
          numberOfLines={2}
        >
          {item.description}
        </Text>
      )}

      {/* ── Stats + Action row ── */}
      <View className="flex-row items-center justify-between">
        {/* Member count */}
        <View className="flex-row items-center gap-1.5">
          <Ionicons name="people-outline" size={13} color="#9CA3AF" />
          <Text className="text-xs text-gray-400 dark:text-gray-500 font-semibold">
            {item.memberCount?.toLocaleString() ?? 0} member{item.memberCount !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Action button */}
        {item.isMember ? (
          // Already a member → open chat directly
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onOpen(item)}
            className="flex-row items-center gap-1.5 rounded-xl py-2 px-4"
            style={{ backgroundColor: "#16A34A" }}
          >
            <Ionicons name="chatbubble-ellipses" size={13} color="white" />
            <Text className="text-white font-bold text-sm">Open Chat</Text>
          </TouchableOpacity>
        ) : item.isOpen ? (
          // Not a member, group is open → show Join
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onJoin(item._id)}
            disabled={joining}
            className="flex-row items-center gap-1.5 rounded-xl py-2 px-4"
            style={{ backgroundColor: joining ? "#93C5FD" : "#2452FF" }}
          >
            {joining ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="person-add" size={13} color="white" />
            )}
            <Text className="text-white font-bold text-sm">
              {joining ? "Joining…" : "Join"}
            </Text>
          </TouchableOpacity>
        ) : (
          // Closed group
          <View
            className="flex-row items-center gap-1.5 rounded-xl py-2 px-4"
            style={{ backgroundColor: "#E5E7EB" }}
          >
            <Ionicons name="lock-closed" size={13} color="#9CA3AF" />
            <Text className="font-bold text-sm" style={{ color: "#9CA3AF" }}>Closed</Text>
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CommunityLeaderBoardScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";

  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchVisible, setSearchVisible] = useState(false);

  // Track which community is currently being joined (to show per-card spinner)
  const [joiningId, setJoiningId] = useState<string | null>(null);

  // ── Load ──────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchCommunities({ limit: 50 });
      setCommunities(res.data.communities);
    } catch {
      setError("Failed to load communities. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Client-side search ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return communities;
    const q = search.trim().toLowerCase();
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.examName.toLowerCase().includes(q)
    );
  }, [communities, search]);

  // ── Join handler ──────────────────────────────────────────────────────────
  const handleJoin = useCallback(async (id: string) => {
    setJoiningId(id);
    try {
      await joinCommunity(id);
      // Optimistically mark as member in local state
      setCommunities((prev) =>
        prev.map((c) =>
          c._id === id
            ? { ...c, isMember: true, memberCount: (c.memberCount ?? 0) + 1 }
            : c
        )
      );
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to join community.";
      Alert.alert("Join Failed", msg);
    } finally {
      setJoiningId(null);
    }
  }, []);

  // ── Open chat (members only) ──────────────────────────────────────────────
  const handleOpen = useCallback((item: Community) => {
    router.push({
      pathname: "/(main)/chat",
      params: { communityId: item._id, communityName: item.name },
    });
  }, [router]);

  // ── Stats summary ─────────────────────────────────────────────────────────
  const joined = communities.filter((c) => c.isMember).length;

  const ListHeader = (
    <>
      {/* ── Page hero */}
      <View
        className="mx-4 mt-4 mb-4 rounded-2xl px-5 pt-5 pb-5 overflow-hidden"
        style={{
          backgroundColor: "#2452FF",
          shadowColor: "#2452FF", shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.3, shadowRadius: 16, elevation: 10,
        }}
      >
        <View style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.08)" }} />
        <View style={{ position: "absolute", top: 30, right: 40, width: 55, height: 55, borderRadius: 27, backgroundColor: "rgba(255,255,255,0.06)" }} />

        <Text className="text-white text-xl font-extrabold mb-1">Community Groups</Text>
        <Text className="text-white/70 text-sm leading-5 mb-4" style={{ maxWidth: 260 }}>
          Join exam-based groups, discuss questions, and get help from peers.
        </Text>
        <View className="flex-row gap-4">
          <View>
            <Text className="text-white font-extrabold text-lg">{communities.length}</Text>
            <Text className="text-white/60 text-[10px] uppercase tracking-wide">Groups</Text>
          </View>
          <View className="w-px bg-white/20" />
          <View>
            <Text className="text-white font-extrabold text-lg">{joined}</Text>
            <Text className="text-white/60 text-[10px] uppercase tracking-wide">Joined</Text>
          </View>
        </View>
      </View>

      {/* ── Section label */}
      <View className="flex-row items-center justify-between px-4 mb-3">
        <Text className="text-gray-900 dark:text-white font-bold text-base">
          All Groups
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
          {filtered.length} group{filtered.length !== 1 ? "s" : ""}
        </Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <View className="bg-white dark:bg-gray-900 flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
            <Ionicons name="arrow-back" size={20} color={isDark ? "#F9FAFB" : "#111827"} />
          </TouchableOpacity>
          <Text className="text-base font-extrabold text-gray-900 dark:text-white">Community</Text>
          <View className="w-9" />
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2452FF" />
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">Loading groups…</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View
        className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2 }}
      >
        <View className="flex-row items-center justify-between px-4 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#F9FAFB" : "#111827"} />
          </TouchableOpacity>

          <Text className="text-base font-extrabold text-gray-900 dark:text-white">
            Community
          </Text>

          <TouchableOpacity
            onPress={() => setSearchVisible((v) => !v)}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
          >
            <Ionicons
              name={searchVisible ? "close" : "search-outline"}
              size={18}
              color={isDark ? "#F9FAFB" : "#111827"}
            />
          </TouchableOpacity>
        </View>

        {/* Search box */}
        {searchVisible && (
          <View className="mx-4 mb-3 flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 gap-2">
            <Ionicons name="search-outline" size={16} color="#9CA3AF" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search groups or exams…"
              placeholderTextColor="#9CA3AF"
              autoFocus
              className="flex-1 text-sm text-gray-900 dark:text-white p-0"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── List ─────────────────────────────────────────────────────────────── */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item, index }) => (
          <CommunityCard
            item={item}
            index={index}
            onJoin={handleJoin}
            onOpen={handleOpen}
            joining={joiningId === item._id}
          />
        )}
        ListEmptyComponent={
          <EmptyState query={search} error={error} onRetry={load} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        removeClippedSubviews
        initialNumToRender={8}
      />
    </View>
  );
}
