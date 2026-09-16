import { router } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { GameCard } from "@/features/games/game-card";
import { useCreateGameSession, useGameCatalog, useGameSessions } from "@/features/games/hooks";
import { useAuthStore } from "@/stores/auth-store";

const STATUS_LABEL: Record<string, string> = {
  invited: "Waiting",
  active: "In progress",
  completed: "Finished",
  declined: "Declined",
  cancelled: "Cancelled",
};

export default function GamesScreen() {
  const user = useAuthStore((s) => s.user);
  const { data: catalog = [], isLoading } = useGameCatalog();
  const { data: sessions = [] } = useGameSessions();
  const createSession = useCreateGameSession();

  const romantic = catalog.filter((g) => g.category === "romantic");
  const logical = catalog.filter((g) => g.category === "logical");

  const handlePlay = async (gameKey: (typeof catalog)[number]["key"]) => {
    const session = await createSession.mutateAsync(gameKey);
    router.push(`/games/${session.id}`);
  };

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ gap: 24, padding: 16, paddingBottom: 40 }}>
        <View>
          <Text className="text-xs font-sans-medium uppercase tracking-widest text-muted-foreground">Together</Text>
          <Text className="font-display text-2xl text-foreground">Games</Text>
        </View>

        {sessions.length > 0 && (
          <View className="gap-2">
            <Text className="text-sm font-sans-medium text-muted-foreground">Your games</Text>
            {sessions.slice(0, 5).map((s) => (
              <Pressable key={s.id} onPress={() => router.push(`/games/${s.id}`)}>
                <Card>
                  <CardContent className="flex-row items-center justify-between">
                    <View>
                      <Text className="font-sans-medium capitalize text-foreground">{s.gameKey.replace(/_/g, " ")}</Text>
                      <Text className="text-xs text-muted-foreground">{s.players.map((p) => p.name).join(" & ")}</Text>
                    </View>
                    <Badge variant={s.status === "active" ? "success" : "secondary"}>
                      {s.winnerId === user?.id ? "You won 🎉" : STATUS_LABEL[s.status]}
                    </Badge>
                  </CardContent>
                </Card>
              </Pressable>
            ))}
          </View>
        )}

        {isLoading ? (
          <ActivityIndicator color="#276852" />
        ) : (
          <>
            <View className="gap-3">
              <Text className="text-sm font-sans-medium text-muted-foreground">Romantic</Text>
              <View className="flex-row flex-wrap gap-3">
                {romantic.map((g) => (
                  <GameCard key={g.key} game={g} onPlay={() => handlePlay(g.key)} pending={createSession.isPending} />
                ))}
              </View>
            </View>
            <View className="gap-3">
              <Text className="text-sm font-sans-medium text-muted-foreground">Logical</Text>
              <View className="flex-row flex-wrap gap-3">
                {logical.map((g) => (
                  <GameCard key={g.key} game={g} onPlay={() => handlePlay(g.key)} pending={createSession.isPending} />
                ))}
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
