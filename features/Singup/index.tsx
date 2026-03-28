import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Link } from "expo-router";
import React, { useState } from "react";
import {
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

// ─── Signup Screen ────────────────────────────────────────────────────────────
// Android: softwareKeyboardLayoutMode="pan" in app.json handles keyboard
// avoidance natively. No KeyboardAvoidingView needed.
export default function SignupScreen({
  onCreateAccount,
}: {
  onCreateAccount?: (email: string, password: string) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = React.useRef<TextInput>(null);

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
          inputRef={passwordRef}
        />

        <CreateAccountCTA
          onPress={() => onCreateAccount?.(email, password)}
        />
      </View>

      <Footer />
    </ScrollView>
  );
}
