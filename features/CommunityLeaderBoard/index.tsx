import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
export type LeaderboardEntry = {
  id: string;
  rank: number;
  name: string;
  school: string;
  coins: number;
  avatar: string; // initials fallback
  avatarColor: string;
  isMe?: boolean;
};

export type CommunityGroup = {
  id: string;
  name: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  lastSender: string;
  lastMessage: string;
  time: string;
  unread?: number;
  online?: boolean;
};

// ─── Hardcoded Data (swap with API later) ─────────────────────────────────────
const LEADERBOARD: LeaderboardEntry[] = [
  { id: "1", rank: 1, name: "Ayoade Samuel", school: "Sunshine High School", coins: 1250, avatar: "AS", avatarColor: "#F97316" },
  { id: "2", rank: 2, name: "Chioma A.",     school: "Lagos Science Academy",  coins: 1120, avatar: "CA", avatarColor: "#8B5CF6" },
  { id: "3", rank: 3, name: "Fatima B.",     school: "Abuja Model College",    coins: 980,  avatar: "FB", avatarColor: "#14B8A6" },
  { id: "4", rank: 4, name: "Ibrahim Yusuf", school: "Lagos Science Academy",  coins: 840,  avatar: "IY", avatarColor: "#F43F5E", isMe: false },
  { id: "5", rank: 5, name: "Blessing Okoro",school: "St. Peters College",     coins: 790,  avatar: "BO", avatarColor: "#F97316", isMe: true  },
  { id: "6", rank: 6, name: "Tunde Adeyemi", school: "Kings College Lagos",    coins: 720,  avatar: "TA", avatarColor: "#2452FF" },
  { id: "7", rank: 7, name: "Amaka Obi",     school: "Queens College Lagos",   coins: 680,  avatar: "AO", avatarColor: "#10B981" },
];

const GROUPS: CommunityGroup[] = [
  {
    id: "g1",
    name: "Senior Secondary 3",
    iconName: "school",
    iconBg: "#EEF1FF",
    iconColor: "#2452FF",
    lastSender: "Tunde",
    lastMessage: "Does anyone have the Math past questions for 2023?",
    time: "2:45 PM",
    online: true,
  },
  {
    id: "g2",
    name: "Science Students",
    iconName: "flask",
    iconBg: "#F3E8FF",
    iconColor: "#8B5CF6",
    lastSender: "Amaka",
    lastMessage: "The Physics lab report is due tomorrow, has everyone submitted?",
    time: "11:20 AM",
    unread: 5,
  },
  {
    id: "g3",
    name: "Arts & Humanities",
    iconName: "palette",
    iconBg: "#FFF3E0",
    iconColor: "#F97316",
    lastSender: "John",
    lastMessage: "Great discussion on African literature yesterday everyone!",
    time: "Yesterday",
  },
  {
    id: "g4",
    name: "Mathematics Club",
    iconName: "calculator",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
    lastSender: "Fatima",
    lastMessage: "Check out this integration trick I found online 🔥",
    time: "Mon",
    unread: 2,
  },
];

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({
  initials, color, size = 48, borderColor,
}: {
  initials: string; color: string; size?: number; borderColor?: string;
}) {
  return (
    <View
      style={{
        width: size, height: size, borderRadius: size / 2,
        backgroundColor: color + "22",
        alignItems: "center", justifyContent: "center",
        borderWidth: borderColor ? 3 : 0,
        borderColor: borderColor ?? "transparent",
      }}
    >
      <Text style={{ fontSize: size * 0.35, fontWeight: "800", color }}>{initials}</Text>
    </View>
  );
}

// ─── Podium Item ──────────────────────────────────────────────────────────────
function PodiumItem({ entry, isCenter }: { entry: LeaderboardEntry; isCenter?: boolean }) {
  const rankColors: Record<number, string> = { 1: "#F59E0B", 2: "#94A3B8", 3: "#F97316" };
  const badgeColor = rankColors[entry.rank] ?? "#6B7280";

  return (
    <View className={`items-center ${isCenter ? "mx-4" : "mt-6"}`}>
      <View className="relative">
        <Avatar
          initials={entry.avatar}
          color={entry.avatarColor}
          size={isCenter ? 76 : 60}
          borderColor={badgeColor}
        />
        {/* Rank badge */}
        <View
          className="absolute -bottom-2 left-1/2 w-6 h-6 rounded-full items-center justify-center"
          style={{ backgroundColor: badgeColor, transform: [{ translateX: -12 }] }}
        >
          <Text className="text-white text-[11px] font-extrabold">{entry.rank}</Text>
        </View>
        {/* Gold star for 1st */}
        {isCenter && (
          <View className="absolute -top-3 left-1/2" style={{ transform: [{ translateX: -10 }] }}>
            <Text style={{ fontSize: 20 }}>⭐</Text>
          </View>
        )}
      </View>
      <Text
        className={`mt-4 text-center font-bold ${isCenter ? "text-sm text-gray-900 dark:text-white" : "text-xs text-gray-700 dark:text-gray-300"}`}
        numberOfLines={1}
      >
        {entry.name}
      </Text>
      <Text
        className={`font-extrabold mt-0.5 ${isCenter ? "text-brand-blue text-base" : "text-gray-500 dark:text-gray-400 text-sm"}`}
      >
        {entry.coins.toLocaleString()}
      </Text>
    </View>
  );
}

// ─── Rank Row ─────────────────────────────────────────────────────────────────
function RankRow({ entry }: { entry: LeaderboardEntry }) {
  return (
    <View
      className={`flex-row items-center px-4 py-3 mx-4 mb-2 rounded-2xl ${entry.isMe ? "bg-brand-blue-light dark:bg-blue-900/20" : "bg-white dark:bg-gray-800"}`}
      style={{
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05, shadowRadius: 4, elevation: 1,
        borderWidth: 1,
        borderColor: entry.isMe ? "#C7D7FF" : "#F1F5F9",
      }}
    >
      <Text className={`w-6 text-sm font-bold mr-3 ${entry.isMe ? "text-brand-blue" : "text-gray-400 dark:text-gray-500"}`}>
        {entry.rank}
      </Text>
      <Avatar initials={entry.avatar} color={entry.avatarColor} size={42} />
      <View className="flex-1 ml-3">
        <Text className={`font-bold text-sm ${entry.isMe ? "text-brand-blue" : "text-gray-900 dark:text-white"}`}>
          {entry.name}
          {entry.isMe && <Text className="text-brand-blue text-xs font-semibold"> (You)</Text>}
        </Text>
        <Text className="text-xs text-gray-400 dark:text-gray-500 font-medium" numberOfLines={1}>
          {entry.school}
        </Text>
      </View>
      <View className="items-end">
        <Text className={`text-base font-extrabold ${entry.isMe ? "text-brand-blue" : "text-gray-800 dark:text-white"}`}>
          {entry.coins.toLocaleString()}
        </Text>
        <Text className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Coins</Text>
      </View>
    </View>
  );
}

// ─── Upgrade Banner ───────────────────────────────────────────────────────────
function UpgradeBanner() {
  return (
    <View
      className="mx-4 my-5 rounded-2xl px-5 py-5 overflow-hidden"
      style={{
        backgroundColor: "#2452FF",
        shadowColor: "#2452FF", shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
      }}
    >
      <View style={{ position: "absolute", top: -30, right: -30, width: 110, height: 110, borderRadius: 55, backgroundColor: "rgba(255,255,255,0.07)" }} />
      <View className="flex-row items-center justify-between gap-4">
        <View className="flex-1">
          <Text className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-0.5">
            Limited Offer
          </Text>
          <Text className="text-white text-base font-extrabold leading-tight mb-1">
            Permanent Membership
          </Text>
          <Text className="text-white/70 text-xs">Join all premium groups for life.</Text>
        </View>
        <View className="items-end gap-2">
          <Text className="text-white text-xl font-extrabold">₦5,000</Text>
          <TouchableOpacity activeOpacity={0.88} className="bg-white rounded-xl px-4 py-1.5">
            <Text className="text-brand-blue text-xs font-extrabold uppercase tracking-wider">Upgrade</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Group Row ────────────────────────────────────────────────────────────────
function GroupRow({ group, onPress }: { group: CommunityGroup; onPress?: () => void }) {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      className="flex-row items-center px-4 py-3.5 border-b border-gray-50 dark:border-gray-800"
    >
      {/* Icon */}
      <View
        className="w-12 h-12 rounded-2xl items-center justify-center mr-3 relative"
        style={{ backgroundColor: group.iconBg }}
      >
        <MaterialCommunityIcons name={group.iconName as any} size={24} color={group.iconColor} />
        {group.online && (
          <View className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-white dark:border-gray-900" />
        )}
      </View>

      {/* Info */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between mb-0.5">
          <Text className="text-sm font-bold text-gray-900 dark:text-white">{group.name}</Text>
          <Text className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{group.time}</Text>
        </View>
        <Text className="text-xs text-gray-500 dark:text-gray-400" numberOfLines={1}>
          <Text style={{ color: group.iconColor, fontWeight: "700" }}>{group.lastSender}: </Text>
          {group.lastMessage}
        </Text>
      </View>

      {/* Unread badge */}
      {group.unread ? (
        <View className="ml-2 w-5 h-5 rounded-full bg-brand-blue items-center justify-center">
          <Text className="text-white text-[10px] font-bold">{group.unread}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

// ─── Leaderboard Tab ──────────────────────────────────────────────────────────
function LeaderboardTab() {
  const router = useRouter();
  const top3 = LEADERBOARD.slice(0, 3);
  const rest = LEADERBOARD.slice(3);
  const [period, setPeriod] = useState<"week" | "month" | "all">("week");

  const periodLabels: { key: "week" | "month" | "all"; label: string }[] = [
    { key: "week", label: "This Week" },
    { key: "month", label: "This Month" },
    { key: "all", label: "All Time" },
  ];

  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      {/* Section header */}
      <View className="flex-row items-center justify-between px-4 mt-5 mb-4">
        <Text className="text-xl font-extrabold text-gray-900 dark:text-white">Student Ranking</Text>
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-full p-0.5">
          {periodLabels.map(p => (
            <TouchableOpacity
              key={p.key}
              onPress={() => setPeriod(p.key)}
              className="px-3 py-1 rounded-full"
              style={{ backgroundColor: period === p.key ? "#2452FF" : "transparent" }}
            >
              <Text style={{ fontSize: 10, fontWeight: "700", color: period === p.key ? "#fff" : "#9CA3AF" }}>
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Podium */}
      <View
        className="mx-4 rounded-3xl py-5 px-4 mb-5 bg-white dark:bg-gray-800"
        style={{
          shadowColor: "#000", shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.08, shadowRadius: 12, elevation: 4,
        }}
      >
        <View className="flex-row justify-center items-end">
          {/* 2nd */}
          <View className="flex-1"><PodiumItem entry={top3[1]} /></View>
          {/* 1st */}
          <View className="flex-1"><PodiumItem entry={top3[0]} isCenter /></View>
          {/* 3rd */}
          <View className="flex-1"><PodiumItem entry={top3[2]} /></View>
        </View>
      </View>

      {/* Rank 4+ */}
      {rest.map(entry => <RankRow key={entry.id} entry={entry} />)}

      {/* Upgrade Banner */}
      <UpgradeBanner />

      {/* Community Groups preview */}
      <View className="px-4 mb-2">
        <Text className="text-xl font-extrabold text-gray-900 dark:text-white mb-3">Community Groups</Text>
        <View
          className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
          style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}
        >
          {GROUPS.map(g => (
            <GroupRow
              key={g.id}
              group={g}
              onPress={() => router.push({ pathname: "/(main)/chat", params: { groupId: g.id, groupName: g.name } })}
            />
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

// ─── Groups Tab ───────────────────────────────────────────────────────────────
function GroupsTab() {
  const router = useRouter();
  return (
    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
      <View className="flex-row items-center justify-between px-4 mt-5 mb-3">
        <Text className="text-xl font-extrabold text-gray-900 dark:text-white">Community Groups</Text>
        <TouchableOpacity className="bg-brand-blue-light dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
          <Text className="text-brand-blue text-xs font-bold">+ Join Group</Text>
        </TouchableOpacity>
      </View>
      <View className="bg-white dark:bg-gray-800 rounded-2xl mx-4 overflow-hidden"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        {GROUPS.map(g => (
          <GroupRow
            key={g.id}
            group={g}
            onPress={() => router.push({ pathname: "/(main)/chat", params: { groupId: g.id, groupName: g.name } })}
          />
        ))}
      </View>
      <UpgradeBanner />
    </ScrollView>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CommunityLeaderBoardScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const [activeTab, setActiveTab] = useState<"leaderboard" | "groups">("leaderboard");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const tabs: { key: "leaderboard" | "groups"; label: string }[] = [
    { key: "leaderboard", label: "Leaderboard" },
    { key: "groups",      label: "Groups"      },
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* ── Header ── */}
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
            Community &amp; Leaderboard
          </Text>

          <TouchableOpacity
            onPress={() => setSearchVisible(v => !v)}
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
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={activeTab === "leaderboard" ? "Search students..." : "Search groups..."}
              placeholderTextColor="#9CA3AF"
              autoFocus
              className="flex-1 text-sm text-gray-900 dark:text-white p-0"
            />
          </View>
        )}

        {/* Tab bar */}
        <View className="flex-row border-b border-gray-100 dark:border-gray-800">
          {tabs.map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setActiveTab(tab.key)}
                className="flex-1 items-center pb-3 pt-1"
              >
                <Text
                  className={`text-sm font-bold ${isActive ? "text-brand-blue" : "text-gray-400 dark:text-gray-500"}`}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View className="absolute bottom-0 left-8 right-8 h-[3px] bg-brand-blue rounded-full" />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* ── Tab Content ── */}
      {activeTab === "leaderboard" ? <LeaderboardTab /> : <GroupsTab />}
    </View>
  );
}
