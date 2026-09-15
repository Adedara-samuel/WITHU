"use client";

import type { GameSession } from "@withu/shared-types";
import { cn } from "@/lib/utils";

interface TicTacToeState {
  board: (string | null)[];
  marks: Record<string, "X" | "O">;
}

export function TicTacToeBoard({
  session,
  meId,
  onMove,
}: {
  session: GameSession;
  meId: string;
  onMove: (payload: { position: number }) => void;
}) {
  const state = session.state as unknown as TicTacToeState;
  const myTurn = session.currentTurnUserId === meId && session.status === "active";

  return (
    <div className="mx-auto grid w-full max-w-xs grid-cols-3 gap-2">
      {state.board.map((owner, i) => {
        const mark = owner ? state.marks[owner] : null;
        return (
          <button
            key={i}
            onClick={() => myTurn && !owner && onMove({ position: i })}
            disabled={!myTurn || !!owner}
            className={cn(
              "flex aspect-square items-center justify-center rounded-xl border border-border bg-card font-display text-3xl transition-colors",
              myTurn && !owner && "hover:border-primary hover:bg-primary/5",
              mark === "X" && "text-primary",
              mark === "O" && "text-ember"
            )}
          >
            {mark}
          </button>
        );
      })}
    </div>
  );
}
