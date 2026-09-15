"use client";

import {
  Brain,
  Flame,
  Gamepad2,
  HeartHandshake,
  LayoutGrid,
  CircleDot,
  Shuffle,
  Split,
  Grid3x3,
  type LucideIcon,
} from "lucide-react";
import type { GameDefinition } from "@withu/shared-types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const ICONS: Record<string, LucideIcon> = {
  "grid-3x3": Grid3x3,
  "circle-dot": CircleDot,
  "layout-grid": LayoutGrid,
  "heart-handshake": HeartHandshake,
  split: Split,
  shuffle: Shuffle,
  flame: Flame,
  brain: Brain,
};

export function GameCard({ game, onPlay, pending }: { game: GameDefinition; onPlay: () => void; pending: boolean }) {
  const Icon = ICONS[game.icon] ?? Gamepad2;
  return (
    <Card className="flex flex-col">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <p className="font-display text-base font-medium">{game.name}</p>
          <p className="text-sm text-muted-foreground">{game.description}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={onPlay} disabled={pending}>
          Invite to play
        </Button>
      </CardContent>
    </Card>
  );
}
