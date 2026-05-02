import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Exam, fetchExams } from "../../lib/examService";

// ─── Level badge colours ──────────────────────────────────────────────────────
const LEVEL_PALETTE: Record<string, { bg: string; text: string }> = {
  BECE: { bg: "#DCFCE7", text: "#16A34A" },
  JAMB: { bg: "#FFF7ED", text: "#EA580C" },
  WAEC: { bg: "#EFF6FF", text: "#2452FF" },
  NECO: { bg: "#FAF5FF", text: "#7C3AED" },
  DEFAULT: { bg: "#F3F4F6", text: "#6B7280" },
};

// ─── VIP Banner ───────────────────────────────────────────────────────────────
function VIPBanner() {
  return (
    <View
      className="mx-4 mt-4 rounded-2xl px-5 py-5 overflow-hidden"
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

      <View className="self-start bg-white/20 px-3 py-1 rounded-full mb-3">
        <Text className="text-white text-xs font-bold tracking-widest uppercase">
          Premium Access
        </Text>
      </View>
      <Text className="text-white text-2xl font-bold mb-1">Upgrade to VIP</Text>
      <Text className="text-white/80 text-sm leading-5 mb-4">
        Unlock all subjects, detailed solutions, and unlimited mock exams.
      </Text>
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

// ─── Exam Card (square, 2-per-row) ──────────────────────────────────────────
function ExamCard({ exam, index }: { exam: Exam; index: number }) {
  const router = useRouter();

  const ACCENTS = [
    "#2452FF",
    "#16A34A",
    "#EA580C",
    "#7C3AED",
    "#E11D48",
    "#0D9488",
  ];
  // Premium cards use a muted grey accent
  const accent = exam.isPremium ? "#94A3B8" : ACCENTS[index % ACCENTS.length];

  const handlePress = () => {
    if (exam.isPremium) {
      Alert.alert(
        "Premium Content 🔒",
        "Upgrade to Premium to unlock this exam and access all features.",
        [{ text: "OK", style: "cancel" }]
      );
      return;
    }
    router.push({
      pathname: "/(main)/term",
      params: { examId: exam._id, examName: exam.name },
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={exam.isPremium ? 0.6 : 0.85}
      onPress={handlePress}
      className="flex-1 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden"
      style={{
        shadowColor: accent,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: "#F1F5F9",
        aspectRatio: 1,
        opacity: exam.isPremium ? 0.65 : 1,
      }}
    >
      {/* Top colour block */}
      <View
        className="w-full items-center justify-center"
        style={{ backgroundColor: accent, flex: 1.2, padding: 12 }}
      >
        {/* Decorative circle */}
        <View
          style={{
            position: "absolute",
            top: -20,
            right: -20,
            width: 70,
            height: 70,
            borderRadius: 35,
            backgroundColor: "rgba(255,255,255,0.12)",
          }}
        />
        {/* Show lock for premium, book for free */}
        {exam.isPremium ? (
          <Ionicons name="lock-closed" size={28} color="rgba(255,255,255,0.9)" />
        ) : (
          <MaterialCommunityIcons
            name="book-open-outline"
            size={32}
            color="rgba(255,255,255,0.9)"
          />
        )}
      </View>

      {/* Bottom info */}
      <View className="px-3 py-2" style={{ flex: 1 }}>
        <Text
          className="text-gray-900 dark:text-white font-bold"
          style={{ fontSize: 13, lineHeight: 17, marginBottom: 6 }}
          numberOfLines={2}
        >
          {exam.name}
        </Text>
        <View className="flex-row items-center gap-1.5 flex-wrap">
          {exam.isPremium ? (
            <View className="bg-slate-100 px-2 py-0.5 rounded-full flex-row items-center gap-0.5">
              <Ionicons name="lock-closed" size={9} color="#64748B" />
              <Text style={{ color: "#64748B", fontSize: 10, fontWeight: "700" }}>
                Premium
              </Text>
            </View>
          ) : (
            <View className="bg-green-50 px-2 py-0.5 rounded-full flex-row items-center gap-0.5">
              <Ionicons name="checkmark-circle" size={9} color="#16A34A" />
              <Text style={{ color: "#16A34A", fontSize: 10, fontWeight: "700" }}>
                Free
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ─── Exam List Section ────────────────────────────────────────────────────────
function ExamListSection() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchExams();
      setExams(res.data.exams);
    } catch {
      setError("Failed to load exams.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <>
      <SectionHeader
        title="All Exams"
        action="See All"
        onAction={() => router.push("/(main)/exam")}
      />

      {loading ? (
        <View className="items-center py-8">
          <ActivityIndicator size="small" color="#2452FF" />
          <Text className="text-gray-400 dark:text-gray-500 text-xs mt-2">
            Loading exams…
          </Text>
        </View>
      ) : error ? (
        <View className="mx-4 bg-red-50 dark:bg-red-900/20 rounded-2xl p-4 flex-row items-center gap-3">
          <Ionicons name="cloud-offline-outline" size={20} color="#EF4444" />
          <View className="flex-1">
            <Text className="text-red-600 font-semibold text-sm">{error}</Text>
          </View>
          <TouchableOpacity activeOpacity={0.8} onPress={load}>
            <Text className="text-brand-blue font-bold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Chunk exams into pairs for 2-column grid
        exams
          .reduce((rows: Exam[][], exam, i) => {
            if (i % 2 === 0) rows.push([exam]);
            else rows[rows.length - 1].push(exam);
            return rows;
          }, [])
          .map((pair, rowIdx) => (
            <View key={rowIdx} className="flex-row px-4 gap-3 mb-3">
              {pair.map((exam, i) => (
                <ExamCard key={exam._id} exam={exam} index={rowIdx * 2 + i} />
              ))}
              {/* Fill empty slot if odd number of exams */}
              {pair.length === 1 && <View className="flex-1" />}
            </View>
          ))
      )}
    </>
  );
}

// ─── Scrabble Card ────────────────────────────────────────────────────────────
function ScrabbleCard() {
  const router = useRouter();
  return (
    <View className="mx-4 mt-5">
      <View
        className="rounded-3xl overflow-hidden"
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
            width: 130,
            height: 130,
            borderRadius: 65,
            backgroundColor: "rgba(255,255,255,0.07)",
          }}
        />
        <View
          style={{
            position: "absolute",
            bottom: -20,
            left: 60,
            width: 90,
            height: 90,
            borderRadius: 45,
            backgroundColor: "rgba(255,255,255,0.05)",
          }}
        />

        <View className="flex-row items-center px-5 pt-5 pb-4 gap-4">
          <View className="items-center justify-center">
            <View className="flex-row gap-1 mb-1">
              {["V", "I", "P"].map((l) => (
                <View
                  key={l}
                  className="w-8 h-8 rounded-lg items-center justify-center"
                  style={{ backgroundColor: "#F5E88A" }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: "#1A1A1A",
                    }}
                  >
                    {l}
                  </Text>
                </View>
              ))}
            </View>
            <View className="flex-row gap-1">
              {["S", "L", "O"].map((l) => (
                <View
                  key={l}
                  className="w-8 h-8 rounded-lg items-center justify-center"
                  style={{ backgroundColor: "#F5E88A" }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: "#1A1A1A",
                    }}
                  >
                    {l}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center gap-2 mb-1">
              <View className="bg-white/20 px-2 py-0.5 rounded-full">
                <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
                  VIP Game
                </Text>
              </View>
            </View>
            <Text className="text-white text-xl font-extrabold leading-tight mb-1">
              Play Scrabble
            </Text>
            <Text className="text-white/75 text-xs leading-4">
              Challenge the AI, build words &amp; earn coins!
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push("/(main)/scrabble")}
          className="mx-5 mb-5 bg-white rounded-2xl py-3.5 flex-row items-center justify-center gap-2"
        >
          <MaterialCommunityIcons
            name="cards-playing-outline"
            size={18}
            color="#2452FF"
          />
          <Text style={{ color: "#2452FF", fontWeight: "800", fontSize: 15 }}>
            Play Now
          </Text>
          <Ionicons name="arrow-forward" size={15} color="#2452FF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        className="flex-1 bg-gray-50 dark:bg-gray-900"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* VIP Upgrade Banner */}
        <VIPBanner />

        {/* All Exams — fetched from API, tapping goes to term selection */}
        <ExamListSection />

        {/* Play Scrabble */}
        <ScrabbleCard />
      </ScrollView>
    </View>
  );
}
