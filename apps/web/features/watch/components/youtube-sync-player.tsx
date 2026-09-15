"use client";

import { useEffect, useRef } from "react";
import { needsResync } from "@withu/shared-utils";
import type { WatchSession } from "@withu/shared-types";

declare global {
  interface Window {
    YT?: {
      Player: new (el: HTMLElement, options: Record<string, unknown>) => YouTubePlayer;
      PlayerState: { PLAYING: number; PAUSED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YouTubePlayer {
  getCurrentTime: () => number;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  playVideo: () => void;
  pauseVideo: () => void;
}

let apiLoadPromise: Promise<void> | null = null;
function loadYouTubeApi(): Promise<void> {
  if (window.YT) return Promise.resolve();
  if (apiLoadPromise) return apiLoadPromise;
  apiLoadPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => resolve();
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  });
  return apiLoadPromise;
}

interface Props {
  session: WatchSession;
  onPlay: (position: number) => void;
  onPause: (position: number) => void;
  onSeek: (position: number) => void;
}

export function YouTubeSyncPlayer({ session, onPlay, onPause, onSeek }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const suppress = useRef(false);
  const expectedTime = useRef(0);
  const wasPlaying = useRef(false);

  useEffect(() => {
    let disposed = false;
    let pollId: ReturnType<typeof setInterval>;

    loadYouTubeApi().then(() => {
      if (disposed || !containerRef.current || !window.YT) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId: session.media.mediaId,
        playerVars: { rel: 0 },
        events: {
          onStateChange: (e: { data: number }) => {
            if (suppress.current || !window.YT) return;
            const time = playerRef.current?.getCurrentTime() ?? 0;
            if (e.data === window.YT.PlayerState.PLAYING) {
              wasPlaying.current = true;
              onPlay(time);
            } else if (e.data === window.YT.PlayerState.PAUSED) {
              wasPlaying.current = false;
              onPause(time);
            }
          },
        },
      });

      pollId = setInterval(() => {
        if (!playerRef.current || suppress.current || !wasPlaying.current) return;
        const actual = playerRef.current.getCurrentTime();
        expectedTime.current += 2;
        if (Math.abs(actual - expectedTime.current) > 2) {
          expectedTime.current = actual;
          onSeek(actual);
        }
      }, 2000);
    });

    return () => {
      disposed = true;
      if (pollId) clearInterval(pollId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.media.mediaId]);

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritative = session.currentPositionSeconds + Math.max(0, elapsed);
    expectedTime.current = authoritative;

    suppress.current = true;
    if (needsResync(player.getCurrentTime(), authoritative)) player.seekTo(authoritative, true);
    if (session.playing) player.playVideo();
    else player.pauseVideo();
    setTimeout(() => (suppress.current = false), 300);
  }, [session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  return <div className="aspect-video w-full overflow-hidden rounded-xl bg-black" ref={containerRef} />;
}
