"use client";

import type { GameSession } from "@withu/shared-types";
import { cn } from "@/lib/utils";

interface MemoryCard {
  symbol: string;
  matchedBy: string | null;
}
interface MemoryMatchState {
  cards: MemoryCard[];
  flippedIndices: number[];
  scores: Record<string, number>;
}

export function MemoryMatchBoard({
  session,
  meId,
  onMove,
}: {
  session: GameSession;
  meId: string;
  onMove: (payload: { cardIndex: number }) => void;
}) {
  const state = session.state as unknown as MemoryMatchState;
  const myTurn = session.currentTurnUserId === meId && session.status === "active";

  return (
    <div>
      <div className="mb-3 flex justify-center gap-6 text-sm">
        {session.players.map((p) => (
          <span key={p.userId} className="font-medium">
            {p.name}: {state.scores[p.userId] ?? 0}
          </span>
        ))}
      </div>
      <div className="mx-auto grid w-full max-w-sm grid-cols-4 gap-2">
        {state.cards.map((card, i) => {
          const revealed = card.matchedBy !== null || state.flippedIndices.includes(i);
          return (
            <button
              key={i}
              onClick={() => myTurn && !revealed && onMove({ cardIndex: i })}
              disabled={!myTurn || revealed}
              className={cn(
                "flex aspect-square items-center justify-center rounded-lg border border-border text-xl transition-all",
                revealed ? "bg-primary/10" : "bg-primary text-transparent hover:opacity-80",
                card.matchedBy && "opacity-50"
              )}
            >
              {revealed ? card.symbol : ""}
            </button>
          );
        })}
      </div>
    </div>
  );
}
