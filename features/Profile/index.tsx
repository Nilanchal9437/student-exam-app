import { Ionicons, MaterialIcons } from "@expo/vector-icons";
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

type ProfilePayload = {
  email: string;
  phone: string;
  className: string;
};

type PasswordPayload = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

function useThemeColors(isDark: boolean) {
  return {
    iconMuted: isDark ? "#6B7280" : "#6B7280",
    iconEye: isDark ? "#6B7280" : "#9CA3AF",
    placeholder: isDark ? "#6B7280" : "#9CA3AF",
  } as const;
}

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

function InputField({
  label,
  placeholder,
  iconName,
  value,
  onChangeText,
  isDark,
  secureTextEntry = false,
  keyboardType = "default",
}: {
  label: string;
  placeholder: string;
  iconName:
    | "email"
    | "phone"
    | "school"
    | "lock"
    | "vpn-key";
  value: string;
  onChangeText: (text: string) => void;
  isDark: boolean;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "phone-pad";
}) {
  const colors = useThemeColors(isDark);
  const [showValue, setShowValue] = useState(false);

  return (
    <View className="px-4 mt-4">
      <Text className="text-gray-800 dark:text-gray-200 font-semibold text-sm mb-2">
        {label}
      </Text>
      <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 border border-gray-200 dark:border-gray-700">
        <View className="mr-3 opacity-60">
          <MaterialIcons name={iconName} size={18} color={colors.iconMuted} />
        </View>
        <TextInput
          className="flex-1 text-gray-800 dark:text-gray-100 text-sm py-4"
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !showValue}
          autoCapitalize={keyboardType === "default" ? "sentences" : "none"}
          autoCorrect={false}
          keyboardType={keyboardType}
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

function SaveProfileCTA({ onPress }: { onPress: () => void }) {
  return (
    <View className="px-4 mt-5">
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="bg-brand-blue flex-row items-center justify-center gap-2 py-4 rounded-2xl"
        style={{
          shadowColor: "#2452FF",
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.35,
          shadowRadius: 12,
          elevation: 8,
        }}
      >
        <MaterialIcons name="save" size={18} color="white" />
        <Text className="text-white font-bold text-base">Save Profile</Text>
      </TouchableOpacity>
    </View>
  );
}

function ChangePasswordCTA({ onPress }: { onPress: () => void }) {
  return (
    <View className="px-4 mt-4">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="border-2 border-brand-blue dark:border-brand-blue flex-row items-center justify-center gap-2 py-4 rounded-2xl"
      >
        <MaterialIcons name="lock-reset" size={18} color="#2452FF" />
        <Text className="text-brand-blue font-bold text-base">
          Update Password
        </Text>
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
        Keep your profile details up to date so you can receive exam alerts and
        important class notifications.
      </Text>
    </View>
  );
}

export default function ProfileScreen({
  onSaveProfile,
  onChangePassword,
}: {
  onSaveProfile?: (payload: ProfilePayload) => void;
  onChangePassword?: (payload: PasswordPayload) => void;
}) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [className, setClassName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSaveProfile = () => {
    onSaveProfile?.({ email, phone, className });
  };

  const handleChangePassword = () => {
    onChangePassword?.({ currentPassword, newPassword, confirmPassword });
  };

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
          <View style={{ flex: 1 }}>
            <HeroBanner />

            <SectionTitle title="Personal Information" />
            <Divider title="Update Details" />

            <InputField
              label="Email Address"
              placeholder="name@example.com"
              iconName="email"
              value={email}
              onChangeText={setEmail}
              isDark={isDark}
              keyboardType="email-address"
            />

            <InputField
              label="Phone Number"
              placeholder="+91 98765 43210"
              iconName="phone"
              value={phone}
              onChangeText={setPhone}
              isDark={isDark}
              keyboardType="phone-pad"
            />

            <InputField
              label="Class"
              placeholder="e.g. Class 10"
              iconName="school"
              value={className}
              onChangeText={setClassName}
              isDark={isDark}
            />

            <SaveProfileCTA onPress={handleSaveProfile} />

            <SectionTitle title="Security" />
            <Divider title="Change Password" />

            <InputField
              label="Current Password"
              placeholder="Enter current password"
              iconName="lock"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              isDark={isDark}
              secureTextEntry
            />

            <InputField
              label="New Password"
              placeholder="Min. 8 characters"
              iconName="vpn-key"
              value={newPassword}
              onChangeText={setNewPassword}
              isDark={isDark}
              secureTextEntry
            />

            <InputField
              label="Confirm New Password"
              placeholder="Re-enter new password"
              iconName="lock"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              isDark={isDark}
              secureTextEntry
            />

            <ChangePasswordCTA onPress={handleChangePassword} />
          </View>

          <FooterHint />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
