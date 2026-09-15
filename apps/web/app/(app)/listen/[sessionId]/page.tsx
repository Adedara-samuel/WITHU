"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioSyncPlayer } from "@/features/listen/components/audio-sync-player";
import { useEndListenSession, useJoinListenSession, useListenRealtime, useListenSession } from "@/features/listen/hooks";
import { useAuthStore } from "@/stores/auth-store";

export default function ListenSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: session, isLoading } = useListenSession(params.sessionId);
  const join = useJoinListenSession();
  const endSession = useEndListenSession();
  const { play, pause, seek } = useListenRealtime(params.sessionId);

  useEffect(() => {
    if (session && user && session.hostId !== user.id && !session.guestId) join.mutate(session.id);
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
    <div className="mx-auto max-w-md space-y-4 p-4 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Listen Together</p>
        <Button
          variant="outline"
          size="sm"
          onClick={async () => {
            await endSession.mutateAsync(session.id);
            router.push("/together");
          }}
        >
          <LogOut className="h-4 w-4" /> End
        </Button>
      </div>
      <AudioSyncPlayer session={session} onPlay={play} onPause={pause} onSeek={seek} />
    </div>
  );
}
