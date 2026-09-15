import { Pressable, View } from "react-native";
import type { GameSession } from "@withu/shared-types";
import { cn } from "@/lib/cn";

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
    <View className="mx-auto w-full flex-row justify-center gap-1 rounded-2xl bg-primary/10 p-2">
      {Array.from({ length: COLS }).map((_, col) => (
        <Pressable key={col} onPress={() => myTurn && !columnIsFull(col) && onMove({ column: col })} className="gap-1">
          {Array.from({ length: ROWS }).map((_, row) => {
            const owner = state.cells[row * COLS + col];
            const mark = owner ? state.marks[owner] : null;
            return (
              <View
                key={row}
                className={cn("h-6 w-6 rounded-full border border-border/40 bg-card", mark === "R" && "bg-ember", mark === "Y" && "bg-accent")}
              />
            );
          })}
        </Pressable>
      ))}
    </View>
  );
}
