/**
 * features/Login/index.tsx
 * Login screen — calls POST /api/users/login via AuthContext.
 * Shows inline error messages and a loading state on the CTA.
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
          Welcome Back!
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
        Log in to continue your learning journey and access your{" "}
        <Text className="text-brand-blue font-bold">personalised courses.</Text>
      </Text>
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
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
}: {
  label: string;
  placeholder: string;
  iconName: "email" | "lock";
  secureTextEntry?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
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
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === "done"}
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

// ─── Forgot Password ──────────────────────────────────────────────────────────
function ForgotPassword() {
  return (
    <View className="px-4 mt-2 items-end">
      <Link href="/forget-password" asChild>
        <TouchableOpacity activeOpacity={0.7}>
          <Text className="text-brand-blue text-sm font-semibold">
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </Link>
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

// ─── Login CTA ────────────────────────────────────────────────────────────────
function LoginCTA({
  onPress,
  loading,
}: {
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={loading}
        className="bg-brand-blue flex-row items-center justify-center py-4 rounded-2xl"
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
          <Text className="text-white font-bold text-base">Log In</Text>
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
        Don't have an account?{" "}
        <Link href="/" asChild>
          <Text className="text-brand-blue font-bold">Sign up</Text>
        </Link>
      </Text>
      <Text className="text-gray-400 dark:text-gray-600 text-xs text-center leading-5 px-4">
        By logging in, you agree to our{" "}
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
export default function LoginScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = React.useRef<TextInput>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed.");
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
        <OrDivider />

        {error && <ErrorBanner message={error} />}

        <InputField
          label="Email Address"
          placeholder="name@example.com"
          iconName="email"
          value={email}
          onChangeText={setEmail}
          isDark={isDark}
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
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
          onSubmitEditing={handleLogin}
          inputRef={passwordRef}
        />

        <ForgotPassword />
        <LoginCTA onPress={handleLogin} loading={loading} />
      </View>

      <Footer />
    </ScrollView>
  );
}
