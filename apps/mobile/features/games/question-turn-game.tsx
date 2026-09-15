import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { GameSession, QuestionCard } from "@withu/shared-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

interface TurnState {
  current: QuestionCard;
  roundIndex: number;
  totalRounds: number;
  history: { question: QuestionCard; answeredBy: string; response: string }[];
}

export function QuestionTurnGame({
  session,
  meId,
  onMove,
  pending,
}: {
  session: GameSession;
  meId: string;
  onMove: (payload: { response: string }) => void;
  pending: boolean;
}) {
  const state = session.state as unknown as TurnState;
  const myTurn = session.currentTurnUserId === meId && session.status === "active";
  const [response, setResponse] = useState("");
  const nameFor = (userId: string) => session.players.find((p) => p.userId === userId)?.name ?? "Partner";

  return (
    <View className="gap-5">
      <Text className="text-center text-xs font-sans-medium text-muted-foreground">
        Round {state.roundIndex} of {state.totalRounds}
      </Text>
      <View className="items-center rounded-2xl border border-border bg-card p-6">
        <Text className="text-xs uppercase text-primary">{state.current.category}</Text>
        <Text className="mt-2 text-center font-display text-xl text-foreground">{state.current.text}</Text>
      </View>

      {myTurn ? (
        <View className="gap-2">
          <Textarea value={response} onChangeText={setResponse} placeholder="Your answer..." />
          <Button
            disabled={!response.trim()}
            loading={pending}
            onPress={() => {
              onMove({ response: response.trim() });
              setResponse("");
            }}
          >
            Answer
          </Button>
        </View>
      ) : (
        session.status === "active" && (
          <Text className="text-center text-sm text-muted-foreground">
            Waiting for {session.currentTurnUserId ? nameFor(session.currentTurnUserId) : "your partner"} to answer...
          </Text>
        )
      )}

      {state.history.length > 0 && (
        <ScrollView className="max-h-64" nestedScrollEnabled>
          <Text className="mb-2 text-xs font-sans-medium uppercase text-muted-foreground">History</Text>
          {[...state.history].reverse().map((entry, i) => (
            <View key={i} className="mb-2 rounded-lg border border-border p-3">
              <Text className="text-xs text-muted-foreground">{entry.question.text}</Text>
              <Text className="mt-1 text-sm text-foreground">
                <Text className="font-sans-medium">{nameFor(entry.answeredBy)}: </Text>
                {entry.response}
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
