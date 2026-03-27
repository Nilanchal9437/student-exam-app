import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
type Referral = {
  id: string;
  name: string;
  dateTime: string;
  amount: string;
  status: "Paid" | "Pending";
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const REFERRAL_LINK = "refer.app/u/vip-user-2024";

const REFERRALS: Referral[] = [
  {
    id: "1",
    name: "Adekunle Johnson",
    dateTime: "Oct 24, 2023 · 10:45 AM",
    amount: "+ ₦200",
    status: "Paid",
  },
  {
    id: "2",
    name: "Chioma Eze",
    dateTime: "Oct 23, 2023 · 08:12 PM",
    amount: "+ ₦200",
    status: "Paid",
  },
  {
    id: "3",
    name: "Musa Ibrahim",
    dateTime: "Oct 24, 2023 · 12:30 PM",
    amount: "₦0.00",
    status: "Pending",
  },
];

// ─── Balance Card (matches VIPBanner / UpgradeBanner pattern) ─────────────────
function BalanceCard() {
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
          Total Balance
        </Text>
      </View>

      {/* Balance amount — matches "Upgrade to VIP" text-2xl font-bold in VIPBanner */}
      <Text className="text-white text-3xl font-extrabold mb-1">
        ₦25,400.00
      </Text>

      {/* Earning stats row — matches VIPBanner subtitle + CTA row */}
      <Text className="text-white/75 text-sm leading-5 mb-4">
        Earn ₦200 for every successful VIP referral you make.
      </Text>

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-1.5 flex-1">
          <Ionicons name="trending-up-outline" size={14} color="rgba(255,255,255,0.7)" />
          <Text className="text-white/70 text-xs font-semibold">
            ₦200 / VIP upgrade
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.88}
          className="bg-white rounded-xl px-5 py-2.5 items-center"
        >
          <Text className="text-brand-blue font-bold text-sm">Withdraw</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Referral Link Card (matches white card style in Subject/Exam) ─────────────
function ReferralLinkCard() {
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
          VIP Referral Link
        </Text>
      </View>

      {/* Link + copy button */}
      <View className="flex-row items-center gap-3">
        <View className="flex-1 rounded-xl border border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 px-4 py-3">
          <Text className="text-gray-600 dark:text-gray-300 text-sm font-semibold">
            {REFERRAL_LINK}
          </Text>
        </View>
        <TouchableOpacity
          activeOpacity={0.8}
          className="w-11 h-11 rounded-xl bg-brand-blue/10 items-center justify-center"
        >
          <Ionicons name="copy-outline" size={20} color="#2452FF" />
        </TouchableOpacity>
      </View>

      <Text className="text-gray-400 dark:text-gray-500 text-xs mt-3 leading-5">
        Share this link to earn ₦200 for every successful VIP upgrade.
      </Text>
    </View>
  );
}

// ─── Referral Tabs (matches CommunityLeaderBoard tab bar pattern) ──────────────
function ReferralTabs({
  active,
  onChange,
}: {
  active: "Paid" | "Pending";
  onChange: (tab: "Paid" | "Pending") => void;
}) {
  return (
    <View className="mx-4 mt-4 flex-row bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-1">
      {(["Paid", "Pending"] as const).map((tab) => {
        const isActive = active === tab;
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
              {tab === "Paid" ? "Paid (32)" : "Pending (16)"}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Referral Row (matches RankRow / ExamCard card pattern) ────────────────────
function ReferralRow({ item }: { item: Referral }) {
  const isPaid = item.status === "Paid";

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
            {item.name}
          </Text>
          <Text className="text-gray-400 dark:text-gray-500 text-xs mt-0.5">
            {item.dateTime}
          </Text>
        </View>
      </View>

      {/* Amount + status badge */}
      <View className="items-end gap-1.5">
        <Text
          className={`text-base font-extrabold ${
            isPaid ? "text-green-600" : "text-gray-400 dark:text-gray-500"
          }`}
        >
          {item.amount}
        </Text>
        <View
          className={`px-2.5 py-0.5 rounded-full ${
            isPaid
              ? "bg-green-100 dark:bg-green-900/30"
              : "bg-yellow-100 dark:bg-yellow-900/30"
          }`}
        >
          <Text
            className={`text-[10px] font-bold uppercase tracking-wide ${
              isPaid
                ? "text-green-600 dark:text-green-300"
                : "text-yellow-700 dark:text-yellow-300"
            }`}
          >
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Reference Screen ─────────────────────────────────────────────────────────
export default function ReferenceScreen() {
  const [activeTab, setActiveTab] = useState<"Paid" | "Pending">("Paid");
  const visibleReferrals = REFERRALS.filter((item) => item.status === activeTab);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
        className="flex-1"
      >
        {/* Balance banner — same elevation/colour as other blue banners */}
        <BalanceCard />

        {/* Minimum withdrawal note — matches text-xs muted label style */}
        <Text className="text-center text-gray-500 dark:text-gray-400 mt-3 text-xs font-semibold">
          Minimum withdrawal:{" "}
          <Text className="text-brand-blue font-extrabold">₦10,000</Text>
        </Text>

        {/* Referral link card */}
        <ReferralLinkCard />

        {/* Section header — matches SectionHeader in Home / Exam */}
        <View className="flex-row items-center justify-between px-4 mt-6 mb-1">
          <Text className="text-gray-900 dark:text-white text-lg font-bold">
            Your Referrals
          </Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm font-semibold">
            48 Total
          </Text>
        </View>

        {/* Tab filter — matches tab pill style across app */}
        <ReferralTabs active={activeTab} onChange={setActiveTab} />

        {/* Referral list rows */}
        {visibleReferrals.map((item) => (
          <ReferralRow key={item.id} item={item} />
        ))}

        {/* "View All" link — matches "View Full Ranking" link in Home */}
        <TouchableOpacity
          activeOpacity={0.8}
          className="mt-5 items-center justify-center py-3 mx-4 flex-row gap-1.5"
        >
          <Text className="text-brand-blue text-sm font-semibold">
            View All Referrals
          </Text>
          <Ionicons name="arrow-forward" size={14} color="#2452FF" />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
