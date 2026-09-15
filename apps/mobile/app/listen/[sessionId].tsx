import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { AudioSyncPlayer } from "@/features/listen/audio-sync-player";
import { useEndListenSession, useJoinListenSession, useListenRealtime, useListenSession } from "@/features/listen/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function ListenSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: session, isLoading } = useListenSession(sessionId);
  const join = useJoinListenSession();
  const endSession = useEndListenSession();
  const { play, pause } = useListenRealtime(sessionId);

  useEffect(() => {
    if (session && user && session.hostId !== user.id && !session.guestId) join.mutate(session.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.guestId, user?.id]);

  if (isLoading || !session) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7A2C4C" />
      </View>
    );
  }

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <View className="gap-4 p-4">
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-lg text-foreground">Listen Together</Text>
          <Pressable
            onPress={async () => {
              await endSession.mutateAsync(session.id);
              router.replace("/together");
            }}
            className="flex-row items-center gap-1 rounded-full border border-border px-3 py-1.5"
          >
            <LogOut size={14} color="#221019" />
            <Text className="text-xs font-sans-medium text-foreground">End</Text>
          </Pressable>
        </View>
        <AudioSyncPlayer session={session} onPlay={play} onPause={pause} />
      </View>
    </SafeAreaView>
  );
}
