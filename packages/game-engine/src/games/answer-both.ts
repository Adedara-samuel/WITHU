import type { GamePlayerRef, QuestionCard } from "@withu/shared-types";
import type { ApplyMoveParams, GameInitResult, GameModule, GameMoveResult } from "../types";
import { InvalidMoveError } from "../types";

interface AnswerBothState {
  deck: QuestionCard[];
  current: QuestionCard;
  answers: Record<string, string>;
  roundIndex: number;
  totalRounds: number;
  history: { question: QuestionCard; answers: Record<string, string> }[];
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * Games where both partners answer the same prompt independently
 * (Would You Rather, This or That). Nobody "wins" - the point is
 * comparing answers, so turns don't apply and winnerId stays null.
 */
export function createAnswerBothGame(bank: QuestionCard[], totalRounds = 8): GameModule {
  return {
    createInitialState(_players: GamePlayerRef[]): GameInitResult {
      const deck = shuffle(bank);
      const rounds = Math.min(totalRounds, deck.length);
      return {
        state: {
          deck: deck.slice(1, rounds),
          current: deck[0]!,
          answers: {},
          roundIndex: 1,
          totalRounds: rounds,
          history: [],
        } satisfies AnswerBothState,
        firstTurnUserId: null,
      };
    },

    applyMove({ state, players, playerId, payload }: ApplyMoveParams): GameMoveResult {
      const s = state as unknown as AnswerBothState;
      if (s.answers[playerId]) {
        throw new InvalidMoveError("You already answered this round.");
      }
      const choice = payload.choice;
      if (typeof choice !== "string" || choice.trim().length === 0) {
        throw new InvalidMoveError("An answer is required.");
      }

      const answers = { ...s.answers, [playerId]: choice.trim().slice(0, 300) };
      const everyoneAnswered = players.every((p) => answers[p.userId]);

      if (!everyoneAnswered) {
        return {
          state: { ...s, answers } satisfies AnswerBothState,
          nextTurnUserId: null,
          status: "active",
          winnerId: null,
          isDraw: false,
        };
      }

      const history = [...s.history, { question: s.current, answers }];

      if (s.deck.length === 0) {
        return {
          state: { ...s, answers, history } satisfies AnswerBothState,
          nextTurnUserId: null,
          status: "completed",
          winnerId: null,
          isDraw: false,
        };
      }

      return {
        state: {
          deck: s.deck.slice(1),
          current: s.deck[0]!,
          answers: {},
          roundIndex: s.roundIndex + 1,
          totalRounds: s.totalRounds,
          history,
        } satisfies AnswerBothState,
        nextTurnUserId: null,
        status: "active",
        winnerId: null,
        isDraw: false,
      };
    },
  };
}
