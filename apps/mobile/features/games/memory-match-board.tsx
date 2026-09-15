import { Pressable, Text, View } from "react-native";
import type { GameSession } from "@withu/shared-types";
import { cn } from "@/lib/cn";

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
    <View>
      <View className="mb-3 flex-row justify-center gap-6">
        {session.players.map((p) => (
          <Text key={p.userId} className="text-sm font-sans-medium text-foreground">
            {p.name}: {state.scores[p.userId] ?? 0}
          </Text>
        ))}
      </View>
      <View className="mx-auto w-full max-w-sm flex-row flex-wrap gap-2">
        {state.cards.map((card, i) => {
          const revealed = card.matchedBy !== null || state.flippedIndices.includes(i);
          return (
            <Pressable
              key={i}
              onPress={() => myTurn && !revealed && onMove({ cardIndex: i })}
              disabled={!myTurn || revealed}
              className={cn("aspect-square items-center justify-center rounded-lg border border-border", revealed ? "bg-primary/10" : "bg-primary", card.matchedBy && "opacity-50")}
              style={{ width: "22%" }}
            >
              <Text className="text-lg">{revealed ? card.symbol : ""}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
