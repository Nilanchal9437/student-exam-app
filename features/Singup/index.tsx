/**
 * features/Singup/index.tsx
 * Signup screen — calls POST /api/users/register via AuthContext.
 * Collects fullName + email + password; shows loading + error states.
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
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
    iconBack: isDark ? "#F3F4F6" : "#111827",
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
          Limited Offer
        </Text>
      </View>
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

// ─── Generic Input Field ──────────────────────────────────────────────────────
function InputField({
  label,
  placeholder,
  iconName,
  secureTextEntry = false,
  value,
  onChangeText,
  isDark,
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
  keyboardType,
}: {
  label: string;
  placeholder: string;
  iconName: "email" | "lock" | "person";
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  keyboardType?: "default" | "email-address";
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
          ref={inputRef}
          className="flex-1 text-gray-800 dark:text-gray-100 text-sm py-4"
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          secureTextEntry={secureTextEntry && !showPassword}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize={iconName === "person" ? "words" : "none"}
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === "done"}
          keyboardType={keyboardType ?? "default"}
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

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message }: { message: string }) {
  return (
    <View className="mx-4 mt-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-xl px-4 py-3 flex-row items-center gap-2">
      <MaterialIcons name="error-outline" size={16} color="#EF4444" />
      <Text className="flex-1 text-red-600 dark:text-red-400 text-sm font-medium">
        {message}
      </Text>
    </View>
  );
}

// ─── Create Account CTA ───────────────────────────────────────────────────────
function CreateAccountCTA({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        disabled={loading}
        className="border-2 border-brand-blue dark:border-brand-blue flex-row items-center justify-center py-4 rounded-2xl"
        style={{ opacity: loading ? 0.75 : 1 }}
      >
        {loading ? (
          <ActivityIndicator color="#2452FF" size="small" />
        ) : (
          <Text className="text-brand-blue font-bold text-base">
            Create Account with Email
          </Text>
        )}
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

// ─── Signup Screen ────────────────────────────────────────────────────────────
export default function SignupScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { register } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailRef = React.useRef<TextInput>(null);
  const passwordRef = React.useRef<TextInput>(null);

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError("All fields are required.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
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

        {error && <ErrorBanner message={error} />}

        <InputField
          label="Full Name"
          placeholder="John Doe"
          iconName="person"
          value={fullName}
          onChangeText={setFullName}
          isDark={isDark}
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
        />

        <InputField
          label="Email Address"
          placeholder="name@example.com"
          iconName="email"
          value={email}
          onChangeText={setEmail}
          isDark={isDark}
          returnKeyType="next"
          keyboardType="email-address"
          onSubmitEditing={() => passwordRef.current?.focus()}
          inputRef={emailRef}
        />

        <InputField
          label="Password"
          placeholder="Min. 8 characters"
          iconName="lock"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          isDark={isDark}
          returnKeyType="done"
          onSubmitEditing={handleRegister}
          inputRef={passwordRef}
        />

        <CreateAccountCTA onPress={handleRegister} loading={loading} />
      </View>

      <Footer />
    </ScrollView>
  );
}
