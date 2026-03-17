import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

// ─── Types ────────────────────────────────────────────────────────────────────
export type ChatMessage = {
  id: string;
  senderId: string;
  senderName: string;
  senderInitials: string;
  senderColor: string;
  text: string;
  timestamp: string; // display string e.g. "2:45 PM"
  isMe: boolean;
  reactions?: { emoji: string; count: number }[];
};

export type GroupMeta = {
  id: string;
  name: string;
  iconName: string;
  iconBg: string;
  iconColor: string;
  memberCount: number;
  online: number;
  description: string;
};

// ─── Group Metadata ────────────────────────────────────────────────────────────
// Replace with API call: GET /groups/:id
export const GROUP_META: Record<string, GroupMeta> = {
  g1: {
    id: "g1",
    name: "Senior Secondary 3",
    iconName: "school",
    iconBg: "#EEF1FF",
    iconColor: "#2452FF",
    memberCount: 84,
    online: 12,
    description: "Study group for SS3 students across Nigeria.",
  },
  g2: {
    id: "g2",
    name: "Science Students",
    iconName: "flask",
    iconBg: "#F3E8FF",
    iconColor: "#8B5CF6",
    memberCount: 120,
    online: 29,
    description: "Physics, Chemistry & Biology discussions.",
  },
  g3: {
    id: "g3",
    name: "Arts & Humanities",
    iconName: "palette",
    iconBg: "#FFF3E0",
    iconColor: "#F97316",
    memberCount: 56,
    online: 7,
    description: "Literature, History & Social studies hub.",
  },
  g4: {
    id: "g4",
    name: "Mathematics Club",
    iconName: "calculator",
    iconBg: "#ECFDF5",
    iconColor: "#10B981",
    memberCount: 63,
    online: 15,
    description: "Advanced maths tricks and problem solving.",
  },
};

// ─── Dummy Messages Per Group ──────────────────────────────────────────────────
// Replace with API call: GET /groups/:id/messages
const DUMMY_MESSAGES: Record<string, ChatMessage[]> = {
  g1: [
    { id: "m1",  senderId: "u2", senderName: "Tunde",  senderInitials: "TA", senderColor: "#2452FF",  text: "Good morning everyone! 👋",                                         timestamp: "9:00 AM",  isMe: false },
    { id: "m2",  senderId: "u3", senderName: "Chioma", senderInitials: "CA", senderColor: "#8B5CF6",  text: "Morning Tunde! Ready for the exam prep today?",                    timestamp: "9:02 AM",  isMe: false },
    { id: "m3",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "Morning all! Yes, let's go 💪",                                    timestamp: "9:04 AM",  isMe: true  },
    { id: "m4",  senderId: "u2", senderName: "Tunde",  senderInitials: "TA", senderColor: "#2452FF",  text: "Does anyone have the Math past questions for 2023?",               timestamp: "9:10 AM",  isMe: false, reactions: [{ emoji: "🙋", count: 3 }] },
    { id: "m5",  senderId: "u4", senderName: "Fatima", senderInitials: "FB", senderColor: "#14B8A6",  text: "I have them! I'll share the PDF link shortly 📎",                  timestamp: "9:12 AM",  isMe: false },
    { id: "m6",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "Thank you Fatima, you're a lifesaver! 🙌",                         timestamp: "9:13 AM",  isMe: true  },
    { id: "m7",  senderId: "u3", senderName: "Chioma", senderInitials: "CA", senderColor: "#8B5CF6",  text: "Can we also go over the English comprehension section today?",      timestamp: "9:15 AM",  isMe: false },
    { id: "m8",  senderId: "u5", senderName: "Ibrahim",senderInitials: "IY", senderColor: "#F43F5E",  text: "Sure! I can take the lead on that section at 3 PM.",               timestamp: "9:18 AM",  isMe: false, reactions: [{ emoji: "👍", count: 5 }] },
    { id: "m9",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "3 PM works for me 🕒",                                             timestamp: "9:20 AM",  isMe: true  },
    { id: "m10", senderId: "u4", senderName: "Fatima", senderInitials: "FB", senderColor: "#14B8A6",  text: "Here is the 2023 Math past questions: bit.ly/math2023 ✅",         timestamp: "9:25 AM",  isMe: false, reactions: [{ emoji: "❤️", count: 7 }, { emoji: "🔥", count: 4 }] },
    { id: "m11", senderId: "u2", senderName: "Tunde",  senderInitials: "TA", senderColor: "#2452FF",  text: "Amazing, see you all at 3!",                                       timestamp: "2:40 PM",  isMe: false },
    { id: "m12", senderId: "u2", senderName: "Tunde",  senderInitials: "TA", senderColor: "#2452FF",  text: "Does anyone have the Math past questions for 2023?",               timestamp: "2:45 PM",  isMe: false },
  ],
  g2: [
    { id: "m1",  senderId: "u6", senderName: "Amaka",  senderInitials: "AO", senderColor: "#10B981",  text: "Has anyone started the Physics lab report yet?",                   timestamp: "10:00 AM", isMe: false },
    { id: "m2",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "Just started mine this morning!",                                  timestamp: "10:05 AM", isMe: true  },
    { id: "m3",  senderId: "u3", senderName: "Chioma", senderInitials: "CA", senderColor: "#8B5CF6",  text: "What's the format? APA or school format?",                         timestamp: "10:07 AM", isMe: false },
    { id: "m4",  senderId: "u6", senderName: "Amaka",  senderInitials: "AO", senderColor: "#10B981",  text: "School format. Check the PDF Mr. Chuka shared last week.",         timestamp: "10:09 AM", isMe: false, reactions: [{ emoji: "👍", count: 6 }] },
    { id: "m5",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "Oh I missed that, can someone resend?",                            timestamp: "10:12 AM", isMe: true  },
    { id: "m6",  senderId: "u5", senderName: "Ibrahim",senderInitials: "IY", senderColor: "#F43F5E",  text: "I'll send it. One sec 🔄",                                         timestamp: "10:13 AM", isMe: false },
    { id: "m7",  senderId: "u6", senderName: "Amaka",  senderInitials: "AO", senderColor: "#10B981",  text: "The Physics lab report is due tomorrow, has everyone submitted?",  timestamp: "11:20 AM", isMe: false, reactions: [{ emoji: "😅", count: 9 }] },
    { id: "m8",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "Almost done! Submitting by 8 PM 😅",                               timestamp: "11:22 AM", isMe: true  },
  ],
  g3: [
    { id: "m1",  senderId: "u7", senderName: "John",   senderInitials: "JO", senderColor: "#F97316",  text: "Has anyone read 'Things Fall Apart' by Achebe?",                  timestamp: "8:00 AM",  isMe: false },
    { id: "m2",  senderId: "u3", senderName: "Chioma", senderInitials: "CA", senderColor: "#8B5CF6",  text: "Yes! It's such a masterpiece 📚",                                  timestamp: "8:05 AM",  isMe: false },
    { id: "m3",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "One of my favorites. The themes of colonialism are so vivid.",     timestamp: "8:08 AM",  isMe: true  },
    { id: "m4",  senderId: "u7", senderName: "John",   senderInitials: "JO", senderColor: "#F97316",  text: "Great discussion on African literature yesterday everyone!",        timestamp: "Yesterday",isMe: false, reactions: [{ emoji: "🎉", count: 8 }] },
    { id: "m5",  senderId: "u3", senderName: "Chioma", senderInitials: "CA", senderColor: "#8B5CF6",  text: "Let's do this again next week! Maybe cover Ngugi wa Thiong'o?",   timestamp: "Yesterday",isMe: false },
    { id: "m6",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "I'm in! 🙌",                                                       timestamp: "Yesterday",isMe: true  },
  ],
  g4: [
    { id: "m1",  senderId: "u4", senderName: "Fatima", senderInitials: "FB", senderColor: "#14B8A6",  text: "Who can solve ∫x²sin(x)dx quickly? 🧮",                           timestamp: "Mon",      isMe: false },
    { id: "m2",  senderId: "u5", senderName: "Ibrahim",senderInitials: "IY", senderColor: "#F43F5E",  text: "Integration by parts twice! u=x², dv=sin(x)dx",                  timestamp: "Mon",      isMe: false, reactions: [{ emoji: "🔥", count: 3 }] },
    { id: "m3",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "= -x²cos(x) + 2xsin(x) + 2cos(x) + C",                           timestamp: "Mon",      isMe: true  },
    { id: "m4",  senderId: "u4", senderName: "Fatima", senderInitials: "FB", senderColor: "#14B8A6",  text: "✅ Correct! Check out this integration trick I found online 🔥",  timestamp: "Mon",      isMe: false, reactions: [{ emoji: "🧠", count: 5 }, { emoji: "👏", count: 4 }] },
    { id: "m5",  senderId: "u2", senderName: "Tunde",  senderInitials: "TA", senderColor: "#2452FF",  text: "This group is too smart for me 😂",                               timestamp: "Mon",      isMe: false, reactions: [{ emoji: "😂", count: 12 }] },
    { id: "m6",  senderId: "me", senderName: "You",    senderInitials: "BO", senderColor: "#F97316",  text: "Haha don't say that! Practice makes perfect 💪",                  timestamp: "Mon",      isMe: true  },
  ],
};

function getMessages(groupId: string): ChatMessage[] {
  return DUMMY_MESSAGES[groupId] ?? [];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
let MSG_UID = 1000;
const msgUid = () => `msg_${++MSG_UID}`;

// ─── Avatar Component ─────────────────────────────────────────────────────────
function MiniAvatar({ initials, color }: { initials: string; color: string }) {
  return (
    <View
      className="w-8 h-8 rounded-full items-center justify-center"
      style={{ backgroundColor: color + "22" }}
    >
      <Text style={{ fontSize: 11, fontWeight: "800", color }}>{initials}</Text>
    </View>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({
  msg,
  showAvatar,
  isDark,
}: {
  msg: ChatMessage;
  showAvatar: boolean;
  isDark: boolean;
}) {
  if (msg.isMe) {
    return (
      <View className="flex-row justify-end mb-1 px-4">
        <View className="max-w-[78%]">
          <View
            className="rounded-t-2xl rounded-bl-2xl rounded-br-sm px-4 py-2.5"
            style={{ backgroundColor: "#2452FF" }}
          >
            <Text className="text-white text-sm leading-5">{msg.text}</Text>
          </View>
          <View className="flex-row items-center justify-end mt-0.5 gap-1">
            <Text className="text-[10px] text-gray-400 dark:text-gray-500">{msg.timestamp}</Text>
            <Ionicons name="checkmark-done" size={12} color="#2452FF" />
          </View>
          {/* Reactions */}
          {msg.reactions && (
            <View className="flex-row justify-end gap-1 mt-0.5">
              {msg.reactions.map((r) => (
                <View key={r.emoji} className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 gap-1"
                  style={{ borderWidth: 1, borderColor: "#E5E7EB" }}>
                  <Text style={{ fontSize: 11 }}>{r.emoji}</Text>
                  <Text className="text-[10px] text-gray-500 font-semibold">{r.count}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    );
  }

  return (
    <View className="flex-row mb-1 px-4 gap-2">
      {/* Avatar placeholder to align bubbles */}
      <View className="w-8">
        {showAvatar ? (
          <MiniAvatar initials={msg.senderInitials} color={msg.senderColor} />
        ) : null}
      </View>

      <View className="max-w-[78%]">
        {showAvatar && (
          <Text className="text-xs font-bold mb-0.5" style={{ color: msg.senderColor }}>
            {msg.senderName}
          </Text>
        )}
        <View
          className="rounded-t-2xl rounded-br-2xl rounded-bl-sm px-4 py-2.5"
          style={{
            backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
            shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.05, shadowRadius: 3, elevation: 1,
          }}
        >
          <Text className="text-gray-800 dark:text-gray-100 text-sm leading-5">{msg.text}</Text>
        </View>
        <Text className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">{msg.timestamp}</Text>
        {/* Reactions */}
        {msg.reactions && (
          <View className="flex-row gap-1 mt-0.5">
            {msg.reactions.map((r) => (
              <View key={r.emoji} className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 gap-1"
                style={{ borderWidth: 1, borderColor: isDark ? "#374151" : "#E5E7EB" }}>
                <Text style={{ fontSize: 11 }}>{r.emoji}</Text>
                <Text className="text-[10px] text-gray-500 font-semibold">{r.count}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

// ─── Date Separator ───────────────────────────────────────────────────────────
function DateSep({ label }: { label: string }) {
  return (
    <View className="flex-row items-center mx-6 my-3 gap-3">
      <View className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-700" />
      <Text className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold px-2">{label}</Text>
      <View className="flex-1 h-[1px] bg-gray-100 dark:bg-gray-700" />
    </View>
  );
}

// ─── Community Chat Screen ────────────────────────────────────────────────────
export default function CommunityChatScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const { groupId, groupName } = useLocalSearchParams<{
    groupId: string;
    groupName: string;
  }>();

  const meta = GROUP_META[groupId ?? ""] ?? null;
  const [messages, setMessages] = useState<ChatMessage[]>(() => getMessages(groupId ?? ""));
  const [inputText, setInputText] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const listRef = useRef<FlatList>(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, [messages]);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    const newMsg: ChatMessage = {
      id: msgUid(),
      senderId: "me",
      senderName: "You",
      senderInitials: "BO",
      senderColor: "#F97316",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };
    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  }, [inputText]);

  // Collect date separators
  type ListItem =
    | { type: "date"; label: string; key: string }
    | { type: "msg"; msg: ChatMessage; showAvatar: boolean; key: string };

  const listItems: ListItem[] = [];
  let lastDate = "";
  messages.forEach((msg, i) => {
    const date = msg.timestamp.includes("AM") || msg.timestamp.includes("PM") ? "Today" : msg.timestamp;
    if (date !== lastDate) {
      listItems.push({ type: "date", label: date, key: `d_${i}` });
      lastDate = date;
    }
    const showAvatar = !msg.isMe && (i === 0 || messages[i - 1].senderId !== msg.senderId);
    listItems.push({ type: "msg", msg, showAvatar, key: msg.id });
  });

  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.type === "date") return <DateSep label={item.label} />;
    return <MessageBubble msg={item.msg} showAvatar={item.showAvatar} isDark={isDark} />;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      {/* ── Header ── */}
      <View
        className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 3 }}
      >
        <View className="flex-row items-center px-4 py-3 gap-3">
          {/* Back */}
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color={isDark ? "#F9FAFB" : "#111827"} />
          </TouchableOpacity>

          {/* Group icon */}
          <TouchableOpacity onPress={() => setShowInfo(v => !v)} activeOpacity={0.8}>
            <View
              className="w-10 h-10 rounded-2xl items-center justify-center"
              style={{ backgroundColor: meta?.iconBg ?? "#EEF1FF" }}
            >
              <MaterialCommunityIcons
                name={(meta?.iconName ?? "account-group") as any}
                size={22}
                color={meta?.iconColor ?? "#2452FF"}
              />
            </View>
          </TouchableOpacity>

          {/* Group info */}
          <TouchableOpacity className="flex-1" onPress={() => setShowInfo(v => !v)} activeOpacity={0.8}>
            <Text className="text-sm font-extrabold text-gray-900 dark:text-white" numberOfLines={1}>
              {meta?.name ?? groupName ?? "Group Chat"}
            </Text>
            <Text className="text-[11px] text-green-500 font-semibold">
              {meta ? `${meta.online} online · ${meta.memberCount} members` : "Group"}
            </Text>
          </TouchableOpacity>

          {/* Actions */}
          <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
            <Ionicons name="search-outline" size={18} color={isDark ? "#9CA3AF" : "#374151"} />
          </TouchableOpacity>
          <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center">
            <Ionicons name="ellipsis-vertical" size={18} color={isDark ? "#9CA3AF" : "#374151"} />
          </TouchableOpacity>
        </View>

        {/* Group info panel (expandable) */}
        {showInfo && meta && (
          <View className="mx-4 mb-3 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3">
            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium leading-4">
              {meta.description}
            </Text>
          </View>
        )}
      </View>

      {/* ── Messages ── */}
      <FlatList
        ref={listRef}
        data={listItems}
        keyExtractor={(item) => item.key}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingTop: 12, paddingBottom: 12 }}
        onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
        className="flex-1"
      />

      {/* ── Input Bar ── */}
      <View
        className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-3 py-2.5 flex-row items-end gap-2"
        style={{ shadowColor: "#000", shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.04, shadowRadius: 6, elevation: 5 }}
      >
        {/* Attachment */}
        <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-0.5">
          <Ionicons name="add" size={20} color={isDark ? "#9CA3AF" : "#374151"} />
        </TouchableOpacity>

        {/* Text input */}
        <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 min-h-[42px] justify-center">
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            multiline
            maxLength={500}
            className="text-sm text-gray-900 dark:text-white p-0 max-h-24"
            onSubmitEditing={sendMessage}
          />
        </View>

        {/* Emoji */}
        <TouchableOpacity className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-0.5">
          <Ionicons name="happy-outline" size={20} color={isDark ? "#9CA3AF" : "#374151"} />
        </TouchableOpacity>

        {/* Send */}
        <TouchableOpacity
          onPress={sendMessage}
          activeOpacity={0.85}
          className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
          style={{
            backgroundColor: inputText.trim() ? "#2452FF" : "#E5E7EB",
            shadowColor: "#2452FF", shadowOffset: { width: 0, height: 4 },
            shadowOpacity: inputText.trim() ? 0.3 : 0, shadowRadius: 8, elevation: inputText.trim() ? 4 : 0,
          }}
        >
          <Ionicons
            name="send"
            size={17}
            color={inputText.trim() ? "#fff" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
