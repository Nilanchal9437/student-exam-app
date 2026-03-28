/**
 * features/ForgetPassword/index.tsx
 *
 * New flow: enter email + new password + confirm password.
 * Calls POST /api/users/forget-password which resets directly on the server.
 * No email link or token involved. On success, navigates to login.
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

// ─── Theme token helper ───────────────────────────────────────────────────────
function useThemeColors(isDark: boolean) {
  return {
    iconMuted: isDark ? "#6B7280" : "#6B7280",
    iconEye: isDark ? "#6B7280" : "#9CA3AF",
    placeholder: isDark ? "#6B7280" : "#9CA3AF",
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
      <View
        className="absolute inset-0 rounded-2xl"
        style={{ backgroundColor: "rgba(0,0,0,0.42)" }}
      />
      <View className="absolute top-4 left-4 bg-brand-blue px-3 py-1 rounded-full">
        <Text className="text-white text-xs font-bold tracking-widest uppercase">
          Account Recovery
        </Text>
      </View>
      <View className="absolute bottom-4 left-4 right-4">
        <Text className="text-white text-2xl font-bold leading-tight">
          Reset Your Password
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
        Enter your registered email and choose a{" "}
        <Text className="text-brand-blue font-bold">new password</Text> to
        reset your account instantly.
      </Text>
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider() {
  return (
    <View className="flex-row items-center px-4 mt-5">
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <Text className="mx-3 text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase">
        Reset Details
      </Text>
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
    </View>
  );
}

// ─── Generic Input Field ──────────────────────────────────────────────────────
function InputField({
  label,
  placeholder,
  iconName,
  value,
  onChangeText,
  isDark,
  secureTextEntry = false,
  keyboardType = "default",
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
}: {
  label: string;
  placeholder: string;
  iconName: "email" | "lock" | "vpn-key";
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address";
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}) {
  const colors = useThemeColors(isDark);
  const [showValue, setShowValue] = useState(false);

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
          ref={inputRef}
          className="flex-1 text-gray-800 dark:text-gray-100 text-sm py-4"
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showValue}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === "done"}
        />
        {secureTextEntry && (
          <TouchableOpacity
            onPress={() => setShowValue((prev) => !prev)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={showValue ? "eye-off-outline" : "eye-outline"}
              size={18}
              color={colors.iconEye}
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ─── Info Box ─────────────────────────────────────────────────────────────────
function InfoBox() {
  return (
    <View className="mx-4 mt-5 bg-brand-blue/10 dark:bg-blue-900/30 border border-brand-blue/20 dark:border-blue-700/40 rounded-xl px-4 py-3 flex-row items-start gap-3">
      <MaterialIcons
        name="info-outline"
        size={18}
        color="#2452FF"
        style={{ marginTop: 1 }}
      />
      <Text className="flex-1 text-brand-blue dark:text-blue-300 text-xs leading-5">
        Make sure the email matches your registered account. Your password will
        be changed immediately.
      </Text>
    </View>
  );
}

// ─── Feedback banners ─────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <View className="mx-4 mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 flex-row items-start gap-2">
      <MaterialIcons name="error-outline" size={16} color="#EF4444" style={{ marginTop: 1 }} />
      <Text className="flex-1 text-red-600 dark:text-red-400 text-sm font-medium leading-5">
        {message}
      </Text>
    </View>
  );
}

function SuccessBanner({ message }: { message: string }) {
  return (
    <View className="mx-4 mt-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3 flex-row items-start gap-2">
      <MaterialIcons name="check-circle-outline" size={16} color="#22C55E" style={{ marginTop: 1 }} />
      <Text className="flex-1 text-green-600 dark:text-green-400 text-sm font-medium leading-5">
        {message}
      </Text>
    </View>
  );
}

// ─── Reset Password CTA ───────────────────────────────────────────────────────
function ResetCTA({ onPress, loading }: { onPress: () => void; loading: boolean }) {
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={loading}
        className="bg-brand-blue flex-row items-center justify-center gap-2 py-4 rounded-2xl"
        style={{
          shadowColor: "#2452FF",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
          opacity: loading ? 0.75 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="#ffffff" size="small" />
        ) : (
          <>
            <MaterialIcons name="lock-reset" size={18} color="white" />
            <Text className="text-white font-bold text-base">Reset Password</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Back to Login ────────────────────────────────────────────────────────────
function BackToLogin() {
  return (
    <View className="px-4 mt-4">
      <Link href="/(auth)/login" asChild>
        <TouchableOpacity
          activeOpacity={0.8}
          className="border-2 border-brand-blue flex-row items-center justify-center gap-2 py-4 rounded-2xl"
        >
          <MaterialIcons name="arrow-back" size={18} color="#2452FF" />
          <Text className="text-brand-blue font-bold text-base">
            Back to Login
          </Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <View className="px-4 mt-6 mb-10 items-center gap-3">
      <Text className="text-gray-600 dark:text-gray-400 text-sm">
        Don't have an account?{" "}
        <Link href="/" asChild>
          <Text className="text-brand-blue font-bold">Sign up</Text>
        </Link>
      </Text>
    </View>
  );
}

// ─── Forget Password Screen ───────────────────────────────────────────────────
export default function ForgetPasswordScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { forgetPassword } = useAuth();

  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const newPassRef = useRef<TextInput>(null);
  const confirmPassRef = useRef<TextInput>(null);

  const handleReset = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !newPassword || !confirmPassword) {
      setError("All fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      // On success, AuthContext navigates to /(auth)/login automatically
      await forgetPassword(email.trim(), newPassword, confirmPassword);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 32 }}
    >
      <View style={{ flex: 1 }}>
        <HeroBanner />
        <SubHeadline />
        <Divider />

        {error && <ErrorBanner message={error} />}
        {successMessage && <SuccessBanner message={successMessage} />}

        <InputField
          label="Email Address"
          placeholder="name@example.com"
          iconName="email"
          value={email}
          onChangeText={setEmail}
          isDark={isDark}
          keyboardType="email-address"
          returnKeyType="next"
          onSubmitEditing={() => newPassRef.current?.focus()}
        />

        <InputField
          label="New Password"
          placeholder="Min. 8 characters"
          iconName="lock"
          value={newPassword}
          onChangeText={setNewPassword}
          isDark={isDark}
          secureTextEntry
          returnKeyType="next"
          onSubmitEditing={() => confirmPassRef.current?.focus()}
          inputRef={newPassRef}
        />

        <InputField
          label="Confirm New Password"
          placeholder="Re-enter new password"
          iconName="vpn-key"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          isDark={isDark}
          secureTextEntry
          returnKeyType="done"
          onSubmitEditing={handleReset}
          inputRef={confirmPassRef}
        />

        <InfoBox />
        <ResetCTA onPress={handleReset} loading={loading} />
        <BackToLogin />
      </View>

      <Footer />
    </ScrollView>
  );
}
