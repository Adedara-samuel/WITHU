import { Alert, Image, Pressable, Text, View } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import type { Memory } from "@withu/shared-types";
import { Trash2 } from "lucide-react-native";
import { useDeleteMemory } from "@/features/memories/hooks";
import { useAuthStore } from "@/stores/auth-store";

const CATEGORY_LABEL: Record<Memory["category"], string> = {
  first_date: "❤️ First Date",
  trip: "🌍 Trip",
  birthday: "🎂 Birthday",
  funny: "😂 Funny Moment",
  favourite: "📸 Favourite",
  place_to_visit: "🌍 Want to visit",
  milestone: "💍 Milestone",
  general: "✨ Memory",
};

export function MemoryCard({ memory }: { memory: Memory }) {
  const user = useAuthStore((s) => s.user);
  const deleteMemory = useDeleteMemory();
  const mine = memory.authorId === user?.id;

  return (
    <Animated.View
      entering={FadeIn.duration(280).springify()}
      className="mb-3 overflow-hidden rounded-2xl border border-border bg-card"
      style={{ width: "48%" }}
    >
      {memory.photo && <Image source={{ uri: memory.photo.thumbnailUrl }} style={{ width: "100%", height: 110 }} />}
      <View className="gap-1 p-3">
        <Text className="text-[10px] font-sans-medium uppercase text-primary">{CATEGORY_LABEL[memory.category]}</Text>
        <View className="flex-row items-start justify-between">
          <Text className="flex-1 font-display text-sm text-foreground">{memory.title}</Text>
          {mine && (
            <Pressable
              onPress={() =>
                Alert.alert("Delete memory?", undefined, [
                  { text: "Cancel", style: "cancel" },
                  { text: "Delete", style: "destructive", onPress: () => deleteMemory.mutate(memory.id) },
                ])
              }
              hitSlop={6}
            >
              <Trash2 size={13} color="#6B5D63" />
            </Pressable>
          )}
        </View>
        {memory.caption && (
          <Text className="text-xs text-muted-foreground" numberOfLines={2}>
            {memory.caption}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}
