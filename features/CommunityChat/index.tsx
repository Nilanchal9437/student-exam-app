/**
 * features/CommunityChat/index.tsx
 *
 * Real-time community group chat.
 * - Loads message history via REST: GET /api/communities/:id/messages
 * - Connects to Socket.IO with the stored JWT for live updates
 * - Emits: join_community, send_message, react_message, typing, stop_typing
 * - Listens: new_message, message_deleted, reaction_updated, user_typing,
 *            user_stop_typing, error
 * - Reply (thread) UI: tap any message to quote-reply it
 */

import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import type { Socket } from "socket.io-client";
import { useAuth } from "../../context/AuthContext";
import { CommunityMessage, fetchMessages } from "../../lib/communityService";
import { getSocket } from "../../lib/socketService";

// --- Helpers -----------------------------------------------------------------
function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "#2452FF",
  "#8B5CF6",
  "#10B981",
  "#F97316",
  "#EF4444",
  "#14B8A6",
  "#F59E0B",
  "#6366F1",
];
function avatarColor(str: string): string {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length];
}

/** Extract sender _id as a plain string regardless of ObjectId vs string shape */
function extractSenderId(sender: CommunityMessage["sender"]): string {
  if (sender == null) return "";
  if (typeof sender === "object") {
    const raw = (sender as { _id: unknown })._id;
    return raw != null ? String(raw) : "";
  }
  return String(sender);
}

/** Extract sender display name */
function extractSenderName(msg: CommunityMessage): string {
  return msg.sender.fullName;
}

// --- Mini Avatar -------------------------------------------------------------
function MiniAvatar({ name, size = 34 }: { name: string; size?: number }) {
  const bg = avatarColor(name);
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg + "22",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: size * 0.32, fontWeight: "800", color: bg }}>
        {initials(name)}
      </Text>
    </View>
  );
}

// --- Date separator ----------------------------------------------------------
function DateSep({ label }: { label: string }) {
  return (
    <View className="flex-row items-center mx-5 my-3 gap-3">
      <View className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
      <Text className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold">
        {label}
      </Text>
      <View className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
    </View>
  );
}

// --- Reply Preview (inside bubble) -------------------------------------------
function ReplyPreview({
  senderName,
  textPreview,
  isDark,
}: {
  senderName: string;
  textPreview: string;
  isDark: boolean;
}) {
  const color = avatarColor(senderName);
  return (
    <View
      className="flex-row rounded-xl px-3 py-2 mb-2 gap-2"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
        borderLeftWidth: 3,
        borderLeftColor: color,
      }}
    >
      <View className="flex-1">
        <Text className="text-[10px] font-bold mb-0.5" style={{ color }}>
          {senderName}
        </Text>
        <Text
          className="text-xs text-gray-500 dark:text-gray-400"
          numberOfLines={2}
        >
          {textPreview || "Original message"}
        </Text>
      </View>
    </View>
  );
}

// --- Message Bubble ----------------------------------------------------------
function MessageBubble({
  msg,
  isMe,
  showAvatar,
  isDark,
  onReply,
  onReact,
}: {
  msg: CommunityMessage;
  isMe: boolean;
  showAvatar: boolean;
  isDark: boolean;
  onReply: (msg: CommunityMessage) => void;
  onReact: (msgId: string, emoji: string) => void;
}) {
  const senderName = extractSenderName(msg);
  const color = avatarColor(senderName);
  const hasReply = msg.replyTo?.messageId && msg.replyTo?.textPreview;
  const reactions = msg.reactions ?? {};
  const reactionEntries = Object.entries(reactions).filter(
    ([, users]) => users.length > 0,
  );

  if (isMe) {
    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onLongPress={() => onReply(msg)}
        className="flex-row justify-end mb-1 px-3"
      >
        <View className="max-w-[80%]">
          {hasReply && (
            <ReplyPreview
              senderName={msg.replyTo.senderName}
              textPreview={msg.replyTo.textPreview}
              isDark={isDark}
            />
          )}
          {msg.isDeleted ? (
            <View
              className="rounded-2xl px-4 py-2.5"
              style={{ backgroundColor: isDark ? "#374151" : "#E5E7EB" }}
            >
              <Text className="text-gray-400 dark:text-gray-500 text-sm italic">
                This message was deleted.
              </Text>
            </View>
          ) : (
            <View
              className="rounded-t-2xl rounded-bl-2xl rounded-br-sm px-4 py-2.5"
              style={{ backgroundColor: "#2452FF" }}
            >
              <Text className="text-white text-sm leading-5">{msg.text}</Text>
            </View>
          )}
          <View className="flex-row items-center justify-end mt-0.5 gap-1">
            <Text className="text-[10px] text-gray-400 dark:text-gray-500">
              {formatTime(msg.createdAt)}
            </Text>
            <Ionicons name="checkmark-done" size={12} color="#2452FF" />
          </View>
          {reactionEntries.length > 0 && (
            <View className="flex-row justify-end gap-1 mt-0.5 flex-wrap">
              {reactionEntries.map(([emoji, users]) => (
                <TouchableOpacity
                  key={emoji}
                  onPress={() => onReact(msg._id, emoji)}
                  className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 gap-0.5"
                  style={{
                    borderWidth: 1,
                    borderColor: isDark ? "#374151" : "#E5E7EB",
                  }}
                >
                  <Text style={{ fontSize: 11 }}>{emoji}</Text>
                  <Text className="text-[10px] text-gray-500 font-semibold">
                    {users.length}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity
            onPress={() => onReply(msg)}
            className="flex-row items-center justify-end gap-1 mt-0.5"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons
              name="return-down-back-outline"
              size={12}
              color="#9CA3AF"
            />
            <Text className="text-[10px] text-gray-400 dark:text-gray-500">
              Reply
            </Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  }

  // Other user bubble
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={() => onReply(msg)}
      className="flex-row mb-1 px-3 gap-2"
    >
      <View className="w-9 items-end">
        {showAvatar ? <MiniAvatar name={senderName} size={34} /> : null}
      </View>
      <View className="max-w-[80%]">
        {showAvatar && (
          <Text className="text-[11px] font-bold mb-0.5" style={{ color }}>
            {senderName}
          </Text>
        )}
        {hasReply && (
          <ReplyPreview
            senderName={msg.replyTo.senderName}
            textPreview={msg.replyTo.textPreview}
            isDark={isDark}
          />
        )}
        {msg.isDeleted ? (
          <View
            className="rounded-2xl px-4 py-2.5"
            style={{ backgroundColor: isDark ? "#374151" : "#E5E7EB" }}
          >
            <Text className="text-gray-400 dark:text-gray-500 text-sm italic">
              This message was deleted.
            </Text>
          </View>
        ) : (
          <View
            className="rounded-t-2xl rounded-br-2xl rounded-bl-sm px-4 py-2.5"
            style={{
              backgroundColor: isDark ? "#1F2937" : "#FFFFFF",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 1 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 1,
            }}
          >
            <Text className="text-gray-800 dark:text-gray-100 text-sm leading-5">
              {msg.text}
            </Text>
          </View>
        )}
        <Text className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
          {formatTime(msg.createdAt)}
        </Text>
        {reactionEntries.length > 0 && (
          <View className="flex-row gap-1 mt-0.5 flex-wrap">
            {reactionEntries.map(([emoji, users]) => (
              <TouchableOpacity
                key={emoji}
                onPress={() => onReact(msg._id, emoji)}
                className="flex-row items-center bg-white dark:bg-gray-800 rounded-full px-2 py-0.5 gap-0.5"
                style={{
                  borderWidth: 1,
                  borderColor: isDark ? "#374151" : "#E5E7EB",
                }}
              >
                <Text style={{ fontSize: 11 }}>{emoji}</Text>
                <Text className="text-[10px] text-gray-500 font-semibold">
                  {users.length}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        <TouchableOpacity
          onPress={() => onReply(msg)}
          className="flex-row items-center gap-1 mt-0.5"
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="return-down-back-outline" size={12} color="#9CA3AF" />
          <Text className="text-[10px] text-gray-400 dark:text-gray-500">
            Reply
          </Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// --- Typing Indicator --------------------------------------------------------
function TypingIndicator({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const label =
    names.length === 1
      ? `${names[0]} is typing...`
      : `${names.slice(0, 2).join(", ")} are typing...`;
  return (
    <View className="px-5 pb-1">
      <Text className="text-xs text-gray-400 dark:text-gray-500 italic">
        {label}
      </Text>
    </View>
  );
}

// --- Emoji Quick-React Bar ---------------------------------------------------
const QUICK_EMOJIS = ["👍", "❤️", "😂", "🔥", "👏", "😮", "🙏", "💯"];

// --- Main Screen -------------------------------------------------------------
export default function CommunityChatScreen() {
  const router = useRouter();
  const isDark = useColorScheme() === "dark";
  const { user } = useAuth(); // logged-in user — drives isMe detection
  const params = useLocalSearchParams<{
    communityId?: string;
    communityName?: string;
    groupId?: string;
    groupName?: string;
  }>();

  const communityId = params.communityId ?? params.groupId ?? "";
  const communityName =
    params.communityName ?? params.groupName ?? "Group Chat";

  // State --------------------------------------------------------------------
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [inputText, setInputText] = useState("");
  const [replyTo, setReplyTo] = useState<CommunityMessage | null>(null);
  const [typingUsers, setTypingUsers] = useState<Record<string, string>>({});
  const [showEmojiBar, setShowEmojiBar] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const listRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load message history -----------------------------------------------------
  const loadHistory = useCallback(async () => {
    if (!communityId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetchMessages(communityId, 1, 50);
      setMessages(res.data.messages);
    } catch {
      setError("Failed to load messages. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [communityId]);

  // Connect to Socket.IO -----------------------------------------------------
  useEffect(() => {
    if (!communityId) return;
    let mounted = true;

    (async () => {
      try {
        const sock = await getSocket();
        if (!mounted) return;
        socketRef.current = sock;

        sock.on("connect", () => {
          if (!mounted) return;
          setConnected(true);
          sock.emit("join_community", { communityId });
        });

        sock.on("disconnect", () => {
          if (mounted) setConnected(false);
        });

        sock.on("new_message", (msg: CommunityMessage) => {
          if (!mounted) return;
          setMessages((prev) => {
            if (prev.some((m) => m._id === msg._id)) return prev;
            return [...prev, msg];
          });
          setTimeout(
            () => listRef.current?.scrollToEnd({ animated: true }),
            80,
          );
        });

        sock.on("message_deleted", ({ messageId }: { messageId: string }) => {
          if (!mounted) return;
          setMessages((prev) =>
            prev.map((m) =>
              m._id === messageId
                ? { ...m, isDeleted: true, text: "This message was deleted." }
                : m,
            ),
          );
        });

        sock.on(
          "reaction_updated",
          ({
            messageId,
            reactions,
          }: {
            messageId: string;
            reactions: Record<string, string[]>;
          }) => {
            if (!mounted) return;
            setMessages((prev) =>
              prev.map((m) => (m._id === messageId ? { ...m, reactions } : m)),
            );
          },
        );

        sock.on(
          "user_typing",
          ({ userId, userName }: { userId: string; userName: string }) => {
            if (!mounted) return;
            if (userId === user?._id) return; // don't show self typing
            setTypingUsers((p) => ({ ...p, [userId]: userName }));
          },
        );

        sock.on("user_stop_typing", ({ userId }: { userId: string }) => {
          if (!mounted) return;
          setTypingUsers((p) => {
            const n = { ...p };
            delete n[userId];
            return n;
          });
        });

        sock.on("error", ({ message }: { message: string }) => {
          Alert.alert("Chat Error", message);
        });

        if (sock.connected) {
          setConnected(true);
          sock.emit("join_community", { communityId });
        }
      } catch (err) {
        console.error("Socket connect error:", err);
      }
    })();

    return () => {
      mounted = false;
      const sock = socketRef.current;
      if (sock) {
        sock.emit("leave_community", { communityId });
        sock.off("connect");
        sock.off("disconnect");
        sock.off("new_message");
        sock.off("message_deleted");
        sock.off("reaction_updated");
        sock.off("user_typing");
        sock.off("user_stop_typing");
        sock.off("error");
      }
    };
  }, [communityId]);

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  // Scroll to bottom when messages load
  useEffect(() => {
    if (!loading && messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 150);
    }
  }, [loading]);

  // Send message (fire-and-forget) -------------------------------------------
  const handleSend = useCallback(() => {
    const text = inputText.trim();
    if (!text || !socketRef.current) return;
    socketRef.current.emit("send_message", {
      communityId,
      text,
      replyTo: replyTo ? { messageId: replyTo._id } : undefined,
    });
    setInputText("");
    setReplyTo(null);
    if (typingTimer.current) clearTimeout(typingTimer.current);
    socketRef.current?.emit("stop_typing", { communityId });
  }, [inputText, communityId, replyTo]);

  // Typing indicator emit ----------------------------------------------------
  const handleTyping = useCallback(
    (text: string) => {
      setInputText(text);
      if (!socketRef.current) return;
      socketRef.current.emit("typing", { communityId });
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => {
        socketRef.current?.emit("stop_typing", { communityId });
      }, 2000);
    },
    [communityId],
  );

  // React to message ---------------------------------------------------------
  const handleReact = useCallback(
    (msgId: string, emoji: string) => {
      socketRef.current?.emit("react_message", {
        communityId,
        messageId: msgId,
        emoji,
      });
      setShowEmojiBar(false);
    },
    [communityId],
  );

  // Build flat list with date separators -------------------------------------
  // isMe: uses user?._id directly (React state, always fresh on re-render).
  // extractSenderId() converts ObjectId/string to a plain string before comparing.
  type ListItem =
    | { type: "date"; label: string; key: string }
    | {
        type: "msg";
        msg: CommunityMessage;
        showAvatar: boolean;
        isMe: boolean;
        key: string;
      };

  const listItems = useMemo<ListItem[]>(() => {
    const myId = user?.id ? String(user.id) : "";

    const items: ListItem[] = [];
    let lastDate = "";

    messages.forEach((msg, i) => {
      const dateLabel = formatDateLabel(msg.createdAt);
      if (dateLabel !== lastDate) {
        items.push({ type: "date", label: dateLabel, key: `d_${msg._id}` });
        lastDate = dateLabel;
      }

      const senderId = extractSenderId(msg.sender);
      const senderName = extractSenderName(msg);

      const prevMsg = i > 0 ? messages[i - 1] : null;
      const prevSenderName = prevMsg ? extractSenderName(prevMsg) : "";

      // isMe: plain string === plain string comparison — always reliable
      const isMe = myId.length > 0 && senderId === myId;
      const showAvatar = !isMe && senderName !== prevSenderName;

      items.push({ type: "msg", msg, showAvatar, isMe, key: msg._id });
    });

    return items;
  }, [messages, user?._id]);

  const typingNames = Object.values(typingUsers);

  // Render -------------------------------------------------------------------
  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50 dark:bg-gray-900"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      {/* Header */}
      <View
        className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 3,
        }}
      >
        <View className="flex-row items-center px-4 py-3 gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
          >
            <Ionicons
              name="arrow-back"
              size={20}
              color={isDark ? "#F9FAFB" : "#111827"}
            />
          </TouchableOpacity>

          <View
            className="w-10 h-10 rounded-2xl items-center justify-center"
            style={{ backgroundColor: "#EEF1FF" }}
          >
            <MaterialCommunityIcons
              name="account-group"
              size={22}
              color="#2452FF"
            />
          </View>

          <View className="flex-1">
            <Text
              className="text-sm font-extrabold text-gray-900 dark:text-white"
              numberOfLines={1}
            >
              {communityName}
            </Text>
            <Text
              className={`text-[11px] font-semibold ${connected ? "text-green-500" : "text-gray-400 dark:text-gray-500"}`}
            >
              {connected ? "Live Connected" : "Connecting..."}
            </Text>
          </View>

          <TouchableOpacity
            className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center"
            onPress={loadHistory}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={isDark ? "#9CA3AF" : "#374151"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Body */}
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2452FF" />
          <Text className="text-gray-400 dark:text-gray-500 text-sm mt-3">
            Loading messages...
          </Text>
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={40} color="#9CA3AF" />
          <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-3">
            {error}
          </Text>
          <TouchableOpacity
            onPress={loadHistory}
            className="mt-4 px-6 py-2.5 rounded-2xl"
            style={{ backgroundColor: "#2452FF" }}
          >
            <Text className="text-white font-bold text-sm">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            ref={listRef}
            data={listItems}
            keyExtractor={(item) => item.key}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingTop: 12,
              paddingBottom: typingNames.length > 0 ? 4 : 12,
            }}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <MaterialCommunityIcons
                  name="chat-outline"
                  size={48}
                  color="#D1D5DB"
                />
                <Text className="text-gray-400 dark:text-gray-500 text-sm text-center mt-3 px-8">
                  No messages yet.{"\n"}Be the first to say hello!
                </Text>
              </View>
            }
            renderItem={({ item }) => {
              if (item.type === "date") return <DateSep label={item.label} />;
              return (
                <MessageBubble
                  msg={item.msg}
                  isMe={item.isMe}
                  showAvatar={item.showAvatar}
                  isDark={isDark}
                  onReply={setReplyTo}
                  onReact={handleReact}
                />
              );
            }}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            className="flex-1"
          />
          <TypingIndicator names={typingNames} />
        </>
      )}

      {/* Reply strip */}
      {replyTo && (
        <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-4 py-2 border-t border-gray-200 dark:border-gray-700 gap-3">
          <View
            className="flex-1 py-1 pl-2 border-l-2"
            style={{ borderLeftColor: "#2452FF" }}
          >
            <Text
              className="text-[11px] font-bold"
              style={{ color: "#2452FF" }}
            >
              Replying to {extractSenderName(replyTo)}
            </Text>
            <Text
              className="text-xs text-gray-500 dark:text-gray-400"
              numberOfLines={1}
            >
              {replyTo.text}
            </Text>
          </View>
          <TouchableOpacity onPress={() => setReplyTo(null)}>
            <Ionicons name="close" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Input Bar */}
      <View
        className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-3 py-2.5 flex-row items-end gap-2"
        style={{
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.04,
          shadowRadius: 4,
          elevation: 5,
        }}
      >
        <TouchableOpacity
          className="w-9 h-9 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-0.5"
          onPress={() => setShowEmojiBar((v) => !v)}
        >
          <Ionicons
            name="happy-outline"
            size={20}
            color={isDark ? "#9CA3AF" : "#374151"}
          />
        </TouchableOpacity>

        <View className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2.5 min-h-[42px] justify-center">
          <TextInput
            value={inputText}
            onChangeText={handleTyping}
            placeholder="Type a message..."
            placeholderTextColor={isDark ? "#6B7280" : "#9CA3AF"}
            multiline
            maxLength={2000}
            className="text-sm text-gray-900 dark:text-white p-0 max-h-28"
          />
        </View>

        <TouchableOpacity
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-full items-center justify-center mb-0.5"
          style={{
            backgroundColor: inputText.trim() ? "#2452FF" : "#E5E7EB",
            shadowColor: "#2452FF",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: inputText.trim() ? 0.3 : 0,
            shadowRadius: 8,
            elevation: inputText.trim() ? 4 : 0,
          }}
        >
          <Ionicons
            name="send"
            size={17}
            color={inputText.trim() ? "#fff" : "#9CA3AF"}
          />
        </TouchableOpacity>
      </View>

      {/* Emoji quick-picker */}
      {showEmojiBar && (
        <View className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 px-4 py-2 flex-row flex-wrap gap-2">
          {QUICK_EMOJIS.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              onPress={() => {
                setInputText((t) => t + emoji);
                setShowEmojiBar(false);
              }}
              className="w-10 h-10 items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-full"
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
