import { useEffect, useRef } from "react";
import { Text, View } from "react-native";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { Music, Pause, Play } from "lucide-react-native";
import { needsResync } from "@withu/shared-utils";
import type { ListenSession } from "@withu/shared-types";
import { Button } from "@/components/ui/button";

interface Props {
  session: ListenSession;
  onPlay: (position: number) => void;
  onPause: (position: number) => void;
}

export function AudioSyncPlayer({ session, onPlay, onPause }: Props) {
  const player = useAudioPlayer(session.track.trackId);
  const status = useAudioPlayerStatus(player);
  const suppress = useRef(false);
  const wasPlaying = useRef(false);

  // Report play/pause transitions only - useAudioPlayerStatus ticks on every
  // updateInterval, so we must not treat every tick as a fresh play event.
  useEffect(() => {
    if (suppress.current || status.playing === wasPlaying.current) return;
    wasPlaying.current = status.playing;
    if (status.playing) onPlay(status.currentTime);
    else onPause(status.currentTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status.playing]);

  useEffect(() => {
    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritative = session.currentPositionSeconds + Math.max(0, elapsed);

    suppress.current = true;
    if (needsResync(player.currentTime, authoritative)) player.seekTo(authoritative);
    if (session.playing) player.play();
    else player.pause();
    wasPlaying.current = session.playing;
    setTimeout(() => (suppress.current = false), 200);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player, session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  return (
    <View className="items-center gap-4 rounded-2xl border border-border bg-card p-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Music size={32} color="#276852" />
      </View>
      <View className="items-center">
        <Text className="font-display text-lg text-foreground">{session.track.title}</Text>
        {session.track.artist && <Text className="text-sm text-muted-foreground">{session.track.artist}</Text>}
      </View>
      <Button size="lg" onPress={() => (status.playing ? player.pause() : player.play())}>
        {status.playing ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" />}
        <Text className="text-sm font-sans-medium text-primary-foreground">{status.playing ? "Pause" : "Play"}</Text>
      </Button>
    </View>
  );
}
