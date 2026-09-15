import { useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";
import { Audio, type AVPlaybackStatus } from "expo-av";
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
  const soundRef = useRef<Audio.Sound | null>(null);
  const suppress = useRef(false);
  const wasPlaying = useRef(false);
  const [ready, setReady] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let mounted = true;
    Audio.Sound.createAsync({ uri: session.track.trackId }, { shouldPlay: false }, (status) => handleStatus(status)).then(
      ({ sound }) => {
        if (!mounted) return sound.unloadAsync();
        soundRef.current = sound;
        setReady(true);
      }
    );
    return () => {
      mounted = false;
      soundRef.current?.unloadAsync();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.track.trackId]);

  const handleStatus = (status: AVPlaybackStatus) => {
    if (suppress.current || !status.isLoaded) return;
    if (status.isPlaying !== wasPlaying.current) {
      wasPlaying.current = status.isPlaying;
      setIsPlaying(status.isPlaying);
      const seconds = status.positionMillis / 1000;
      if (status.isPlaying) onPlay(seconds);
      else onPause(seconds);
    }
  };

  useEffect(() => {
    const sound = soundRef.current;
    if (!sound || !ready) return;
    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritative = session.currentPositionSeconds + Math.max(0, elapsed);

    (async () => {
      suppress.current = true;
      const status = await sound.getStatusAsync();
      const localSeconds = status.isLoaded ? status.positionMillis / 1000 : 0;
      if (needsResync(localSeconds, authoritative)) await sound.setPositionAsync(authoritative * 1000);
      if (session.playing) await sound.playAsync();
      else await sound.pauseAsync();
      wasPlaying.current = session.playing;
      setIsPlaying(session.playing);
      setTimeout(() => (suppress.current = false), 200);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  return (
    <View className="items-center gap-4 rounded-2xl border border-border bg-card p-8">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Music size={32} color="#7A2C4C" />
      </View>
      <View className="items-center">
        <Text className="font-display text-lg text-foreground">{session.track.title}</Text>
        {session.track.artist && <Text className="text-sm text-muted-foreground">{session.track.artist}</Text>}
      </View>
      <Button
        size="lg"
        onPress={async () => {
          const sound = soundRef.current;
          if (!sound) return;
          const status = await sound.getStatusAsync();
          if (status.isLoaded && status.isPlaying) await sound.pauseAsync();
          else await sound.playAsync();
        }}
      >
        {isPlaying ? <Pause size={18} color="#fff" /> : <Play size={18} color="#fff" />}
        <Text className="text-sm font-sans-medium text-primary-foreground">{isPlaying ? "Pause" : "Play"}</Text>
      </Button>
    </View>
  );
}
