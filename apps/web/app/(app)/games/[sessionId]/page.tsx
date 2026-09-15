"use client";

import { useParams, useRouter } from "next/navigation";
import { Loader2, PartyPopper, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAffectionBurst } from "@/components/effects/affection-burst";
import { AnswerBothGame } from "@/features/games/components/answer-both-game";
import { ConnectFourBoard } from "@/features/games/components/connect-four-board";
import { MemoryMatchBoard } from "@/features/games/components/memory-match-board";
import { QuestionTurnGame } from "@/features/games/components/question-turn-game";
import { TicTacToeBoard } from "@/features/games/components/tic-tac-toe-board";
import { useGameRealtime, useGameSession, useRespondGameInvite, useSubmitGameMove } from "@/features/games/hooks";
import { useAuthStore } from "@/stores/auth-store";
import { useEffect, useRef } from "react";

const TURN_GAMES = new Set(["couple_questions", "truth_or_dare", "how_well_do_you_know_me"]);
const ANSWER_BOTH_GAMES = new Set(["would_you_rather", "this_or_that"]);

export default function GameSessionPage() {
  const params = useParams<{ sessionId: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: session, isLoading } = useGameSession(params.sessionId);
  const respond = useRespondGameInvite();
  const submitMove = useSubmitGameMove(params.sessionId);
  const burst = useAffectionBurst();
  useGameRealtime(params.sessionId);

  const celebrated = useRef(false);

  useEffect(() => {
    if (session?.status === "completed" && !celebrated.current) {
      celebrated.current = true;
      if (session.winnerId) burst("🎉");
    }
  }, [session?.status, session?.winnerId, burst]);

  if (isLoading || !session || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const isInvitee = session.hostId !== user.id && session.status === "invited";
  const winnerName = session.winnerId ? session.players.find((p) => p.userId === session.winnerId)?.name : null;

  return (
    <div className="mx-auto max-w-lg space-y-6 p-4 sm:p-6 lg:p-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Game</p>
          <h1 className="font-display text-xl font-medium capitalize">{session.gameKey.replace(/_/g, " ")}</h1>
        </div>
        <Button variant="ghost" size="icon" onClick={() => router.push("/games")} aria-label="Leave game">
          <X className="h-4 w-4" />
        </Button>
      </div>

      {isInvitee && (
        <div className="glass flex flex-col items-center gap-3 rounded-2xl p-6 text-center">
          <p className="font-medium">
            {session.players.find((p) => p.userId === session.hostId)?.name} wants to play with you.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => respond.mutate({ id: session.id, accept: true })} disabled={respond.isPending}>
              Accept
            </Button>
            <Button
              variant="outline"
              onClick={() => respond.mutate({ id: session.id, accept: false })}
              disabled={respond.isPending}
            >
              Decline
            </Button>
          </div>
        </div>
      )}

      {session.status === "invited" && !isInvitee && (
        <p className="text-center text-sm text-muted-foreground">Waiting for your partner to accept...</p>
      )}

      {(session.status === "active" || session.status === "completed") && (
        <>
          {session.gameKey === "tic_tac_toe" && (
            <TicTacToeBoard session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} />
          )}
          {session.gameKey === "connect_four" && (
            <ConnectFourBoard session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} />
          )}
          {session.gameKey === "memory_match" && (
            <MemoryMatchBoard session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} />
          )}
          {TURN_GAMES.has(session.gameKey) && (
            <QuestionTurnGame session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} pending={submitMove.isPending} />
          )}
          {ANSWER_BOTH_GAMES.has(session.gameKey) && (
            <AnswerBothGame session={session} meId={user.id} onMove={(p) => submitMove.mutate(p)} pending={submitMove.isPending} />
          )}
        </>
      )}

      {session.status === "completed" && (
        <div className="glass flex flex-col items-center gap-2 rounded-2xl p-6 text-center">
          <PartyPopper className="h-6 w-6 text-ember" />
          <p className="font-display text-lg">
            {session.isDraw ? "It's a draw!" : winnerName ? `${winnerName} wins!` : "Round complete"}
          </p>
          <Button size="sm" variant="secondary" onClick={() => router.push("/games")}>
            Play again
          </Button>
        </div>
      )}

      {session.status === "declined" && <p className="text-center text-sm text-muted-foreground">This invitation was declined.</p>}
    </div>
  );
}
