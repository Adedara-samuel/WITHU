import { useEffect, useRef } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PartyPopper, X } from "lucide-react-native";
import { Button } from "@/components/ui/button";
import { AnswerBothGame } from "@/features/games/answer-both-game";
import { ConnectFourBoard } from "@/features/games/connect-four-board";
import { MemoryMatchBoard } from "@/features/games/memory-match-board";
import { QuestionTurnGame } from "@/features/games/question-turn-game";
import { TicTacToeBoard } from "@/features/games/tic-tac-toe-board";
import { useGameRealtime, useGameSession, useRespondGameInvite, useSubmitGameMove } from "@/features/games/hooks";
import { useAuthStore } from "@/stores/auth-store";

const TURN_GAMES = new Set(["couple_questions", "truth_or_dare", "how_well_do_you_know_me"]);
const ANSWER_BOTH_GAMES = new Set(["would_you_rather", "this_or_that"]);

export default function GameSessionScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const user = useAuthStore((s) => s.user);
  const { data: session, isLoading } = useGameSession(sessionId);
  const respond = useRespondGameInvite();
  const submitMove = useSubmitGameMove(sessionId);
  useGameRealtime(sessionId);
  const celebrated = useRef(false);

  useEffect(() => {
    if (session?.status === "completed") celebrated.current = true;
  }, [session?.status]);

  if (isLoading || !session || !user) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator color="#7A2C4C" />
      </View>
    );
  }

  const isInvitee = session.hostId !== user.id && session.status === "invited";
  const winnerName = session.winnerId ? session.players.find((p) => p.userId === session.winnerId)?.name : null;

  return (
    <SafeAreaView edges={["top"]} className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ gap: 24, padding: 16, paddingBottom: 40 }}>
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-xl capitalize text-foreground">{session.gameKey.replace(/_/g, " ")}</Text>
          <Pressable onPress={() => router.back()} hitSlop={10}>
            <X size={20} color="#6B5D63" />
          </Pressable>
        </View>

        {isInvitee && (
          <View className="items-center gap-3 rounded-2xl border border-border bg-card p-6">
            <Text className="text-center font-sans-medium text-foreground">
              {session.players.find((p) => p.userId === session.hostId)?.name} wants to play with you.
            </Text>
            <View className="flex-row gap-2">
              <Button onPress={() => respond.mutate({ id: session.id, accept: true })} loading={respond.isPending}>
                Accept
              </Button>
              <Button variant="outline" onPress={() => respond.mutate({ id: session.id, accept: false })} loading={respond.isPending}>
                Decline
              </Button>
            </View>
          </View>
        )}

        {session.status === "invited" && !isInvitee && (
          <Text className="text-center text-sm text-muted-foreground">Waiting for your partner to accept...</Text>
        )}

        {(session.status === "active" || session.status === "completed") && (
          <>
            {session.gameKey === "tic_tac_toe" && <TicTacToeBoard session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} />}
            {session.gameKey === "connect_four" && <ConnectFourBoard session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} />}
            {session.gameKey === "memory_match" && <MemoryMatchBoard session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} />}
            {TURN_GAMES.has(session.gameKey) && (
              <QuestionTurnGame session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} pending={submitMove.isPending} />
            )}
            {ANSWER_BOTH_GAMES.has(session.gameKey) && (
              <AnswerBothGame session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} pending={submitMove.isPending} />
            )}
          </>
        )}

        {session.status === "completed" && (
          <View className="items-center gap-2 rounded-2xl border border-border bg-card p-6">
            <PartyPopper size={22} color="#D9704A" />
            <Text className="font-display text-lg text-foreground">
              {session.isDraw ? "It's a draw!" : winnerName ? `${winnerName} wins!` : "Round complete"}
            </Text>
            <Button size="sm" variant="secondary" onPress={() => router.replace("/games")}>
              Play again
            </Button>
          </View>
        )}

        {session.status === "declined" && <Text className="text-center text-sm text-muted-foreground">This invitation was declined.</Text>}
      </ScrollView>
    </SafeAreaView>
  );
}
