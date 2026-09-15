"use client";

import { useEffect, useRef } from "react";
import { needsResync } from "@withu/shared-utils";
import type { WatchSession } from "@withu/shared-types";

interface Props {
  session: WatchSession;
  onPlay: (position: number) => void;
  onPause: (position: number) => void;
  onSeek: (position: number) => void;
}

/** Plays a direct video URL (generic_url / local_file providers) and keeps it in sync via tiny playback commands only. */
export function VideoSyncPlayer({ session, onPlay, onPause, onSeek }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const suppressEvents = useRef(false);
  const lastAppliedSync = useRef(0);

  // Apply authoritative state whenever the session updates (from ourselves or our partner).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritative = session.currentPositionSeconds + Math.max(0, elapsed);

    if (needsResync(video.currentTime, authoritative) || Date.now() - lastAppliedSync.current > 4000) {
      suppressEvents.current = true;
      video.currentTime = authoritative;
      lastAppliedSync.current = Date.now();
      setTimeout(() => (suppressEvents.current = false), 150);
    }

    if (session.playing && video.paused) {
      suppressEvents.current = true;
      video.play().catch(() => undefined);
      setTimeout(() => (suppressEvents.current = false), 150);
    } else if (!session.playing && !video.paused) {
      suppressEvents.current = true;
      video.pause();
      setTimeout(() => (suppressEvents.current = false), 150);
    }
  }, [session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  return (
    <video
      ref={videoRef}
      src={session.media.mediaId}
      controls
      className="aspect-video w-full rounded-xl bg-black"
      onPlay={(e) => !suppressEvents.current && onPlay(e.currentTarget.currentTime)}
      onPause={(e) => !suppressEvents.current && onPause(e.currentTarget.currentTime)}
      onSeeked={(e) => !suppressEvents.current && onSeek(e.currentTarget.currentTime)}
    />
  );
}
