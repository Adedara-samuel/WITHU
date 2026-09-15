import { useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LogOut } from "lucide-react-native";
import { VideoSyncPlayer } from "@/features/watch/video-sync-player";
import { YouTubeSyncPlayer } from "@/features/watch/youtube-sync-player";
import { useEndWatchSession, useJoinWatchSession, useWatchRealtime, useWatchSession } from "@/features/watch/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function WatchSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: session, isLoading } = useWatchSession(sessionId);
  const join = useJoinWatchSession();
  const endSession = useEndWatchSession();
  const { play, pause, seek } = useWatchRealtime(sessionId);

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
          <Text className="font-display text-lg text-foreground">{session.media.title}</Text>
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

        {session.status === "ended" ? (
          <Text className="text-center text-sm text-muted-foreground">This session has ended.</Text>
        ) : session.media.providerId === "youtube" ? (
          <YouTubeSyncPlayer session={session} onPlay={play} onPause={pause} onSeek={seek} />
        ) : (
          <VideoSyncPlayer session={session} onPlay={play} onPause={pause} onSeek={seek} />
        )}

        <Text className="text-center text-xs text-muted-foreground">
          Playback stays in sync automatically across both your devices.
        </Text>
      </View>
    </SafeAreaView>
  );
}
