/**
 * features/Test/index.tsx
 *
 * Loads questions from GET /api/tests?exam=<examId>
 * Submits result to POST /api/results/submit on completion.
 * Keeps all existing UI (timer, coins, option colours, results review).
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  ScrollView,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  Question,
  fetchQuestionsByExam,
} from "../../lib/testService";
import {
  submitExamResult,
} from "../../lib/resultService";

// ─── Constants ────────────────────────────────────────────────────────────────
const QUESTION_TIME = 60; // seconds per question
const COINS_PER_CORRECT = 30;
const OPTION_KEYS = ["A", "B", "C", "D"] as const;

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function ProgressBar({
  current, total, progress,
}: {
  current: number; total: number; progress: Animated.Value;
}) {
  const width = progress.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
    extrapolate: "clamp",
  });
  return (
    <View className="px-5 pb-3 pt-1">
      <View className="flex-row items-center justify-between mb-1.5">
        <View>
          <Text className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            Topic Confidence
          </Text>
          <Text className="text-sm font-bold text-gray-900 dark:text-white">
            Question {current} of {total}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5 bg-brand-blue-light dark:bg-blue-900/30 px-3 py-1.5 rounded-full">
          <MaterialCommunityIcons name="robot" size={13} color="#2452FF" />
          <Text className="text-brand-blue text-[11px] font-bold">AI Powered</Text>
        </View>
      </View>
      <View className="h-[6px] bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <Animated.View style={{ width }} className="h-full bg-brand-blue rounded-full" />
      </View>
    </View>
  );
}

// ─── Timer + Coins ────────────────────────────────────────────────────────────
function StatCards({ timeLeft, coins, isDark }: { timeLeft: number; coins: number; isDark: boolean }) {
  const mins = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const secs = String(timeLeft % 60).padStart(2, "0");
  const isUrgent = timeLeft <= 10;
  return (
    <View className="flex-row mx-5 gap-3 mb-4">
      <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 flex-row items-center gap-3" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        <View className="w-10 h-10 rounded-xl items-center justify-center" style={{ backgroundColor: isUrgent ? "#FEE2E2" : "#FFF0F0" }}>
          <Ionicons name="timer-outline" size={22} color={isUrgent ? "#DC2626" : "#EF4444"} />
        </View>
        <View>
          <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Time Left</Text>
          <Text className="text-xl font-extrabold" style={{ color: isUrgent ? "#DC2626" : (isDark ? "#F9FAFB" : "#111827") }}>
            {mins}:{secs}
          </Text>
        </View>
      </View>
      <View className="flex-1 bg-white dark:bg-gray-800 rounded-2xl px-4 py-3 flex-row items-center gap-3" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 }}>
        <View className="w-10 h-10 rounded-xl bg-yellow-50 items-center justify-center">
          <MaterialCommunityIcons name="cash-multiple" size={22} color="#D97706" />
        </View>
        <View>
          <Text className="text-[10px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide">Coins Earned</Text>
          <Text className="text-xl font-extrabold text-gray-900 dark:text-white">{coins}</Text>
        </View>
      </View>
    </View>
  );
}

// ─── Option Row ───────────────────────────────────────────────────────────────
function OptionRow({
  optKey, text, state, onPress,
}: {
  optKey: "A" | "B" | "C" | "D";
  text: string;
  state: "idle" | "selected" | "correct" | "wrong";
  onPress: () => void;
}) {
  const bgMap = { idle: "bg-white dark:bg-gray-800", selected: "bg-white dark:bg-gray-800", correct: "bg-emerald-50 dark:bg-emerald-900/20", wrong: "bg-red-50 dark:bg-red-900/20" };
  const borderColorMap = { idle: "#E5E7EB", selected: "#2452FF", correct: "#10B981", wrong: "#EF4444" };
  const keyBgMap = { idle: "#EEF1FF", selected: "#2452FF", correct: "#10B981", wrong: "#EF4444" };
  const keyTextMap = { idle: "#2452FF", selected: "#fff", correct: "#fff", wrong: "#fff" };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={state === "correct" || state === "wrong"}
      className={`flex-row items-center mx-5 mb-3 rounded-2xl px-4 py-[14px] ${bgMap[state]}`}
      style={{ borderWidth: 1.5, borderColor: borderColorMap[state], shadowColor: state === "selected" ? "#2452FF" : "#000", shadowOffset: { width: 0, height: state === "selected" ? 4 : 1 }, shadowOpacity: state === "selected" ? 0.15 : 0.04, shadowRadius: state === "selected" ? 12 : 4, elevation: state === "selected" ? 4 : 1 }}
    >
      <View className="w-8 h-8 rounded-xl items-center justify-center mr-4" style={{ backgroundColor: keyBgMap[state] }}>
        <Text className="text-sm font-extrabold" style={{ color: keyTextMap[state] }}>{optKey}</Text>
      </View>
      <Text className={`flex-1 text-[15px] font-semibold ${state === "idle" ? "text-gray-700 dark:text-gray-200" : state === "selected" ? "text-gray-900 dark:text-white" : state === "correct" ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}>
        {text}
      </Text>
      {state === "selected" && <Ionicons name="checkmark-circle" size={22} color="#2452FF" />}
      {state === "correct" && <Ionicons name="checkmark-circle" size={22} color="#10B981" />}
      {state === "wrong" && <Ionicons name="close-circle" size={22} color="#EF4444" />}
    </TouchableOpacity>
  );
}

// ─── Results Screen ───────────────────────────────────────────────────────────
function ResultsScreen({
  examName, score, total, coins, answers: answerMap, questions, percentage, submitting, onRetry, onExit,
}: {
  examName: string; score: number; total: number; coins: number;
  answers: Record<string, "A" | "B" | "C" | "D" | null>;
  questions: Question[]; percentage: number; submitting: boolean;
  onRetry: () => void; onExit: () => void;
}) {
  const passed = percentage >= 50;
  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Hero */}
      <View className="mx-5 mt-5 rounded-3xl px-6 py-8 items-center overflow-hidden" style={{ backgroundColor: passed ? "#2452FF" : "#EF4444", shadowColor: passed ? "#2452FF" : "#EF4444", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 20, elevation: 12 }}>
        <View style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, borderRadius: 70, backgroundColor: "rgba(255,255,255,0.08)" }} />
        <Ionicons name={passed ? "trophy" : "sad-outline"} size={52} color="white" />
        {submitting ? (
          <ActivityIndicator color="white" size="small" style={{ marginTop: 12 }} />
        ) : (
          <Text className="text-white text-4xl font-extrabold mt-3">{percentage}%</Text>
        )}
        <Text className="text-white/80 text-base mt-1">{passed ? "Great Work! 🎉" : "Keep Practising 💪"}</Text>
        <View className="flex-row mt-5 gap-6">
          <View className="items-center">
            <Text className="text-white text-xl font-extrabold">{score}/{total}</Text>
            <Text className="text-white/70 text-xs mt-0.5">Score</Text>
          </View>
          <View className="w-[1px] bg-white/20" />
          <View className="items-center">
            <Text className="text-white text-xl font-extrabold">{coins}</Text>
            <Text className="text-white/70 text-xs mt-0.5">Coins</Text>
          </View>
          <View className="w-[1px] bg-white/20" />
          <View className="items-center">
            <Text className="text-white text-xl font-extrabold" numberOfLines={1}>{examName}</Text>
            <Text className="text-white/70 text-xs mt-0.5">Exam</Text>
          </View>
        </View>
      </View>

      {/* Answer review */}
      <Text className="px-5 mt-6 mb-3 text-base font-bold text-gray-900 dark:text-white">Answer Review</Text>
      {questions.map((q, i) => {
        const chosen = answerMap[q._id];
        const isCorrect = chosen === q.answer;
        return (
          <View key={q._id} className="mx-5 mb-3 bg-white dark:bg-gray-800 rounded-2xl p-4" style={{ borderWidth: 1, borderColor: isCorrect ? "#D1FAE5" : "#FEE2E2", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 }}>
            <View className="flex-row items-start gap-3">
              <View className="w-7 h-7 rounded-full items-center justify-center mt-0.5" style={{ backgroundColor: isCorrect ? "#D1FAE5" : "#FEE2E2" }}>
                <Ionicons name={isCorrect ? "checkmark" : "close"} size={14} color={isCorrect ? "#059669" : "#DC2626"} />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-5">Q{i + 1}. {q.question}</Text>
                <Text className="text-xs mt-1 font-medium" style={{ color: isCorrect ? "#059669" : "#DC2626" }}>
                  Your answer: {chosen ? `${chosen}. ${q.options[chosen]}` : "Not answered"}
                </Text>
                {!isCorrect && (
                  <Text className="text-xs mt-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                    Correct: {q.answer}. {q.options[q.answer]}
                  </Text>
                )}
                {q.explanation ? (
                  <Text className="text-xs mt-2 text-gray-400 dark:text-gray-500 leading-4 italic">💡 {q.explanation}</Text>
                ) : null}
              </View>
            </View>
          </View>
        );
      })}

      {/* Actions */}
      <View className="mx-5 mt-2 gap-3">
        <TouchableOpacity activeOpacity={0.88} onPress={onRetry} className="bg-brand-blue rounded-2xl py-4 items-center">
          <Text className="text-white font-bold text-base">Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity activeOpacity={0.8} onPress={onExit} className="bg-gray-100 dark:bg-gray-800 rounded-2xl py-4 items-center">
          <Text className="text-gray-700 dark:text-gray-300 font-bold text-base">Back to Exams</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ─── Test Screen ──────────────────────────────────────────────────────────────
export default function TestScreen() {
  const router = useRouter();
  const { examId, examName } = useLocalSearchParams<{ examId: string; examName: string }>();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // ── Loading state ────────────────────────────────────────────────────────────
  const [questions, setQuestions] = useState<Question[]>([]);
  const [fetching, setFetching] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // ── Quiz state ───────────────────────────────────────────────────────────────
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedKey, setSelectedKey] = useState<"A" | "B" | "C" | "D" | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState<Record<string, "A" | "B" | "C" | "D" | null>>({});
  const [coins, setCoins] = useState(0);
  const [timeLeft, setTimeLeft] = useState(QUESTION_TIME);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // ── Submit state ─────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [serverPercentage, setServerPercentage] = useState<number | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const elapsedRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionStartRef = useRef<number>(Date.now()); // tracks per-question start time
  const questionDurationsRef = useRef<Record<string, number>>({}); // questionId → seconds
  const progressAnim = useRef(new Animated.Value(0)).current;

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // ── Fetch questions on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!examId) { setFetchError("No exam selected."); setFetching(false); return; }
    (async () => {
      setFetching(true);
      setFetchError(null);
      try {
        const res = await fetchQuestionsByExam(examId);
        if (res.data.questions.length === 0) {
          setFetchError("No questions found for this exam.");
        } else {
          setQuestions(res.data.questions);
        }
      } catch {
        setFetchError("Failed to load questions. Please try again.");
      } finally {
        setFetching(false);
      }
    })();
  }, [examId]);

  // ── Progress bar animation ───────────────────────────────────────────────────
  useEffect(() => {
    if (totalQuestions === 0) return;
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / totalQuestions,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, totalQuestions]);

  // ── Per-question timer ───────────────────────────────────────────────────────
  const handleTimeUp = useCallback(() => {
    if (!submitted && currentQuestion) {
      setSubmitted(true);
      setAnswers((prev) => ({ ...prev, [currentQuestion._id]: null }));
    }
  }, [submitted, currentQuestion]);

  useEffect(() => {
    setTimeLeft(QUESTION_TIME);
    setSubmitted(false);
    setSelectedKey(null);
    // Record duration of previous question before resetting
    if (currentQuestion) {
      const spent = Math.round((Date.now() - questionStartRef.current) / 1000);
      questionDurationsRef.current[currentQuestion._id] = spent;
    }
    questionStartRef.current = Date.now();
  }, [currentIndex]);

  useEffect(() => {
    if (submitted) { if (timerRef.current) clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => { if (t <= 1) { handleTimeUp(); return 0; } return t - 1; });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [submitted, currentIndex, handleTimeUp]);

  // ── Elapsed time tracker ─────────────────────────────────────────────────────
  useEffect(() => {
    elapsedRef.current = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => { if (elapsedRef.current) clearInterval(elapsedRef.current); };
  }, []);

  // ── Submit result to API when showing results ─────────────────────────────────
  const doSubmitResult = useCallback(
    async (finalAnswers: Record<string, "A" | "B" | "C" | "D" | null>, finalScore: number) => {
      if (!examId || questions.length === 0) return;
      setSubmitting(true);
      try {
        const payload = {
          examId,
          duration: elapsedSeconds,
          answers: questions.map((q) => ({
            questionId: q._id,
            selectedAnswer: finalAnswers[q._id] ?? null,
            duration: questionDurationsRef.current[q._id] ?? 0,
          })),

        };
        const res = await submitExamResult(payload);
        setServerPercentage(res.data.result.percentage);
      } catch {
        // Non-fatal — still show local results
        setServerPercentage(Math.round((finalScore / questions.length) * 100));
      } finally {
        setSubmitting(false);
      }
    },
    [examId, questions, elapsedSeconds]
  );

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleSelectOption = (key: "A" | "B" | "C" | "D") => {
    if (!submitted) setSelectedKey(key);
  };

  const handleSubmit = () => {
    if (!selectedKey) {
      Alert.alert("No Option Selected", "Please choose an answer before submitting.");
      return;
    }
    const isCorrect = selectedKey === currentQuestion.answer;
    setSubmitted(true);
    setAnswers((prev) => ({ ...prev, [currentQuestion._id]: selectedKey }));
    if (isCorrect) {
      setScore((s) => s + 1);
      setCoins((c) => c + COINS_PER_CORRECT);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 >= totalQuestions) {
      // finalise answers including current
      const finalAnswers = { ...answers, [currentQuestion._id]: selectedKey };
      setAnswers(finalAnswers);
      setShowResults(true);
      doSubmitResult(finalAnswers, score + (selectedKey === currentQuestion.answer ? 1 : 0));
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedKey(null);
    setSubmitted(false);
    setAnswers({});
    setCoins(0);
    setScore(0);
    setTimeLeft(QUESTION_TIME);
    setShowResults(false);
    setElapsedSeconds(0);
    setServerPercentage(null);
  };

  const handleExit = () => router.back();

  const getOptionState = (key: "A" | "B" | "C" | "D"): "idle" | "selected" | "correct" | "wrong" => {
    if (!currentQuestion) return "idle";
    if (!submitted) return selectedKey === key ? "selected" : "idle";
    if (key === currentQuestion.answer) return "correct";
    if (key === selectedKey && selectedKey !== currentQuestion.answer) return "wrong";
    return "idle";
  };

  // ── Loading / Error screens ──────────────────────────────────────────────────
  if (fetching) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2452FF" />
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">Loading questions…</Text>
      </View>
    );
  }

  if (fetchError) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center px-8">
        <Ionicons name="cloud-offline-outline" size={52} color="#9CA3AF" />
        <Text className="text-gray-900 dark:text-white font-bold text-lg text-center mt-4 mb-2">
          Couldn't load questions
        </Text>
        <Text className="text-gray-400 dark:text-gray-500 text-sm text-center leading-5 mb-6">{fetchError}</Text>
        <TouchableOpacity onPress={handleExit} className="border-2 border-brand-blue px-8 py-3 rounded-2xl">
          <Text className="text-brand-blue font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── Results ──────────────────────────────────────────────────────────────────
  if (showResults) {
    return (
      <>
        <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
          <TouchableOpacity onPress={handleExit} className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
            <Ionicons name="arrow-back" size={20} color={isDark ? "#F9FAFB" : "#111827"} />
          </TouchableOpacity>
          <Text className="text-base font-bold text-gray-900 dark:text-white">Results</Text>
          <View className="w-9" />
        </View>
        <ResultsScreen
          examName={examName ?? "Exam"}
          score={score}
          total={totalQuestions}
          coins={coins}
          answers={answers}
          questions={questions}
          percentage={serverPercentage ?? Math.round((score / totalQuestions) * 100)}
          submitting={submitting}
          onRetry={handleRetry}
          onExit={handleExit}
        />
      </>
    );
  }

  // ── Quiz UI ──────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <View className="flex-row items-center justify-between px-5 py-4 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <TouchableOpacity
          onPress={() => Alert.alert("Quit Test?", "Your progress will be lost if you leave now.", [
            { text: "Cancel", style: "cancel" },
            { text: "Quit", style: "destructive", onPress: () => router.back() },
          ])}
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "#F9FAFB" : "#111827"} />
        </TouchableOpacity>
        <View className="items-center">
          <Text className="text-[11px] font-bold text-brand-blue uppercase tracking-widest">{examName ?? "Exam"}</Text>
          <Text className="text-base font-extrabold text-gray-900 dark:text-white">
            {currentQuestion.question.split(" ").slice(0, 4).join(" ")}…
          </Text>
        </View>
        <View className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
          <Ionicons name="information-circle-outline" size={20} color={isDark ? "#F9FAFB" : "#111827"} />
        </View>
      </View>

      {/* Progress */}
      <View className="bg-white dark:bg-gray-900 pt-3 pb-2">
        <ProgressBar current={currentIndex + 1} total={totalQuestions} progress={progressAnim} />
      </View>

      {/* Stats */}
      <View className="mt-4">
        <StatCards timeLeft={timeLeft} coins={coins} isDark={isDark} />
      </View>

      {/* Question Card */}
      <View className="mx-5 mb-5 bg-white dark:bg-gray-800 rounded-3xl px-6 py-7 items-center" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0 : 0.06, shadowRadius: 12, elevation: 4 }}>
        <Text className="text-[17px] font-bold text-gray-900 dark:text-white text-center leading-7">
          {currentQuestion.question}
        </Text>
      </View>

      {/* Options */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {OPTION_KEYS.map((key) => (
          <OptionRow
            key={key}
            optKey={key}
            text={currentQuestion.options[key]}
            state={getOptionState(key)}
            onPress={() => handleSelectOption(key)}
          />
        ))}

        {/* Explanation after submit */}
        {submitted && currentQuestion.explanation ? (
          <View className="mx-5 mt-1 mb-2 bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-3 flex-row gap-3">
            <MaterialCommunityIcons name="lightbulb-on" size={18} color="#2452FF" />
            <Text className="flex-1 text-sm text-gray-600 dark:text-gray-300 leading-5 italic">
              {currentQuestion.explanation}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Bottom CTA */}
      <View className="absolute bottom-0 left-0 right-0 px-5 py-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800" style={{ shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 10 }}>
        {!submitted ? (
          <TouchableOpacity activeOpacity={0.88} onPress={handleSubmit} className="bg-brand-blue rounded-2xl py-4 flex-row items-center justify-center gap-3">
            <Text className="text-white font-bold text-base">Submit Answer</Text>
            <Ionicons name="arrow-forward" size={18} color="white" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity activeOpacity={0.88} onPress={handleNext} className="bg-brand-blue rounded-2xl py-4 flex-row items-center justify-center gap-3">
            <Text className="text-white font-bold text-base">
              {currentIndex + 1 >= totalQuestions ? "View Results" : "Next Question"}
            </Text>
            <Ionicons name={currentIndex + 1 >= totalQuestions ? "trophy-outline" : "arrow-forward"} size={18} color="white" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}
