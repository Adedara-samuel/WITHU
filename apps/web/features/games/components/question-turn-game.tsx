"use client";

import { useState } from "react";
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
    <div className="space-y-5">
      <div className="text-center text-xs font-medium text-muted-foreground">
        Round {state.roundIndex} of {state.totalRounds}
      </div>
      <div className="glass rounded-2xl p-6 text-center">
        <p className="text-xs uppercase tracking-wide text-primary">{state.current.category}</p>
        <p className="mt-2 font-display text-xl">{state.current.text}</p>
      </div>

      {myTurn ? (
        <div className="space-y-2">
          <Textarea value={response} onChange={(e) => setResponse(e.target.value)} placeholder="Your answer..." />
          <Button
            className="w-full"
            disabled={!response.trim() || pending}
            onClick={() => {
              onMove({ response: response.trim() });
              setResponse("");
            }}
          >
            Answer
          </Button>
        </div>
      ) : (
        session.status === "active" && (
          <p className="text-center text-sm text-muted-foreground">Waiting for {session.currentTurnUserId ? nameFor(session.currentTurnUserId) : "your partner"} to answer...</p>
        )
      )}

      {state.history.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">History</p>
          {[...state.history].reverse().map((entry, i) => (
            <div key={i} className="rounded-lg border border-border p-3 text-sm">
              <p className="text-xs text-muted-foreground">{entry.question.text}</p>
              <p className="mt-1">
                <span className="font-medium">{nameFor(entry.answeredBy)}:</span> {entry.response}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
