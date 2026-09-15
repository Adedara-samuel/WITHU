import { Pressable, Text, View } from "react-native";
import type { GameSession } from "@withu/shared-types";
import { cn } from "@/lib/cn";

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
    <View className="mx-auto w-full max-w-xs flex-row flex-wrap gap-2">
      {state.board.map((owner, i) => {
        const mark = owner ? state.marks[owner] : null;
        return (
          <Pressable
            key={i}
            onPress={() => myTurn && !owner && onMove({ position: i })}
            disabled={!myTurn || !!owner}
            className="aspect-square items-center justify-center rounded-xl border border-border bg-card"
            style={{ width: "31%" }}
          >
            <Text className={cn("font-display text-3xl", mark === "X" ? "text-primary" : "text-ember")}>{mark}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
