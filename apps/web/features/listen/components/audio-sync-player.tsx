"use client";

import { useEffect, useRef } from "react";
import { needsResync } from "@withu/shared-utils";
import type { ListenSession } from "@withu/shared-types";
import { Music } from "lucide-react";

interface Props {
  session: ListenSession;
  onPlay: (position: number) => void;
  onPause: (position: number) => void;
  onSeek: (position: number) => void;
}

export function AudioSyncPlayer({ session, onPlay, onPause, onSeek }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const suppress = useRef(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const elapsed = session.playing ? (Date.now() - new Date(session.lastSyncedAt).getTime()) / 1000 : 0;
    const authoritative = session.currentPositionSeconds + Math.max(0, elapsed);

    suppress.current = true;
    if (needsResync(audio.currentTime, authoritative)) audio.currentTime = authoritative;
    if (session.playing) audio.play().catch(() => undefined);
    else audio.pause();
    setTimeout(() => (suppress.current = false), 150);
  }, [session.playing, session.currentPositionSeconds, session.lastSyncedAt]);

  return (
    <div className="glass flex flex-col items-center gap-4 rounded-2xl p-8 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Music className="h-8 w-8" />
      </div>
      <div>
        <p className="font-display text-lg">{session.track.title}</p>
        {session.track.artist && <p className="text-sm text-muted-foreground">{session.track.artist}</p>}
      </div>
      <audio
        ref={audioRef}
        src={session.track.trackId}
        controls
        className="w-full"
        onPlay={(e) => !suppress.current && onPlay(e.currentTarget.currentTime)}
        onPause={(e) => !suppress.current && onPause(e.currentTarget.currentTime)}
        onSeeked={(e) => !suppress.current && onSeek(e.currentTarget.currentTime)}
      />
    </div>
  );
}
