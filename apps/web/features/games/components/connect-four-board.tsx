"use client";

import type { GameSession } from "@withu/shared-types";
import { cn } from "@/lib/utils";

interface ConnectFourState {
  cells: (string | null)[];
  marks: Record<string, "R" | "Y">;
}

const ROWS = 6;
const COLS = 7;

export function ConnectFourBoard({
  session,
  meId,
  onMove,
}: {
  session: GameSession;
  meId: string;
  onMove: (payload: { column: number }) => void;
}) {
  const state = session.state as unknown as ConnectFourState;
  const myTurn = session.currentTurnUserId === meId && session.status === "active";
  const columnIsFull = (col: number) => state.cells[col] !== null;

  return (
    <div className="mx-auto grid w-full max-w-md grid-cols-7 gap-1.5 rounded-2xl bg-primary/10 p-3">
      {Array.from({ length: COLS }).map((_, col) => (
        <button
          key={col}
          onClick={() => myTurn && !columnIsFull(col) && onMove({ column: col })}
          disabled={!myTurn || columnIsFull(col)}
          className="flex flex-col gap-1.5 disabled:cursor-not-allowed"
        >
          {Array.from({ length: ROWS }).map((_, row) => {
            const owner = state.cells[row * COLS + col];
            const mark = owner ? state.marks[owner] : null;
            return (
              <span
                key={row}
                className={cn(
                  "aspect-square rounded-full border border-border/50 bg-card",
                  mark === "R" && "bg-ember",
                  mark === "Y" && "bg-accent"
                )}
              />
            );
          })}
        </button>
      ))}
    </div>
  );
}
