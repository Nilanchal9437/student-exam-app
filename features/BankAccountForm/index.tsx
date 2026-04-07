/**
 * features/BankAccountForm/index.tsx
 *
 * Reusable Nigerian bank account form component.
 * Can be used in Profile screen or standalone payment/payout flows.
 */

import { MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  getBankAccount,
  updateBankAccount,
  type BankAccount,
} from "../../lib/bankAccountService";

// ─── Input Field ──────────────────────────────────────────────────────────
function BankInputField({
  label,
  placeholder,
  iconName,
  value,
  onChangeText,
  isDark,
  keyboardType = "default",
  returnKeyType = "next",
  onSubmitEditing,
  inputRef,
}: {
  label: string;
  placeholder: string;
  iconName: "person" | "phone" | "school" | "account-balance";
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  keyboardType?: "default" | "phone-pad";
  returnKeyType?: "next" | "done";
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}) {
  const colors = {
    iconMuted: isDark ? "#6B7280" : "#6B7280",
    placeholder: isDark ? "#6B7280" : "#9CA3AF",
  };

  return (
    <View className="px-4 mt-4">
      <Text className="text-gray-800 dark:text-gray-200 font-semibold text-sm mb-2">
        {label}
      </Text>
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 border border-gray-200 dark:border-gray-700">
        <View className="mr-3 opacity-60">
          <MaterialIcons name={iconName as any} size={18} color={colors.iconMuted} />
        </View>
        <TextInput
          ref={inputRef}
          className="flex-1 text-gray-800 dark:text-gray-100 text-sm py-4"
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          autoCapitalize="words"
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={returnKeyType === "done"}
        />
      </View>
    </View>
  );
}

// ─── Error/Success Banners ────────────────────────────────────────────────
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
      <MaterialIcons
        name="check-circle-outline"
        size={16}
        color="#22C55E"
        style={{ marginTop: 1 }}
      />
      <Text className="flex-1 text-green-600 dark:text-green-400 text-sm font-medium leading-5">
        {message}
      </Text>
    </View>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────
function PrimaryButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading: boolean;
}) {
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        disabled={loading}
        className="flex-row items-center justify-center gap-2 py-4 rounded-2xl border-2 bg-brand-blue border-brand-blue"
        style={{
          shadowColor: "#2452FF",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 8,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <ActivityIndicator color="white" size="small" />
        ) : (
          <>
            <MaterialIcons name="account-balance-wallet" size={18} color="white" />
            <Text className="font-bold text-base text-white">{label}</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

// ─── Bank Account Form Component ──────────────────────────────────────────
interface BankAccountFormProps {
  isDark: boolean;
  onSuccess?: () => void;
  onError?: (error: string) => void;
  autoLoad?: boolean;
}

export default function BankAccountForm({
  isDark,
  onSuccess,
  onError,
  autoLoad = true,
}: BankAccountFormProps) {
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const accountNumberRef = React.useRef<TextInput>(null);
  const bankNameRef = React.useRef<TextInput>(null);
  const bankCodeRef = React.useRef<TextInput>(null);

  // Load existing bank account on mount
  useEffect(() => {
    if (!autoLoad) {
      setFetching(false);
      return;
    }

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
      } finally {
        setFetching(false);
      }
    })();
  }, [autoLoad]);

  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);

    if (!accountName.trim() || !accountNumber.trim() || !bankName.trim() || !bankCode.trim()) {
      const msg = "All bank account fields are required.";
      setError(msg);
      onError?.(msg);
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      const msg = "Account number must be exactly 10 digits.";
      setError(msg);
      onError?.(msg);
      return;
    }

    setLoading(true);
    try {
      const res = await updateBankAccount({
        accountName: accountName.trim(),
        accountNumber: accountNumber.trim(),
        bankName: bankName.trim(),
        bankCode: bankCode.trim(),
      });
      const successMsg = res.message || "Bank account updated successfully!";
      setSuccess(successMsg);
      onSuccess?.();
    } catch (err: unknown) {
      const msg =
        err &&
        typeof err === "object" &&
        "response" in err
          ? (err as { response?: { data?: { message?: string } } }).response?.data
              ?.message
          : undefined;
      const errorMsg = msg ?? "Failed to update bank account. Please try again.";
      setError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <View className="px-4 py-8 justify-center items-center">
        <ActivityIndicator size="large" color="#2452FF" />
        <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">
          Loading bank details…
        </Text>
      </View>
    );
  }

  return (
    <View>
      {error && <ErrorBanner message={error} />}
      {success && <SuccessBanner message={success} />}

      <BankInputField
        label="Account Name"
        placeholder="e.g. John Doe"
        iconName="person"
        value={accountName}
        onChangeText={setAccountName}
        isDark={isDark}
        returnKeyType="next"
        onSubmitEditing={() => accountNumberRef.current?.focus()}
      />

      <BankInputField
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

      <BankInputField
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

      <BankInputField
        label="Bank Code"
        placeholder="e.g. 058 (GTBank)"
        iconName="phone"
        value={bankCode}
        onChangeText={setBankCode}
        isDark={isDark}
        keyboardType="phone-pad"
        returnKeyType="done"
        onSubmitEditing={handleSubmit}
        inputRef={bankCodeRef}
      />

      <PrimaryButton label="Save Bank Details" onPress={handleSubmit} loading={loading} />
    </View>
  );
}
