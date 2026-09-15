import { useRef } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import type { Message } from "@withu/shared-types";
import { useAuthStore } from "@/stores/auth-store";
import { useDeleteMessage, useToggleReaction } from "@/features/messages/hooks";
import { cn } from "@/lib/cn";

export function ChatBubble({ message }: { message: Message }) {
  const user = useAuthStore((s) => s.user);
  const isMine = message.senderId === user?.id;
  const deleteMessage = useDeleteMessage();
  const toggleReaction = useToggleReaction();
  const lastTap = useRef(0);

  const time = new Date(message.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  const groupedReactions = message.reactions.reduce<Record<string, number>>((acc, r) => {
    acc[r.emoji] = (acc[r.emoji] ?? 0) + 1;
    return acc;
  }, {});
  const myHeart = message.reactions.some((r) => r.userId === user?.id && r.emoji === "❤️");

  const onPress = () => {
    const now = Date.now();
    if (now - lastTap.current < 280) {
      toggleReaction.mutate({ messageId: message.id, emoji: "❤️", hasMine: myHeart });
    }
    lastTap.current = now;
  };

  const onLongPress = () => {
    if (!isMine || message.deletedAt) return;
    Alert.alert("Delete message?", undefined, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteMessage.mutate(message.id) },
    ]);
  };

  return (
    <View className={cn("mb-3", isMine ? "items-end" : "items-start")}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        className={cn("max-w-[80%] rounded-2xl px-4 py-2.5", isMine ? "rounded-br-sm bg-primary" : "rounded-bl-sm bg-muted")}
      >
        <Text className={cn("text-sm", isMine ? "text-primary-foreground" : "text-foreground")}>
          {message.deletedAt ? "Message deleted" : message.text}
        </Text>
        <Text className={cn("mt-1 text-[10px]", isMine ? "text-primary-foreground/70" : "text-muted-foreground")}>{time}</Text>
      </Pressable>

      {Object.keys(groupedReactions).length > 0 && (
        <View className="mt-1 flex-row gap-1">
          {Object.entries(groupedReactions).map(([emoji, count]) => (
            <View key={emoji} className="rounded-full border border-border bg-card px-1.5 py-0.5">
              <Text className="text-xs">
                {emoji} {count > 1 && count}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
