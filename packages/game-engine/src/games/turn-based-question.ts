import type { GamePlayerRef, QuestionCard } from "@withu/shared-types";
import type { ApplyMoveParams, GameInitResult, GameModule, GameMoveResult } from "../types";
import { InvalidMoveError, otherPlayer } from "../types";

interface TurnBasedQuestionState {
  deck: QuestionCard[];
  current: QuestionCard;
  roundIndex: number;
  totalRounds: number;
  history: { question: QuestionCard; answeredBy: string; response: string }[];
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
 * Games where partners alternate answering a drawn card (Couple Questions,
 * Truth or Dare, How Well Do You Know Me). One question per turn, then the
 * turn passes - same pattern for every question-bank-driven romantic game.
 */
export function createTurnBasedQuestionGame(bank: QuestionCard[], totalRounds = 8): GameModule {
  return {
    createInitialState(_players: GamePlayerRef[], hostId: string): GameInitResult {
      const deck = shuffle(bank);
      const rounds = Math.min(totalRounds, deck.length);
      return {
        state: {
          deck: deck.slice(1, rounds),
          current: deck[0]!,
          roundIndex: 1,
          totalRounds: rounds,
          history: [],
        } satisfies TurnBasedQuestionState,
        firstTurnUserId: hostId,
      };
    },

    applyMove({ state, players, currentTurnUserId, playerId, payload }: ApplyMoveParams): GameMoveResult {
      const s = state as unknown as TurnBasedQuestionState;
      if (currentTurnUserId !== playerId) {
        throw new InvalidMoveError("It's not your turn.");
      }
      const response = payload.response;
      if (typeof response !== "string" || response.trim().length === 0) {
        throw new InvalidMoveError("A response is required.");
      }

      const history = [
        ...s.history,
        { question: s.current, answeredBy: playerId, response: response.trim().slice(0, 500) },
      ];
      const next = otherPlayer(players, playerId);

      if (s.deck.length === 0) {
        return {
          state: { ...s, history } satisfies TurnBasedQuestionState,
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
          roundIndex: s.roundIndex + 1,
          totalRounds: s.totalRounds,
          history,
        } satisfies TurnBasedQuestionState,
        nextTurnUserId: next?.userId ?? null,
        status: "active",
        winnerId: null,
        isDraw: false,
      };
    },
  };
}
