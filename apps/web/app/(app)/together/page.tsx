"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Gamepad2, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAffectionBurst } from "@/components/effects/affection-burst";
import { useMyCouple } from "@/features/couple/hooks";
import { useSendAffection } from "@/features/affection/hooks";
import { CreateWatchDialog } from "@/features/watch/components/create-watch-dialog";
import { CreateListenDialog } from "@/features/listen/components/create-listen-dialog";
import { useActiveTogether, useEndTogether, useStartTogether, useTogetherRealtime } from "@/features/together/hooks";
import { useAuthStore } from "@/stores/auth-store";

function useElapsed(startedAt: string | undefined) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const start = new Date(startedAt).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  return elapsed;
}

function formatDuration(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${m}:${String(s).padStart(2, "0")}`;
}

export default function TogetherPage() {
  const user = useAuthStore((s) => s.user);
  const { data: couple } = useMyCouple();
  const { data: session } = useActiveTogether();
  const startTogether = useStartTogether();
  const endTogether = useEndTogether();
  const sendAffection = useSendAffection();
  const burst = useAffectionBurst();
  const searchParams = useSearchParams();
  useTogetherRealtime();

  const elapsed = useElapsed(session?.startedAt);
  const partner = couple ? (couple.partnerOne.id === user?.id ? couple.partnerTwo : couple.partnerOne) : null;

  useEffect(() => {
    const activity = searchParams.get("activity");
    if (activity && !session) {
      startTogether.mutate({ activity: activity as "watching" | "listening" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  if (!couple || !user) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6 lg:p-10">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Together Mode</p>
        <h1 className="font-display text-2xl font-medium">A shared space, right now</h1>
      </div>

      <Card className="glass overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 p-8">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-card">
              <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            <Heart className="h-6 w-6 fill-primary/20 text-primary" />
            <Avatar className="h-16 w-16 border-2 border-card">
              <AvatarImage src={partner?.avatarUrl ?? undefined} alt={partner?.name} />
              <AvatarFallback>{partner?.name?.[0]}</AvatarFallback>
            </Avatar>
          </div>

          {session ? (
            <>
              <p className="font-display text-4xl tabular-nums">{formatDuration(elapsed)}</p>
              <p className="text-sm capitalize text-muted-foreground">Currently: {session.activity.replace(/_/g, " ")}</p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Start a together session to begin tracking your time.</p>
          )}

          <div className="flex flex-wrap justify-center gap-2">
            {!session ? (
              <Button onClick={() => startTogether.mutate({ activity: "idle" })} disabled={startTogether.isPending}>
                <Sparkles className="h-4 w-4" /> Start Together
              </Button>
            ) : (
              <Button variant="outline" onClick={() => endTogether.mutate()} disabled={endTogether.isPending}>
                Leave
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => {
                burst("🫂");
                sendAffection.mutate({ kind: "hug" });
              }}
            >
              🫂 Hug
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        <p className="mb-3 text-sm font-medium text-muted-foreground">Do something together</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link href="/chat" className="glass flex flex-col items-center gap-2 rounded-xl py-5 text-center">
            <MessageCircle className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Chat</span>
          </Link>
          <Link href="/games" className="glass flex flex-col items-center gap-2 rounded-xl py-5 text-center">
            <Gamepad2 className="h-5 w-5 text-primary" />
            <span className="text-xs font-medium">Play</span>
          </Link>
          <div className="glass flex flex-col items-center justify-center gap-2 rounded-xl py-3 text-center">
            <CreateWatchDialog />
          </div>
          <div className="glass flex flex-col items-center justify-center gap-2 rounded-xl py-3 text-center">
            <CreateListenDialog />
          </div>
        </div>
      </div>
    </div>
  );
}
