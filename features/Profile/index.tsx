/**
 * features/Profile/index.tsx
 *
 * Personal Info section     → PUT /api/users/profile
 * Security section          → PUT /api/users/change-password
 * Bank Account section      → PUT /api/users/bank-account
 *
 * On mount the current user is loaded from AuthContext (restored from
 * AsyncStorage). A fresh copy is also fetched from GET /api/users/profile
 * so the form always shows the latest server-side data.
 */

import { useAuth } from "@/context/AuthContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
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
import { changePassword, getProfile, updateProfile } from "../../lib/profileService";
import { getBankAccount, updateBankAccount } from "../../lib/bankAccountService";

// ─── Theme helpers ────────────────────────────────────────────────────────────
function useThemeColors(isDark: boolean) {
  return {
    iconMuted: isDark ? "#6B7280" : "#6B7280",
    iconEye: isDark ? "#6B7280" : "#9CA3AF",
    placeholder: isDark ? "#6B7280" : "#9CA3AF",
  } as const;
}

// ─── Shared components ────────────────────────────────────────────────────────
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
          Account Settings
        </Text>
      </View>
      <View className="absolute bottom-4 left-4 right-4">
        <Text className="text-white text-2xl font-bold leading-tight">
          Manage Your Profile
        </Text>
      </View>
    </View>
  );
}

function SectionTitle({ title }: { title: string }) {
  return (
    <View className="px-4 mt-5">
      <Text className="text-gray-900 dark:text-gray-100 text-lg font-bold">
        {title}
      </Text>
    </View>
  );
}

function Divider({ title }: { title: string }) {
  return (
    <View className="flex-row items-center px-4 mt-4">
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
      <Text className="mx-3 text-xs text-gray-400 dark:text-gray-500 font-semibold tracking-widest uppercase">
        {title}
      </Text>
      <View className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
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

// ─── Input Field ──────────────────────────────────────────────────────────────
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
  editable = true,
}: {
  label: string;
  placeholder: string;
  iconName: "email" | "phone" | "school" | "lock" | "vpn-key" | "person";
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  editable?: boolean;
}) {
  const colors = useThemeColors(isDark);
  const [showValue, setShowValue] = useState(false);

  return (
    <View className="px-4 mt-4">
      <Text className="text-gray-800 dark:text-gray-200 font-semibold text-sm mb-2">
        {label}
      </Text>
      <View
        className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 border border-gray-200 dark:border-gray-700"
        style={{ opacity: editable ? 1 : 0.5 }}
      >
        <View className="mr-3 opacity-60">
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
          autoCapitalize={
            keyboardType === "default" && !secureTextEntry ? "sentences" : "none"
          }
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === "done"}
          editable={editable}
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

// ─── CTA Button ───────────────────────────────────────────────────────────────
function PrimaryButton({
  label,
  icon,
  onPress,
  loading,
  variant = "filled",
}: {
  label: string;
  icon: string;
  onPress: () => void;
  loading: boolean;
  variant?: "filled" | "outline";
}) {
  const filled = variant === "filled";
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={loading}
        className={`flex-row items-center justify-center gap-2 py-4 rounded-2xl border-2 ${
          filled
            ? "bg-brand-blue border-brand-blue"
            : "border-brand-blue bg-transparent"
        }`}
        style={{
          shadowColor: filled ? "#2452FF" : "transparent",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: filled ? 0.3 : 0,
          shadowRadius: 12,
          elevation: filled ? 8 : 0,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color={filled ? "#fff" : "#2452FF"} size="small" />
        ) : (
          <>
            <MaterialIcons
              name={icon as never}
              size={18}
              color={filled ? "white" : "#2452FF"}
            />
            <Text
              className={`font-bold text-base ${
                filled ? "text-white" : "text-brand-blue"
              }`}
            >
              {label}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

function FooterHint() {
  return (
    <View className="mx-4 mt-5 mb-10 bg-brand-blue/10 dark:bg-blue-900/30 border border-brand-blue/20 dark:border-blue-700/40 rounded-xl px-4 py-3 flex-row items-start gap-3">
      <MaterialIcons
        name="info-outline"
        size={18}
        color="#2452FF"
        style={{ marginTop: 1 }}
      />
      <Text className="flex-1 text-brand-blue dark:text-blue-300 text-xs leading-5">
        Keep your profile and bank details up to date so you can receive exam alerts, class notifications, and process payments seamlessly.
      </Text>
    </View>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const { user, updateUser } = useAuth();

  // ── Personal info state ──────────────────────────────────────────────────────
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [className, setClassName] = useState(user?.className ?? "");

  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetching, setProfileFetching] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // ── Password state ───────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // ── Bank Account state ───────────────────────────────────────────────────────
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");

  const [bankLoading, setBankLoading] = useState(false);
  const [bankError, setBankError] = useState<string | null>(null);
  const [bankSuccess, setBankSuccess] = useState<string | null>(null);

  // ── Refs ─────────────────────────────────────────────────────────────────────
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const classRef = useRef<TextInput>(null);
  const newPassRef = useRef<TextInput>(null);
  const confirmPassRef = useRef<TextInput>(null);
  const accountNumberRef = useRef<TextInput>(null);
  const bankNameRef = useRef<TextInput>(null);
  const bankCodeRef = useRef<TextInput>(null);

  // ── Fetch latest profile from API on mount ──────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        setProfileFetching(true);
        const res = await getProfile();
        const u = res.data.user;
        setFullName(u.fullName ?? "");
        setEmail(u.email ?? "");
        setPhone(u.phone ?? "");
        setClassName(u.className ?? "");
      } catch {
        // Silently fall back to cached user from AuthContext
        setFullName(user?.fullName ?? "");
        setEmail(user?.email ?? "");
        setPhone(user?.phone ?? "");
        setClassName(user?.className ?? "");
      } finally {
        setProfileFetching(false);
      }
    })();

    // Fetch bank account data separately
    (async () => {
      try {
        const res = await getBankAccount();
        const bank = res.data.bankAccount;
        setAccountName(bank.accountName ?? "");
        setAccountNumber(bank.accountNumber ?? "");
        setBankName(bank.bankName ?? "");
        setBankCode(bank.bankCode ?? "");
      } catch {
        // Silently fail - user might not have added bank details yet
        setAccountName("");
        setAccountNumber("");
        setBankName("");
        setBankCode("");
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Save Profile ─────────────────────────────────────────────────────────────
  const handleSaveProfile = async () => {
    if (!fullName.trim() || !email.trim()) {
      setProfileError("Full name and email are required.");
      setProfileSuccess(null);
      return;
    }
    setProfileError(null);
    setProfileSuccess(null);
    setProfileLoading(true);
    try {
      const res = await updateProfile({
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        className: className.trim(),
      });
      // Sync updated user back into global AuthContext + AsyncStorage
      await updateUser(res.data.user);
      setProfileSuccess(res.message || "Profile updated successfully!");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setProfileError(msg ?? "Failed to update profile. Please try again.");
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Change Password ───────────────────────────────────────────────────────────
  const handleChangePassword = async () => {
    setPassError(null);
    setPassSuccess(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPassError("All password fields are required.");
      return;
    }
    if (newPassword.length < 8) {
      setPassError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassError("New password and confirm password do not match.");
      return;
    }

    setPassLoading(true);
    try {
      const res = await changePassword({
        currentPassword,
        newPassword,
        confirmPassword,
      });
      setPassSuccess(res.message || "Password changed successfully!");
      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setPassError(msg ?? "Failed to change password. Please try again.");
    } finally {
      setPassLoading(false);
    }
  };

  // ── Update Bank Account ───────────────────────────────────────────────────────
  const handleUpdateBankAccount = async () => {
    setBankError(null);
    setBankSuccess(null);

    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim() || !bankCode.trim()) {
      setBankError("All bank account fields are required.");
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      setBankError("Account number must be exactly 10 digits.");
      return;
    }

    setBankLoading(true);
    try {
      const res = await updateBankAccount({
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
        bankCode: bankCode.trim(),
      });
      setBankSuccess(res.message || "Bank account updated successfully!");
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      setBankError(msg ?? "Failed to update bank account. Please try again.");
    } finally {
      setBankLoading(false);
    }
  };

  // ── Loading skeleton while fetching profile ──────────────────────────────────
  if (profileFetching) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 items-center justify-center">
        <ActivityIndicator size="large" color="#2452FF" />
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">
          Loading profile…
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-white dark:bg-gray-900"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <HeroBanner />

      {/* ═══════════════════════════════════════════════════════════════════
          PERSONAL INFORMATION
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionTitle title="Personal Information" />
      <Divider title="Update Details" />

      {profileError && <ErrorBanner message={profileError} />}
      {profileSuccess && <SuccessBanner message={profileSuccess} />}

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
        keyboardType="email-address"
        returnKeyType="next"
        onSubmitEditing={() => phoneRef.current?.focus()}
        inputRef={emailRef}
      />

      <InputField
        label="Phone Number"
        placeholder="+234 800 000 0000"
        iconName="phone"
        value={phone}
        onChangeText={setPhone}
        isDark={isDark}
        keyboardType="phone-pad"
        returnKeyType="next"
        onSubmitEditing={() => classRef.current?.focus()}
        inputRef={phoneRef}
      />

      <InputField
        label="Class"
        placeholder="e.g. SS3"
        iconName="school"
        value={className}
        onChangeText={setClassName}
        isDark={isDark}
        returnKeyType="done"
        onSubmitEditing={handleSaveProfile}
        inputRef={classRef}
      />

      <PrimaryButton
        label="Save Profile"
        icon="save"
        onPress={handleSaveProfile}
        loading={profileLoading}
        variant="filled"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          SECURITY — CHANGE PASSWORD
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionTitle title="Security" />
      <Divider title="Change Password" />

      {passError && <ErrorBanner message={passError} />}
      {passSuccess && <SuccessBanner message={passSuccess} />}

      <InputField
        label="Current Password"
        placeholder="Enter current password"
        iconName="lock"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        isDark={isDark}
        secureTextEntry
        returnKeyType="next"
        onSubmitEditing={() => newPassRef.current?.focus()}
      />

      <InputField
        label="New Password"
        placeholder="Min. 8 characters"
        iconName="vpn-key"
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
        iconName="lock"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        isDark={isDark}
        secureTextEntry
        returnKeyType="done"
        onSubmitEditing={handleChangePassword}
        inputRef={confirmPassRef}
      />

      <PrimaryButton
        label="Update Password"
        icon="lock-reset"
        onPress={handleChangePassword}
        loading={passLoading}
        variant="outline"
      />

      {/* ═══════════════════════════════════════════════════════════════════
          Nigerian BANK ACCOUNT
      ═══════════════════════════════════════════════════════════════════ */}
      <SectionTitle title="Nigerian Bank Account" />
      <Divider title="Payment Details" />

      {bankError && <ErrorBanner message={bankError} />}
      {bankSuccess && <SuccessBanner message={bankSuccess} />}

      <InputField
        label="Account Name"
        placeholder="e.g. John Doe"
        iconName="person"
        value={accountName}
        onChangeText={setAccountName}
        isDark={isDark}
        returnKeyType="next"
        onSubmitEditing={() => accountNumberRef.current?.focus()}
      />

      <InputField
        label="Account Number"
        placeholder="10-digit account number"
        iconName="phone"
        value={accountNumber}
        onChangeText={setAccountNumber}
        isDark={isDark}
        keyboardType="phone-pad"
        returnKeyType="next"
        onSubmitEditing={() => bankNameRef.current?.focus()}
        inputRef={accountNumberRef}
      />

      <InputField
        label="Bank Name"
        placeholder="e.g. GTBank, Access Bank"
        iconName="school"
        value={bankName}
        onChangeText={setBankName}
        isDark={isDark}
        returnKeyType="next"
        onSubmitEditing={() => bankCodeRef.current?.focus()}
        inputRef={bankNameRef}
      />

      <InputField
        label="Bank Code"
        placeholder="e.g. 058 (GTBank)"
        iconName="phone"
        value={bankCode}
        onChangeText={setBankCode}
        isDark={isDark}
        keyboardType="phone-pad"
        returnKeyType="done"
        onSubmitEditing={handleUpdateBankAccount}
        inputRef={bankCodeRef}
      />

      <PrimaryButton
        label="Save Bank Details"
        icon="account-balance-wallet"
        onPress={handleUpdateBankAccount}
        loading={bankLoading}
        variant="filled"
      />

      <FooterHint />
    </ScrollView>
  );
}
