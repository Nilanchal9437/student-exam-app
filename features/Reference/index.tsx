import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Share,
} from "react-native";
import {
  fetchReceivedReferences,
  Reference,
  RelationshipType,
} from "../../lib/referenceService";
import { fetchReferralStats } from "../../lib/referralService";
import { generateReferralLink } from "../../lib/appConfig";
import { useAuth } from "../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────
// Using Reference type from referenceService

// ─── Balance Card (matches VIPBanner / UpgradeBanner pattern) ─────────────────
function BalanceCard({ referralCoins }: { referralCoins: number }) {
  // Convert coins to currency (assuming 100 coins = ₦200 or adjust as needed)
  const currencyAmount = (referralCoins * 2).toLocaleString("en-NG");
  
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
      {/* Decorative blobs — matches Subject UpgradeBanner */}
      <View
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: 60,
          backgroundColor: "rgba(255,255,255,0.08)",
        }}
      />
      <View
        style={{
          position: "absolute",
          bottom: -20,
          left: 40,
          width: 90,
          height: 90,
          borderRadius: 45,
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      />

      {/* Badge — identical to Subject/Exam/Community UpgradeBanner badge */}
      <View className="self-start bg-white/20 px-[10px] py-1 rounded-full mb-3">
        <Text className="text-white text-[10px] font-bold uppercase tracking-widest">
          Referral Coins
        </Text>
      </View>

      {/* Balance amount — matches "Upgrade to VIP" text-2xl font-bold in VIPBanner */}
      <Text className="text-white text-3xl font-extrabold mb-1">
        {referralCoins} pts
      </Text>

      {/* Earning stats row — matches VIPBanner subtitle + CTA row */}
      <Text className="text-white/75 text-sm leading-5 mb-4">
        Earn 200 coins for every successful referral signup.
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 flex-1">
          <Ionicons name="trending-up-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text className="text-white/70 text-xs font-semibold">
            200 coins / referral
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.88}
          className="bg-white rounded-xl px-5 py-2.5 items-center"
        >
          <Text className="text-brand-blue font-bold text-sm">Coming Soon</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Referral Link Card (matches white card style in Subject/Exam) ─────────────
function ReferralLinkCard({ userId }: { userId?: string }) {
  // Generate both deep link and web fallback
  // Deep link: studenexamapp://ref/{userId} - opens app directly
  // Generate referral links based on environment (dev vs production)
  const referralLinks = userId 
    ? generateReferralLink(userId)
    : generateReferralLink("your-user-id");

  const displayLink = referralLinks.displayLink;
  const deepLink = referralLinks.deepLink;
  const webLink = referralLinks.webLink;

  const handleShareLink = async () => {
    try {
      // Share with both deep link and web fallback
      await Share.share({
        message: `Join me on Student Exam App! Download it now and use this link: ${deepLink}`,
        url: webLink, // iOS will use this if available
        title: "Join Student Exam App",
      });
    } catch (err) {
      Alert.alert("Share Error", "Failed to share referral link");
    }
  };

  return (
    <View
      className="mx-4 mt-5 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
      }}
    >
      {/* Header row — icon + title */}
      <View className="flex-row items-center gap-2 mb-4">
        <View className="w-8 h-8 rounded-xl bg-yellow-100 items-center justify-center">
          <Ionicons name="star" size={16} color="#EAB308" />
        </View>
        <Text className="text-gray-900 dark:text-white text-base font-bold">
          Referral Link
        </Text>
      </View>

      {/* Link + share button */}
      <View className="flex-row items-center gap-3">
        <View className="flex-1 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3">
          <Text className="text-gray-600 dark:text-gray-300 text-xs font-semibold break-words">
            {displayLink}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleShareLink}
          className="w-11 h-11 rounded-xl bg-brand-blue/10 items-center justify-center"
        >
          <Ionicons name="share-social-outline" size={20} color="#2452FF" />
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 dark:text-gray-500 text-xs mt-3 leading-5">
        When someone opens this link and signs up, you earn coins! Share with friends to earn rewards.
      </Text>
    </View>
  );
}

// ─── Referral Tabs (matches CommunityLeaderBoard tab bar pattern) ──────────────
function ReferralTabs({
  active,
  onChange,
  totalActive,
  totalInactive,
}: {
  active: "Active" | "Inactive";
  onChange: (tab: "Active" | "Inactive") => void;
  totalActive: number;
  totalInactive: number;
}) {
  return (
    <View className="mx-4 mt-4 flex-row bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-1">
      {(["Active", "Inactive"] as const).map((tab) => {
        const isActive = active === tab;
        const count = tab === "Active" ? totalActive : totalInactive;
        return (
          <TouchableOpacity
            key={tab}
            activeOpacity={0.85}
            onPress={() => onChange(tab)}
            className={`flex-1 py-2.5 rounded-lg items-center ${
              isActive ? "bg-brand-blue" : "bg-transparent"
            }`}
          >
            <Text
              className={`font-bold text-sm ${
                isActive
                  ? "text-white"
                  : "text-gray-600 dark:text-gray-300"
              }`}
            >
              {tab} ({count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Referral Row (matches RankRow / ExamCard card pattern) ────────────────────
function ReferralRow({ item }: { item: Reference }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const isPaid = true; // Default to paid status

  return (
    <View
      className="mx-4 mt-3 bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 flex-row items-center justify-between"
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
        borderWidth: 1,
        borderColor: isPaid ? "#DCFCE7" : "#F1F5F9",
      }}
    >
      {/* Avatar + name + date */}
      <View className="flex-row items-center gap-3 flex-1">
        <View
          className={`w-10 h-10 rounded-full items-center justify-center ${
            isPaid ? "bg-green-100" : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          {isPaid ? (
            <Ionicons name="person" size={18} color="#16A34A" />
          ) : (
            <Ionicons name="hourglass-outline" size={18} color="#9CA3AF" />
          )}
        </View>
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-white text-sm font-bold leading-5">
            {item.referrer.fullName}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
            {formatDate(item.createdAt)}
          </Text>
        </View>
      </View>

      {/* Rating + badge */}
      <View className="items-end gap-1.5">
        <Text
          className={`text-base font-extrabold ${
            isPaid ? "text-green-600" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          ★ {item.rating}
        </Text>
        <View
          className={`px-2.5 py-0.5 rounded-full ${
            item.isActive
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-gray-100 dark:bg-gray-900/30"
          }`}
        >
          <Text
            className={`text-[10px] font-bold uppercase tracking-wide ${
              item.isActive
                ? "text-green-600 dark:text-green-300"
                : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {item.isActive ? "Active" : "Inactive"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Reference Screen ─────────────────────────────────────────────────────────
export default function ReferenceScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"Active" | "Inactive">("Active");
  const [references, setReferences] = useState<Reference[]>([]);
  const [referralCoins, setReferralCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch references and referral stats from API
  const loadReferences = useCallback(async () => {
    try {
      setError(null);
      // Fetch both references and referral stats in parallel
      const [referencesRes, statsRes] = await Promise.all([
        fetchReceivedReferences({
          page: 1,
          limit: 50,
        }),
        fetchReferralStats(),
      ]);

      if (referencesRes.success) {
        setReferences(referencesRes.data.references);
      }

      if (statsRes.success) {
        setReferralCoins(statsRes.data.referralCoins);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh handler
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const [referencesRes, statsRes] = await Promise.all([
        fetchReceivedReferences({
          page: 1,
          limit: 50,
        }),
        fetchReferralStats(),
      ]);

      if (referencesRes.success) {
        setReferences(referencesRes.data.references);
      }

      if (statsRes.success) {
        setReferralCoins(statsRes.data.referralCoins);
      }
    } catch (err) {
      console.error("Error refreshing data:", err);
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    loadReferences();
  }, [loadReferences]);

  // Filter references by active status
  const filteredReferences = references.filter(
    (item) => item.isActive === (activeTab === "Active")
  );

  const totalActive = references.filter((item) => item.isActive).length;
  const totalInactive = references.filter((item) => !item.isActive).length;

  if (loading) {
    return (
      <View className="flex-1 bg-gray-50 dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2452FF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#2452FF"
          />
        }
      >
        {/* Balance banner — same elevation/colour as other blue banners */}
        <BalanceCard referralCoins={referralCoins} />

        {/* Minimum withdrawal note — matches text-xs muted label style */}
        <Text className="text-center text-gray-500 dark:text-gray-400 mt-3 text-xs font-semibold">
          Minimum withdrawal:{" "}
          <Text className="text-brand-blue font-extrabold">₦10,000</Text>
        </Text>

        {/* Referral link card */}
        <ReferralLinkCard userId={user?.id} />

        {/* Section header — matches SectionHeader in Home / Exam */}
        <View className="flex-row items-center justify-between px-4 mt-6 mb-1">
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            Your References
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
            {references.length} Total
          </Text>
        </View>

        {/* Tab filter — matches tab pill style across app */}
        <ReferralTabs
          active={activeTab}
          onChange={setActiveTab}
          totalActive={totalActive}
          totalInactive={totalInactive}
        />

        {/* Error message */}
        {error && (
          <View className="mx-4 mt-4 bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
            <Text className="text-red-600 dark:text-red-300 text-sm">
              {error}
            </Text>
          </View>
        )}

        {/* Empty state */}
        {filteredReferences.length === 0 && !error && (
          <View className="mx-4 mt-6 items-center justify-center py-8">
            <Ionicons name="star-outline" size={40} color="#9CA3AF" />
            <Text className="text-gray-500 dark:text-gray-400 text-sm font-semibold mt-3">
              No {activeTab.toLowerCase()} references yet
            </Text>
          </View>
        )}

        {/* Reference list rows */}
        {filteredReferences.map((item) => (
          <ReferralRow key={item._id} item={item} />
        ))}

        {/* "View All" link — matches "View Full Ranking" link in Home */}
        {filteredReferences.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            className="mt-5 items-center justify-center py-3 mx-4 flex-row gap-1.5"
          >
            <Text className="text-brand-blue text-sm font-semibold">
              View All References
            </Text>
            <Ionicons name="arrow-forward" size={14} color="#2452FF" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
}
