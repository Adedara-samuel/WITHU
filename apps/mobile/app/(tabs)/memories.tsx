import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CreateMemoryDialog } from "@/features/memories/create-memory-dialog";
import { MemoryCard } from "@/features/memories/memory-card";
import { StoryTimeline } from "@/features/memories/story-timeline";
import { useMemories } from "@/features/memories/hooks";
import { cn } from "@/lib/cn";

export default function MemoriesScreen() {
  const { data, isLoading } = useMemories();
  const memories = data?.memories ?? [];
  const [tab, setTab] = useState<"memories" | "story">("memories");

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ gap: 20, padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-sans-medium uppercase tracking-widest text-muted-foreground">Together</Text>
            <Text className="font-display text-2xl text-foreground">Our Memories</Text>
          </View>
          <CreateMemoryDialog />
        </View>

        <View className="flex-row self-start rounded-full bg-muted p-1">
          <Pressable onPress={() => setTab("memories")} className={cn("rounded-full px-4 py-1.5", tab === "memories" && "bg-card")}>
            <Text className="text-sm font-sans-medium text-foreground">Memories</Text>
          </Pressable>
          <Pressable onPress={() => setTab("story")} className={cn("rounded-full px-4 py-1.5", tab === "story" && "bg-card")}>
            <Text className="text-sm font-sans-medium text-foreground">Our Story</Text>
          </Pressable>
        </View>

        {tab === "memories" ? (
          isLoading ? (
            <ActivityIndicator color="#276852" />
          ) : memories.length === 0 ? (
            <View className="items-center gap-1 py-16">
              <Text className="font-display text-lg text-foreground">No memories yet ❤️</Text>
              <Text className="text-sm text-muted-foreground">Your first memory together will appear here.</Text>
            </View>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {memories.map((m) => (
                <MemoryCard key={m.id} memory={m} />
              ))}
            </View>
          )
        ) : (
          <StoryTimeline />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
