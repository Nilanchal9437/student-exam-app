import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// ─── Theme token helper ───────────────────────────────────────────────────────
// Returns raw hex values for elements that can't consume NativeWind classes
// (e.g. icon `color` props, TextInput placeholderTextColor).
function useThemeColors(isDark: boolean) {
  return {
    iconMuted: isDark ? "#6B7280" : "#6B7280",
    iconBack: isDark ? "#F3F4F6" : "#111827",
    iconEye: isDark ? "#6B7280" : "#9CA3AF",
    placeholder: isDark ? "#6B7280" : "#9CA3AF",
    statusBar: isDark ? "light-content" : "dark-content",
    statusBarBg: isDark ? "#111827" : "#ffffff",
  } as const;
}

// ─── Hero Banner ──────────────────────────────────────────────────────────────
function HeroBanner() {
  return (
    <View className="mx-4 mt-2 rounded-2xl overflow-hidden">
      <Image
        source={require("@/assets/images/students_learning.png")}
        className="w-full h-52"
        style={{ resizeMode: "cover" }}
      />
      {/* Overlay — same in both themes; image is already dark enough */}
      <View
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundColor: "rgba(0,0,0,0.42)" }}
      />
      {/* LIMITED OFFER badge */}
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

// ─── Sub-headline ─────────────────────────────────────────────────────────────
function SubHeadline() {
  return (
    <View className="px-4 mt-5">
      <Text className="text-gray-600 dark:text-gray-400 text-base leading-6">
        Unlock your potential with expert-led courses. Sign up now and get your{" "}
        <Text className="text-brand-blue font-bold">
          first 2 subjects completely free!
        </Text>
      </Text>
    </View>
  );
}

// ─── Wallet CTA ───────────────────────────────────────────────────────────────
function WalletCTA() {
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
        <MaterialIcons name="account-balance-wallet" size={20} color="white" />
        <Text className="text-white font-bold text-base">
          Free Sign up with Wallet
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <View className="flex-row items-center px-4 mt-5">
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <Text className="mx-3 text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase">
        Or Continue With
      </Text>
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  );
}

// ─── Input Field ──────────────────────────────────────────────────────────────
function InputField({
  label,
  placeholder,
  iconName,
  secureTextEntry = false,
  value,
  onChangeText,
  isDark,
}: {
  label: string;
  placeholder: string;
  iconName: "email" | "lock";
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const colors = useThemeColors(isDark);

  return (
    <View className="px-4 mt-4">
      <Text className="text-gray-800 dark:text-gray-200 font-semibold text-sm mb-2">
        {label}
      </Text>
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 border border-gray-200 dark:border-gray-700">
        <View className="mr-3 opacity-50">
          <MaterialIcons name={iconName} size={18} color={colors.iconMuted} />
        </View>
        <TextInput
          className="flex-1 text-gray-800 dark:text-gray-100 text-sm py-4"
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowPassword((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showPassword ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.iconEye}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Create Account CTA ───────────────────────────────────────────────────────
function CreateAccountCTA({ onPress }: { onPress?: () => void }) {
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="border-2 border-brand-blue dark:border-brand-blue flex-row items-center justify-center py-4 rounded-2xl"
      >
        <Text className="text-brand-blue font-bold text-base">
          Create Account with Email
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <View className="px-4 mt-6 mb-10 items-center gap-3">
      <Text className="text-gray-600 dark:text-gray-400 text-sm">
        Already have an account?{" "}
        <Link href="/(auth)/login" asChild>
          <Text className="text-brand-blue font-bold">Log in</Text>
        </Link>
      </Text>
      <Text className="text-gray-400 dark:text-gray-600 text-xs text-center leading-5 px-4">
        By signing up, you agree to our{" "}
        <Text className="text-gray-500 dark:text-gray-400 underline">
          Terms of Service
        </Text>{" "}
        and{" "}
        <Text className="text-gray-500 dark:text-gray-400 underline">
          Privacy Policy
        </Text>
        .
      </Text>
    </View>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────
export default function SignupScreen({
  onCreateAccount,
}: {
  onCreateAccount?: (email: string, password: string) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <SafeAreaView
      className="flex-1 bg-white dark:bg-gray-900"
      edges={["bottom"]}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={20}
      >
        <ScrollView
          className="flex-1 bg-white dark:bg-gray-900"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 20 }}
        >
          {/* Main content — grows to push footer down */}
          <View style={{ flex: 1 }}>
            {/* Hero image */}
            <HeroBanner />

            {/* Sub-headline */}
            <SubHeadline />

            {/* Email field */}
            <InputField
              label="Email Address"
              placeholder="name@example.com"
              iconName="email"
              value={email}
              onChangeText={setEmail}
              isDark={isDark}
            />

            {/* Password field */}
            <InputField
              label="Password"
              placeholder="Min. 8 characters"
              iconName="lock"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              isDark={isDark}
            />

            {/* Create account button */}
            <CreateAccountCTA
              onPress={() => onCreateAccount?.(email, password)}
            />
          </View>

          {/* Footer always at the bottom */}
          <Footer />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
