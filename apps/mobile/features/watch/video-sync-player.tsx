import { useEffect, useRef } from "react";
import { View } from "react-native";
import { useVideoPlayer, VideoView } from "expo-video";
import { needsResync } from "@withu/shared-utils";
import type { WatchSession } from "@withu/shared-types";

interface Props {
  session: WatchSession;
  onPlay: (position: number) => void;
  onPause: (position: number) => void;
  onSeek: (position: number) => void;
}

/**
 * expo-video reports `timeUpdate` on a fixed interval rather than discrete DOM-style
 * events, so we only emit a socket command on play/pause *transitions* or when the
 * position drifts further than continuous playback would explain (a scrub/seek) -
 * otherwise every tick would flood the socket with commands.
 */
export function VideoSyncPlayer({ session, onPlay, onPause, onSeek }: Props) {
  const player = useVideoPlayer(session.media.mediaId, (p) => {
    p.loop = false;
    p.timeUpdateEventInterval = 2;
  });

  const suppress = useRef(false);
  const wasPlaying = useRef(false);
  const expectedSeconds = useRef(0);
  const lastTick = useRef(Date.now());

  useEffect(() => {
    const playingSub = player.addListener("playingChange", ({ isPlaying }) => {
      if (suppress.current || isPlaying === wasPlaying.current) return;
      wasPlaying.current = isPlaying;
      const seconds = player.currentTime;
      expectedSeconds.current = seconds;
      lastTick.current = Date.now();
      if (isPlaying) onPlay(seconds);
      else onPause(seconds);
    });

    const timeSub = player.addListener("timeUpdate", ({ currentTime }) => {
      if (suppress.current || !wasPlaying.current) return;
      const now = Date.now();
      const dt = (now - lastTick.current) / 1000;
      lastTick.current = now;
      expectedSeconds.current += dt;
      if (needsResync(currentTime, expectedSeconds.current)) {
        expectedSeconds.current = currentTime;
        onSeek(currentTime);
      }
    });

    return () => {
      playingSub.remove();
      timeSub.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  useEffect(() => {
    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritativeSeconds = session.currentPositionSeconds + Math.max(0, elapsed);
    expectedSeconds.current = authoritativeSeconds;
    wasPlaying.current = session.playing;
    lastTick.current = Date.now();

    suppress.current = true;
    if (needsResync(player.currentTime, authoritativeSeconds)) player.currentTime = authoritativeSeconds;
    if (session.playing) player.play();
    else player.pause();
    setTimeout(() => (suppress.current = false), 250);
  }, [player, session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  return (
    <View className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <VideoView player={player} style={{ flex: 1 }} contentFit="contain" nativeControls />
    </View>
  );
}
