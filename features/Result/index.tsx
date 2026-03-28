/**
 * features/Result/index.tsx
 *
 * List view: fetches GET /api/results/my → shows result cards
 * Detail view: tap a card → modal slides up with full question breakdown
 *              fetched from GET /api/results/my/:resultId/questions
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  ResultRecord,
  TestResultRecord,
  fetchMyResults,
  fetchResultQuestions,
} from "../../lib/resultService";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(secs: number): string {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function gradeLabel(pct: number): { label: string; color: string; bg: string } {
  if (pct >= 75) return { label: "Excellent", color: "#059669", bg: "#D1FAE5" };
  if (pct >= 50) return { label: "Pass",      color: "#2452FF", bg: "#EEF1FF" };
  if (pct >= 30) return { label: "Average",   color: "#D97706", bg: "#FEF3C7" };
  return           { label: "Fail",          color: "#DC2626", bg: "#FEE2E2" };
}

// ─── Empty / Error State ──────────────────────────────────────────────────────
function EmptyState({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
        <Ionicons
          name={error ? "cloud-offline-outline" : "bar-chart-outline"}
          size={36} color="#9CA3AF"
        />
      </View>
      <Text className="text-gray-900 dark:text-white font-bold text-lg text-center mb-2">
        {error ? "Failed to load results" : "No results yet"}
      </Text>
      <Text className="text-gray-400 dark:text-gray-500 text-sm text-center leading-5 mb-5">
        {error ?? "Complete an exam to see your results here."}
      </Text>
      {error && (
        <TouchableOpacity
          onPress={onRetry}
          className="bg-brand-blue px-8 py-3 rounded-2xl"
          activeOpacity={0.85}
        >
          <Text className="text-white font-bold text-sm">Retry</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Result Card ──────────────────────────────────────────────────────────────
function ResultCard({
  item,
  onPress,
}: {
  item: ResultRecord;
  onPress: (item: ResultRecord) => void;
}) {
  const { label, color, bg } = gradeLabel(item.percentage);
  const passed = item.percentage >= 50;

  return (
    <TouchableOpacity
      activeOpacity={0.82}
      onPress={() => onPress(item)}
      className="mx-4 mb-3 bg-white dark:bg-gray-800 rounded-2xl p-4"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 3,
        borderWidth: 1,
        borderColor: passed ? "#DCFCE7" : "#FEE2E2",
      }}
    >
      {/* Top row */}
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1 mr-3">
          <Text
            className="text-gray-900 dark:text-white font-bold text-base leading-tight"
            numberOfLines={2}
          >
            {item.examName}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xs mt-1">
            {formatDate(item.submittedAt)}
          </Text>
        </View>
        {/* Grade badge */}
        <View
          className="px-3 py-1 rounded-full items-center"
          style={{ backgroundColor: bg }}
        >
          <Text className="text-xs font-extrabold" style={{ color }}>
            {label}
          </Text>
        </View>
      </View>

      {/* Stats row */}
      <View className="flex-row gap-0">
        {/* Score */}
        <View className="flex-1 items-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mr-2">
          <Text className="text-xl font-extrabold" style={{ color }}>
            {item.percentage}%
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-wide mt-0.5">
            Score
          </Text>
        </View>
        {/* Correct */}
        <View className="flex-1 items-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl mr-2">
          <Text className="text-xl font-extrabold text-gray-900 dark:text-white">
            {item.totalScore}/{item.totalQuestions}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-wide mt-0.5">
            Correct
          </Text>
        </View>
        {/* Duration */}
        <View className="flex-1 items-center py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <Text className="text-xl font-extrabold text-gray-900 dark:text-white">
            {formatDuration(item.duration)}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-wide mt-0.5">
            Duration
          </Text>
        </View>
      </View>

      {/* Chevron hint */}
      <View className="flex-row items-center justify-end mt-2 gap-1">
        <Text className="text-brand-blue text-xs font-semibold">View Details</Text>
        <Ionicons name="chevron-forward" size={13} color="#2452FF" />
      </View>
    </TouchableOpacity>
  );
}

// ─── Detail Modal ─────────────────────────────────────────────────────────────
function DetailModal({
  result,
  visible,
  onClose,
}: {
  result: ResultRecord | null;
  visible: boolean;
  onClose: () => void;
}) {
  const [questions, setQuestions] = useState<TestResultRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch first page when modal opens
  useEffect(() => {
    if (!visible || !result) return;
    setQuestions([]);
    setPage(1);
    setError(null);
    loadPage(1, result._id, true);
  }, [visible, result]);

  const loadPage = async (
    pageNum: number,
    resultId: string,
    reset = false
  ) => {
    if (reset) setLoading(true); else setLoadingMore(true);
    try {
      const res = await fetchResultQuestions(resultId, pageNum, 20);
      setTotalPages(res.data.totalPages);
      setQuestions((prev) => reset ? res.data.questions : [...prev, ...res.data.questions]);
      setPage(pageNum);
    } catch {
      setError("Failed to load question details.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!result || loadingMore || page >= totalPages) return;
    loadPage(page + 1, result._id);
  };

  if (!result) return null;

  const { label, color, bg } = gradeLabel(result.percentage);
  const passed = result.percentage >= 50;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-gray-50 dark:bg-gray-900">
        {/* ── Modal Header ── */}
        <View className="bg-white dark:bg-gray-900 px-5 pt-5 pb-3 border-b border-gray-100 dark:border-gray-800">
          <View className="flex-row items-center justify-between mb-1">
            <Text
              className="flex-1 text-gray-900 dark:text-white font-bold text-lg mr-3"
              numberOfLines={1}
            >
              {result.examName}
            </Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
              activeOpacity={0.8}
            >
              <Ionicons name="close" size={20} color="#6B7280" />
            </TouchableOpacity>
          </View>
          <Text className="text-gray-400 dark:text-gray-500 text-xs">
            {formatDate(result.submittedAt)}
          </Text>
        </View>

        {/* ── Score Hero ── */}
        <View
          className="mx-4 mt-4 rounded-2xl px-5 py-5 overflow-hidden"
          style={{
            backgroundColor: passed ? "#2452FF" : "#EF4444",
            shadowColor: passed ? "#2452FF" : "#EF4444",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.3,
            shadowRadius: 14,
            elevation: 8,
          }}
        >
          <View
            style={{
              position: "absolute", top: -30, right: -30,
              width: 100, height: 100, borderRadius: 50,
              backgroundColor: "rgba(255,255,255,0.08)",
            }}
          />
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-1">
                Final Score
              </Text>
              <Text className="text-white text-4xl font-extrabold">
                {result.percentage}%
              </Text>
              <View className="flex-row items-center gap-1.5 mt-1">
                <View
                  className="px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
                >
                  <Text className="text-white text-[10px] font-bold uppercase">
                    {label}
                  </Text>
                </View>
              </View>
            </View>
            <View className="items-end gap-2">
              <View className="items-end">
                <Text className="text-white text-xl font-extrabold">
                  {result.totalScore}/{result.totalQuestions}
                </Text>
                <Text className="text-white/70 text-[10px] uppercase tracking-wide">
                  Correct
                </Text>
              </View>
              <View className="items-end">
                <Text className="text-white text-xl font-extrabold">
                  {formatDuration(result.duration)}
                </Text>
                <Text className="text-white/70 text-[10px] uppercase tracking-wide">
                  Duration
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Question Breakdown ── */}
        <Text className="px-4 mt-5 mb-3 text-gray-900 dark:text-white text-base font-bold">
          Question Breakdown
        </Text>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2452FF" />
            <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">
              Loading questions…
            </Text>
          </View>
        ) : error ? (
          <View className="flex-1 items-center justify-center px-8">
            <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
            <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-3">
              {error}
            </Text>
          </View>
        ) : (
          <FlatList
            data={questions}
            keyExtractor={(q) => q._id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
            ListFooterComponent={
              loadingMore ? (
                <View className="py-4 items-center">
                  <ActivityIndicator size="small" color="#2452FF" />
                </View>
              ) : null
            }
            renderItem={({ item: q, index }) => {
              const isCorrect = q.scorePoint === 1;
              return (
                <View
                  key={q._id}
                  className="mb-4 bg-white dark:bg-gray-800 rounded-2xl p-4"
                  style={{
                    borderWidth: 1,
                    borderColor: isCorrect ? "#D1FAE5" : "#FEE2E2",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 6,
                    elevation: 2,
                  }}
                >
                  {/* ── Q header ── */}
                  <View className="flex-row items-start gap-3 mb-4">
                    <View
                      className="w-8 h-8 rounded-full items-center justify-center mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: isCorrect ? "#D1FAE5" : "#FEE2E2" }}
                    >
                      <Ionicons
                        name={isCorrect ? "checkmark" : "close"}
                        size={15}
                        color={isCorrect ? "#059669" : "#DC2626"}
                      />
                    </View>
                    <View className="flex-1">
                      <Text
                        className="text-[10px] font-bold uppercase tracking-widest mb-1"
                        style={{ color: isCorrect ? "#059669" : "#DC2626" }}
                      >
                        Q{index + 1} · {isCorrect ? "Correct" : q.answered ? "Wrong" : "Skipped"}
                      </Text>
                      <Text className="text-sm font-semibold text-gray-800 dark:text-gray-200 leading-5">
                        {q.questionText}
                      </Text>
                    </View>
                  </View>

                  {/* ── All 4 options ── */}
                  <View className="gap-2 mb-3">
                    {(["A", "B", "C", "D"] as const).map((key) => {
                      const optionText = q.options?.[key];
                      if (!optionText) return null;

                      const isChosen = q.answered === key;
                      const isAnswer = q.correctAnswer === key;

                      let bg = "#F9FAFB";
                      let borderColor = "#E5E7EB";
                      let keyBg = "#EEF1FF";
                      let keyColor = "#2452FF";
                      let textColor = "#374151";
                      let icon: "checkmark-circle" | "close-circle" | null = null;
                      let iconColor = "#9CA3AF";

                      if (isAnswer) {
                        bg = "#F0FDF4";
                        borderColor = "#10B981";
                        keyBg = "#10B981";
                        keyColor = "#fff";
                        textColor = "#065F46";
                        icon = "checkmark-circle";
                        iconColor = "#10B981";
                      } else if (isChosen) {
                        bg = "#FEF2F2";
                        borderColor = "#EF4444";
                        keyBg = "#EF4444";
                        keyColor = "#fff";
                        textColor = "#991B1B";
                        icon = "close-circle";
                        iconColor = "#EF4444";
                      }

                      return (
                        <View
                          key={key}
                          className="flex-row items-center rounded-xl px-3 py-2.5 gap-3"
                          style={{ backgroundColor: bg, borderWidth: 1.5, borderColor }}
                        >
                          <View
                            className="w-7 h-7 rounded-lg items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: keyBg }}
                          >
                            <Text className="text-xs font-extrabold" style={{ color: keyColor }}>
                              {key}
                            </Text>
                          </View>
                          <Text className="flex-1 text-sm font-medium leading-5" style={{ color: textColor }}>
                            {optionText}
                          </Text>
                          {icon && <Ionicons name={icon} size={18} color={iconColor} />}
                        </View>
                      );
                    })}
                  </View>

                  {/* ── Meta row ── */}
                  <View className="flex-row gap-2 flex-wrap pt-2 border-t border-gray-100 dark:border-gray-700">
                    <View className="flex-row items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl">
                      <MaterialCommunityIcons name="star" size={12} color={isCorrect ? "#D97706" : "#9CA3AF"} />
                      <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {q.scorePoint} / 1 pt
                      </Text>
                    </View>
                    <View className="flex-row items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-xl">
                      <Ionicons name="timer-outline" size={12} color="#9CA3AF" />
                      <Text className="text-xs font-bold text-gray-600 dark:text-gray-300">
                        {formatDuration(q.duration)}
                      </Text>
                    </View>
                    {!q.answered && (
                      <View className="flex-row items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 px-3 py-1.5 rounded-xl">
                        <Ionicons name="alert-circle-outline" size={12} color="#D97706" />
                        <Text className="text-xs font-bold text-amber-600 dark:text-amber-400">Skipped</Text>
                      </View>
                    )}
                  </View>
                </View>
              );
            }}
          />
        )}
      </View>
    </Modal>
  );
}

// ─── Result Screen (List) ─────────────────────────────────────────────────────
export default function ResultScreen() {
  const [results, setResults] = useState<ResultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<ResultRecord | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const loadResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMyResults();
      setResults(res.data.results);
    } catch (err: unknown) {
      const msg =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : "Failed to load results.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadResults(); }, [loadResults]);

  const openDetail = (item: ResultRecord) => {
    setSelectedResult(item);
    setDetailVisible(true);
  };

  const closeDetail = () => {
    setDetailVisible(false);
    setSelectedResult(null);
  };

  // ── Stats summary bar ────────────────────────────────────────────────────────
  const totalAttempts = results.length;
  const avgPct =
    totalAttempts > 0
      ? Math.round(results.reduce((s, r) => s + r.percentage, 0) / totalAttempts)
      : 0;
  const best =
    totalAttempts > 0 ? Math.max(...results.map((r) => r.percentage)) : 0;

  const ListHeader = (
    <>
      {/* ── Page title */}
      <View className="px-4 pt-4 pb-2">
        <Text className="text-gray-900 dark:text-white text-2xl font-extrabold">
          My Results
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-0.5">
          Tap any card to see the full question breakdown.
        </Text>
      </View>

      {/* ── Summary stat cards (only when we have data) */}
      {totalAttempts > 0 && (
        <View className="flex-row mx-4 mt-3 mb-1 gap-3">
          {[
            { label: "Attempts", value: String(totalAttempts), icon: "document-text-outline" as const },
            { label: "Avg Score", value: `${avgPct}%`, icon: "trending-up-outline" as const },
            { label: "Best",      value: `${best}%`,   icon: "trophy-outline" as const },
          ].map((s) => (
            <View
              key={s.label}
              className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-3 items-center"
              style={{
                shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
              }}
            >
              <Ionicons name={s.icon} size={18} color="#2452FF" />
              <Text className="text-gray-900 dark:text-white font-extrabold text-base mt-1">
                {s.value}
              </Text>
              <Text className="text-gray-400 dark:text-gray-500 text-[10px] font-semibold uppercase tracking-wide">
                {s.label}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row items-center justify-between px-4 mt-4 mb-2">
        <Text className="text-gray-900 dark:text-white font-bold text-base">
          History
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-xs font-semibold">
          {totalAttempts} attempt{totalAttempts !== 1 ? "s" : ""}
        </Text>
      </View>
    </>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2452FF" />
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">
          Loading results…
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        renderItem={({ item }) => (
          <ResultCard item={item} onPress={openDetail} />
        )}
        ListEmptyComponent={
          <EmptyState error={error} onRetry={loadResults} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
        removeClippedSubviews
        initialNumToRender={8}
      />

      {/* ── Detail Modal ── */}
      <DetailModal
        result={selectedResult}
        visible={detailVisible}
        onClose={closeDetail}
      />
    </View>
  );
}
