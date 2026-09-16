import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Phone, Send, Video } from "lucide-react-native";
import { moodEmoji } from "@withu/constants";
import type { Message } from "@withu/shared-types";
import { Avatar } from "@/components/ui/avatar";
import { PresenceDot } from "@/components/ui/presence-dot";
import { useMyCouple } from "@/features/couple/hooks";
import { ChatBubble } from "@/features/messages/chat-bubble";
import { useMessages, useMessagesRealtime, useSendMessage, useTypingEmitter } from "@/features/messages/hooks";
import { useAppSocket } from "@/providers/socket-provider";
import { useAuthStore } from "@/stores/auth-store";
import { useCall } from "@/features/calls/call-context";

export default function ChatScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: couple } = useMyCouple();
  const { messages, isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const { socket } = useAppSocket();
  const { partnerTyping } = useMessagesRealtime(couple?.id);
  const emitTyping = useTypingEmitter(couple?.id);
  const { startCall, state: callState } = useCall();
  const listRef = useRef<FlatList<Message>>(null);
  const [draft, setDraft] = useState("");

  const partner = couple ? (couple.partnerOne.id === user?.id ? couple.partnerTwo : couple.partnerOne) : null;

  useEffect(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    const last = messages[messages.length - 1];
    if (last && couple && socket) socket.emit("MESSAGE_READ_UP_TO", { coupleId: couple.id, messageId: last.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const onSend = () => {
    const text = draft.trim();
    if (!text) return;
    sendMessage.mutate({ type: "text", text, clientTempId: `${Date.now()}-${Math.random().toString(36).slice(2)}` });
    setDraft("");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} className="flex-1 bg-background" keyboardVerticalOffset={90}>
      <SafeAreaView edges={["top"]} className="flex-1">
        <View className="flex-row items-center gap-3 border-b border-border px-4 py-3">
          {partner && (
            <>
              <View>
                <Avatar uri={partner.avatarUrl} name={partner.name} size={36} />
                <PresenceDot presence={partner.presence} className="absolute bottom-0 right-0" />
              </View>
              <View>
                <Text className="font-sans-medium text-foreground">{partner.name}</Text>
                <Text className="text-xs text-muted-foreground">
                  {partnerTyping ? "typing..." : partner.presence === "online" ? "Online" : `${moodEmoji(partner.mood)} ${partner.moodMessage ?? ""}`}
                </Text>
              </View>
              <View className="ml-auto flex-row gap-1">
                <Pressable
                  onPress={() => startCall("audio")}
                  disabled={callState.phase !== "idle"}
                  hitSlop={8}
                  className="h-10 w-10 items-center justify-center rounded-full disabled:opacity-40"
                >
                  <Phone size={20} color="#221019" />
                </Pressable>
                <Pressable
                  onPress={() => startCall("video")}
                  disabled={callState.phase !== "idle"}
                  hitSlop={8}
                  className="h-10 w-10 items-center justify-center rounded-full disabled:opacity-40"
                >
                  <Video size={20} color="#221019" />
                </Pressable>
              </View>
            </>
          )}
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#7A2C4C" />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={({ item }) => <ChatBubble message={item} />}
            contentContainerStyle={{ padding: 16, flexGrow: 1, justifyContent: messages.length === 0 ? "center" : undefined }}
            ListEmptyComponent={
              <View className="items-center gap-1">
                <Text className="font-display text-lg text-foreground">Say hello ❤️</Text>
                <Text className="text-sm text-muted-foreground">Your conversation starts here.</Text>
              </View>
            }
          />
        )}

        <View className="flex-row items-center gap-2 border-t border-border px-3 py-2">
          <TextInput
            value={draft}
            onChangeText={(t) => {
              setDraft(t);
              emitTyping();
            }}
            placeholder="Type a message..."
            placeholderTextColor="#6B5D63"
            className="h-11 flex-1 rounded-full border border-border bg-background px-4 text-base text-foreground"
          />
          <Pressable
            onPress={onSend}
            disabled={!draft.trim()}
            className="h-11 w-11 items-center justify-center rounded-full bg-primary disabled:opacity-50"
          >
            <Send size={18} color="#fff" />
          </Pressable>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
