import { useEffect, useState } from "react";
import { router } from "expo-router";
import { Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Gamepad2, Heart, MessageCircle, Sparkles } from "lucide-react-native";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSendAffection } from "@/features/affection/hooks";
import { useMyCouple } from "@/features/couple/hooks";
import { CreateWatchDialog } from "@/features/watch/create-watch-dialog";
import { CreateListenDialog } from "@/features/listen/create-listen-dialog";
import { useActiveTogether, useEndTogether, useStartTogether, useTogetherRealtime } from "@/features/together/hooks";
import { useAuthStore } from "@/stores/auth-store";

function useElapsed(startedAt: string | undefined) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed;
}

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export default function TogetherScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: couple } = useMyCouple();
  const { data: session } = useActiveTogether();
  const startTogether = useStartTogether();
  const endTogether = useEndTogether();
  const sendAffection = useSendAffection();
  useTogetherRealtime();

  const elapsed = useElapsed(session?.startedAt);
  const partner = couple ? (couple.partnerOne.id === user?.id ? couple.partnerTwo : couple.partnerOne) : null;
  if (!couple || !user) return null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ gap: 24, padding: 16, paddingBottom: 40 }}>
        <View className="items-center">
          <Text className="text-xs font-sans-medium uppercase tracking-widest text-muted-foreground">Together Mode</Text>
          <Text className="font-display text-2xl text-foreground">A shared space, right now</Text>
        </View>

        <Card>
          <CardContent className="items-center gap-4 py-8">
            <View className="flex-row items-center gap-4">
              <Avatar uri={user.avatarUrl} name={user.name} size={64} />
              <Heart size={22} color="#7A2C4C" fill="#7A2C4C22" />
              <Avatar uri={partner?.avatarUrl} name={partner?.name ?? "?"} size={64} />
            </View>

            {session ? (
              <>
                <Text className="font-display text-4xl text-foreground">{formatDuration(elapsed)}</Text>
                <Text className="text-sm capitalize text-muted-foreground">Currently: {session.activity.replace(/_/g, " ")}</Text>
              </>
            ) : (
              <Text className="text-sm text-muted-foreground">Start a together session to begin tracking your time.</Text>
            )}

            <View className="flex-row flex-wrap justify-center gap-2">
              {!session ? (
                <Button onPress={() => startTogether.mutate({ activity: "idle" })} loading={startTogether.isPending}>
                  <Sparkles size={16} color="#fff" />
                  <Text className="text-sm font-sans-medium text-primary-foreground">Start Together</Text>
                </Button>
              ) : (
                <Button variant="outline" onPress={() => endTogether.mutate()} loading={endTogether.isPending}>
                  Leave
                </Button>
              )}
              <Button variant="secondary" onPress={() => sendAffection.mutate({ kind: "hug" })}>
                🫂 Hug
              </Button>
            </View>
          </CardContent>
        </Card>

        <View>
          <Text className="mb-3 text-sm font-sans-medium text-muted-foreground">Do something together</Text>
          <View className="flex-row flex-wrap gap-3">
            <Pressable
              onPress={() => router.push("/chat")}
              className="items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4"
              style={{ minWidth: "44%" }}
            >
              <MessageCircle size={20} color="#7A2C4C" />
              <Text className="text-xs font-sans-medium text-foreground">Chat</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/games")}
              className="items-center gap-2 rounded-2xl border border-border bg-card px-5 py-4"
              style={{ minWidth: "44%" }}
            >
              <Gamepad2 size={20} color="#7A2C4C" />
              <Text className="text-xs font-sans-medium text-foreground">Play</Text>
            </Pressable>
            <View className="flex-1" style={{ minWidth: "44%" }}>
              <CreateWatchDialog />
            </View>
            <View className="flex-1" style={{ minWidth: "44%" }}>
              <CreateListenDialog />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
