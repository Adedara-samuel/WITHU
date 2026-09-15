import { useEffect, useRef } from "react";
import { View } from "react-native";
import { ResizeMode, Video, type AVPlaybackStatus } from "expo-av";
import { needsResync } from "@withu/shared-utils";
import type { WatchSession } from "@withu/shared-types";

interface Props {
  session: WatchSession;
  onPlay: (position: number) => void;
  onPause: (position: number) => void;
  onSeek: (position: number) => void;
}

/**
 * expo-av reports status on every frame, not discrete DOM-style events, so we
 * only emit a socket command on state *transitions* (play<->pause) or when the
 * position jumps further than normal playback would explain (a scrub/seek) -
 * otherwise every status tick would flood the socket with WATCH_PLAY events.
 */
export function VideoSyncPlayer({ session, onPlay, onPause, onSeek }: Props) {
  const videoRef = useRef<Video>(null);
  const suppress = useRef(false);
  const wasPlaying = useRef(false);
  const expectedSeconds = useRef(0);
  const lastTick = useRef(Date.now());

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritativeSeconds = session.currentPositionSeconds + Math.max(0, elapsed);
    expectedSeconds.current = authoritativeSeconds;
    wasPlaying.current = session.playing;

    (async () => {
      suppress.current = true;
      await video.setPositionAsync(authoritativeSeconds * 1000).catch(() => undefined);
      if (session.playing) await video.playAsync().catch(() => undefined);
      else await video.pauseAsync().catch(() => undefined);
      setTimeout(() => (suppress.current = false), 250);
    })();
  }, [session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  const handleStatus = (status: AVPlaybackStatus) => {
    if (suppress.current || !status.isLoaded) return;
    const seconds = status.positionMillis / 1000;
    const now = Date.now();
    const dt = (now - lastTick.current) / 1000;
    lastTick.current = now;

    if (status.isPlaying !== wasPlaying.current) {
      wasPlaying.current = status.isPlaying;
      if (status.isPlaying) onPlay(seconds);
      else onPause(seconds);
      expectedSeconds.current = seconds;
      return;
    }

    if (status.isPlaying) {
      expectedSeconds.current += dt;
      if (needsResync(seconds, expectedSeconds.current)) {
        expectedSeconds.current = seconds;
        onSeek(seconds);
      }
    }
  };

  return (
    <View className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <Video
        ref={videoRef}
        source={{ uri: session.media.mediaId }}
        useNativeControls
        resizeMode={ResizeMode.CONTAIN}
        style={{ flex: 1 }}
        onPlaybackStatusUpdate={handleStatus}
      />
    </View>
  );
}
