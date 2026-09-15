"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoSyncPlayer } from "@/features/watch/components/video-sync-player";
import { YouTubeSyncPlayer } from "@/features/watch/components/youtube-sync-player";
import { useEndWatchSession, useJoinWatchSession, useWatchRealtime, useWatchSession } from "@/features/watch/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function WatchSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: session, isLoading } = useWatchSession(params.sessionId);
  const join = useJoinWatchSession();
  const endSession = useEndWatchSession();
  const { play, pause, seek } = useWatchRealtime(params.sessionId);

  useEffect(() => {
    if (session && user && session.hostId !== user.id && !session.guestId) {
      join.mutate(session.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.id, session?.guestId, user?.id]);

  if (isLoading || !session) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Watch Together</p>
          <h1 className="font-display text-xl font-medium">{session.media.title}</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await endSession.mutateAsync(session.id);
            router.push("/together");
          }}
        >
          <LogOut className="h-4 w-4" /> End session
        </Button>
      </div>

      {session.status === "ended" ? (
        <div className="glass flex flex-col items-center gap-2 rounded-2xl p-10 text-center">
          <p className="font-display text-lg">This session has ended</p>
          <Button size="sm" onClick={() => router.push("/together")}>
            Back to Together
          </Button>
        </div>
      ) : session.media.providerId === "youtube" ? (
        <YouTubeSyncPlayer session={session} onPlay={play} onPause={pause} onSeek={seek} />
      ) : (
        <VideoSyncPlayer session={session} onPlay={play} onPause={pause} onSeek={seek} />
      )}

      <p className="text-center text-xs text-muted-foreground">
        Playback stays in sync automatically — press play, pause or seek and your partner follows along.
      </p>
    </div>
  );
}
