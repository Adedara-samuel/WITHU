"use client";

import { useState } from "react";
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
    <div className="space-y-5">
      <div className="text-center text-xs font-medium text-muted-foreground">
        Round {state.roundIndex} of {state.totalRounds}
      </div>
      <div className="glass rounded-2xl p-6 text-center">
        <p className="mt-1 font-display text-xl">{state.current.text}</p>
      </div>

      {session.status === "active" && !alreadyAnswered && (
        <div className="space-y-2">
          <Textarea value={choice} onChange={(e) => setChoice(e.target.value)} placeholder="Your answer..." />
          <Button
            className="w-full"
            disabled={!choice.trim() || pending}
            onClick={() => {
              onMove({ choice: choice.trim() });
              setChoice("");
            }}
          >
            Submit answer
          </Button>
        </div>
      )}
      {session.status === "active" && alreadyAnswered && (
        <p className="text-center text-sm text-muted-foreground">Waiting for your partner's answer...</p>
      )}

      {state.history.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase text-muted-foreground">Past rounds</p>
          {[...state.history].reverse().map((entry, i) => (
            <div key={i} className="rounded-lg border border-border p-3 text-sm">
              <p className="text-xs text-muted-foreground">{entry.question.text}</p>
              {Object.entries(entry.answers).map(([userId, answer]) => (
                <p key={userId} className="mt-1">
                  <span className="font-medium">{nameFor(userId)}:</span> {answer}
                </p>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
