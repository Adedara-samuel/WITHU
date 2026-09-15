import { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import type { GameSession, QuestionCard } from "@withu/shared-types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";

interface AnswerBothState {
  current: QuestionCard;
  answers: Record<string, string>;
  roundIndex: number;
  totalRounds: number;
  history: { question: QuestionCard; answers: Record<string, string> }[];
}

export function AnswerBothGame({
  session,
  meId,
  onMove,
  pending,
}: {
  session: GameSession;
  meId: string;
  onMove: (payload: { choice: string }) => void;
  pending: boolean;
}) {
  const state = session.state as unknown as AnswerBothState;
  const [choice, setChoice] = useState("");
  const alreadyAnswered = !!state.answers[meId];
  const nameFor = (userId: string) => session.players.find((p) => p.userId === userId)?.name ?? "Partner";

  return (
    <View className="gap-5">
      <Text className="text-center text-xs font-sans-medium text-muted-foreground">
        Round {state.roundIndex} of {state.totalRounds}
      </Text>
      <View className="items-center rounded-2xl border border-border bg-card p-6">
        <Text className="text-center font-display text-xl text-foreground">{state.current.text}</Text>
      </View>

      {session.status === "active" && !alreadyAnswered && (
        <View className="gap-2">
          <Textarea value={choice} onChangeText={setChoice} placeholder="Your answer..." />
          <Button
            disabled={!choice.trim()}
            loading={pending}
            onPress={() => {
              onMove({ choice: choice.trim() });
              setChoice("");
            }}
          >
            Submit answer
          </Button>
        </View>
      )}
      {session.status === "active" && alreadyAnswered && (
        <Text className="text-center text-sm text-muted-foreground">Waiting for your partner's answer...</Text>
      )}

      {state.history.length > 0 && (
        <ScrollView className="max-h-64" nestedScrollEnabled>
          <Text className="mb-2 text-xs font-sans-medium uppercase text-muted-foreground">Past rounds</Text>
          {[...state.history].reverse().map((entry, i) => (
            <View key={i} className="mb-2 rounded-lg border border-border p-3">
              <Text className="text-xs text-muted-foreground">{entry.question.text}</Text>
              {Object.entries(entry.answers).map(([userId, answer]) => (
                <Text key={userId} className="mt-1 text-sm text-foreground">
                  <Text className="font-sans-medium">{nameFor(userId)}: </Text>
                  {answer}
                </Text>
              ))}
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
