"use client";

import { CheckCircle2, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCompleteDailyChallenge, useDailyChallenge } from "@/features/notifications/hooks";
import { useAuthStore } from "@/stores/auth-store";

export function DailyChallengeCard() {
  const { data: challenge } = useDailyChallenge();
  const complete = useCompleteDailyChallenge();
  const user = useAuthStore((s) => s.user);

  if (!challenge) return null;
  const completedByMe = user ? challenge.completedByIds.includes(user.id) : false;

  return (
    <Card className="border-accent/30 bg-accent/5">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Sparkle className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">Today's Together Challenge</p>
          <p className="font-display text-base font-medium">{challenge.title}</p>
          <p className="text-sm text-muted-foreground">{challenge.description}</p>
        </div>
        <Button
          size="sm"
          variant={completedByMe ? "secondary" : "default"}
          onClick={() => complete.mutate()}
          disabled={completedByMe || complete.isPending}
        >
          {completedByMe ? <CheckCircle2 className="h-4 w-4" /> : null}
          {completedByMe ? "Done" : "Start"}
        </Button>
      </CardContent>
    </Card>
  );
}
