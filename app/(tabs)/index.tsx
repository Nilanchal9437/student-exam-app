import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";

// ─── Navigation Bar ────────────────────────────────────────────────────────────
function NavBar() {
  return (
    <SafeAreaView className="bg-white">
      <View className="flex-row items-center justify-between px-5 py-3 bg-white border-b border-gray-100">
        {/* Logo */}
        <View className="flex-row items-center gap-2">
          <View className="w-8 h-8 bg-brand-blue rounded-lg items-center justify-center">
            <Ionicons name="book" size={16} color="white" />
          </View>
          <Text className="text-lg font-bold text-gray-900 tracking-tight">
            EduLearn
          </Text>
        </View>

        {/* Right actions */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-9 h-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="search" size={18} color="#374151" />
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.7}
            className="w-9 h-9 items-center justify-center rounded-full bg-gray-100"
          >
            <Ionicons name="notifications-outline" size={18} color="#374151" />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

// ─── Hero Banner ───────────────────────────────────────────────────────────────
function HeroBanner() {
  return (
    <View className="mx-4 mt-4 rounded-2xl overflow-hidden">
      <Image
        source={require("@/assets/images/students_learning.png")}
        className="w-full h-52"
        style={{ resizeMode: "cover" }}
      />
      {/* Overlay gradient */}
      <View
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      />
      {/* Badge */}
      <View className="absolute top-4 left-4 bg-brand-blue px-3 py-1 rounded-full">
        <Text className="text-white text-xs font-bold tracking-widest uppercase">
          Limited Offer
        </Text>
      </View>
      {/* Headline */}
      <View className="absolute bottom-4 left-4 right-4">
        <Text className="text-white text-2xl font-bold leading-tight">
          Start Learning Today
        </Text>
      </View>
    </View>
  );
}

// ─── Sub-headline ──────────────────────────────────────────────────────────────
function SubHeadline() {
  return (
    <View className="px-4 mt-5">
      <Text className="text-gray-600 text-base leading-6">
        Unlock your potential with expert-led courses. Sign up now and get your{" "}
        <Text className="text-brand-blue font-bold">
          first 2 subjects completely free!
        </Text>
      </Text>
    </View>
  );
}

// ─── Primary CTA ──────────────────────────────────────────────────────────────
function PrimaryCTA() {
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.85}
        className="bg-brand-blue flex-row items-center justify-center gap-3 py-4 rounded-2xl"
        style={{
          shadowColor: "#2452FF",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <Ionicons name="wallet-outline" size={20} color="white" />
        <Text className="text-white font-bold text-base">
          Free Sign up with Wallet
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Divider ────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <View className="flex-row items-center px-4 mt-5">
      <View className="flex-1 h-px bg-gray-200" />
      <Text className="mx-3 text-xs text-gray-400 font-semibold tracking-widest uppercase">
        Or Continue With
      </Text>
      <View className="flex-1 h-px bg-gray-200" />
    </View>
  );
}

// ─── Secondary CTA ────────────────────────────────────────────────────────────
function SecondaryCTA() {
  return (
    <View className="px-4 mt-4">
      <TouchableOpacity
        activeOpacity={0.8}
        className="border-2 border-brand-blue flex-row items-center justify-center py-4 rounded-2xl"
      >
        <Text className="text-brand-blue font-bold text-base">
          Create Account with Email
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Social Buttons ───────────────────────────────────────────────────────────
function SocialButtons() {
  return (
    <View className="px-4 mt-4 flex-row gap-3">
      {/* Google */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-1 flex-row items-center justify-center gap-2 border border-gray-200 bg-gray-50 py-4 rounded-2xl"
      >
        <FontAwesome name="google" size={18} color="#EA4335" />
        <Text className="text-gray-700 font-semibold text-sm">Google</Text>
      </TouchableOpacity>

      {/* Facebook */}
      <TouchableOpacity
        activeOpacity={0.8}
        className="flex-1 flex-row items-center justify-center gap-2 border border-gray-200 bg-gray-50 py-4 rounded-2xl"
      >
        <FontAwesome name="facebook" size={18} color="#1877F2" />
        <Text className="text-gray-700 font-semibold text-sm">Facebook</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Login / Terms Footer ──────────────────────────────────────────────────────
function Footer() {
  return (
    <View className="px-4 mt-6 mb-8 items-center gap-2">
      <Text className="text-gray-600 text-sm">
        Already have an account?{" "}
        <Text className="text-brand-blue font-bold">Log in</Text>
      </Text>
      <Text className="text-gray-400 text-xs text-center leading-4">
        By signing up, you agree to our{" "}
        <Text className="text-gray-500 underline">Terms of Service</Text> and{" "}
        <Text className="text-gray-500 underline">Privacy Policy</Text>.
      </Text>
    </View>
  );
}

// ─── Root Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <NavBar />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        <HeroBanner />
        <SubHeadline />
        <PrimaryCTA />
        <OrDivider />
        <SecondaryCTA />
        <SocialButtons />
        <Footer />
      </ScrollView>
    </View>
  );
}
