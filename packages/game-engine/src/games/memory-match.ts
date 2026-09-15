import type { GamePlayerRef } from "@withu/shared-types";
import type { ApplyMoveParams, GameInitResult, GameModule, GameMoveResult } from "../types";
import { InvalidMoveError } from "../types";

const SYMBOLS = ["❤️", "🫂", "💋", "🌹", "✨", "🔥", "🎬", "🎵"];

interface MemoryCard {
  symbol: string;
  matchedBy: string | null;
}

interface MemoryMatchState {
  cards: MemoryCard[];
  flippedIndices: number[];
  scores: Record<string, number>;
}

function shuffledDeck(): MemoryCard[] {
  const deck = [...SYMBOLS, ...SYMBOLS].map((symbol) => ({ symbol, matchedBy: null as string | null }));
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j]!, deck[i]!];
  }
  return deck;
}

export const memoryMatchModule: GameModule = {
  createInitialState(players: GamePlayerRef[], hostId: string): GameInitResult {
    const scores: Record<string, number> = {};
    for (const p of players) scores[p.userId] = 0;
    return {
      state: { cards: shuffledDeck(), flippedIndices: [], scores } satisfies MemoryMatchState,
      firstTurnUserId: hostId,
    };
  },

  applyMove({ state, players, currentTurnUserId, playerId, payload }: ApplyMoveParams): GameMoveResult {
    const s = state as unknown as MemoryMatchState;
    if (currentTurnUserId !== playerId) {
      throw new InvalidMoveError("It's not your turn.");
    }
    const cardIndex = payload.cardIndex;
    if (typeof cardIndex !== "number" || cardIndex < 0 || cardIndex >= s.cards.length) {
      throw new InvalidMoveError("Invalid card.");
    }
    const card = s.cards[cardIndex];
    if (!card || card.matchedBy !== null) {
      throw new InvalidMoveError("That card is already matched.");
    }
    if (s.flippedIndices.includes(cardIndex)) {
      throw new InvalidMoveError("That card is already flipped.");
    }

    const cards = s.cards.map((c) => ({ ...c }));
    const other = players.find((p) => p.userId !== playerId);

    if (s.flippedIndices.length === 0) {
      return {
        state: { cards, flippedIndices: [cardIndex], scores: s.scores } satisfies MemoryMatchState,
        nextTurnUserId: playerId,
        status: "active",
        winnerId: null,
        isDraw: false,
      };
    }

    const firstIndex = s.flippedIndices[0]!;
    const firstCard = cards[firstIndex]!;
    const secondCard = cards[cardIndex]!;
    const isMatch = firstCard.symbol === secondCard.symbol;

    const scores = { ...s.scores };
    if (isMatch) {
      firstCard.matchedBy = playerId;
      secondCard.matchedBy = playerId;
      scores[playerId] = (scores[playerId] ?? 0) + 1;
    }

    const allMatched = cards.every((c) => c.matchedBy !== null);
    let winnerId: string | null = null;
    let isDraw = false;
    if (allMatched) {
      const entries = Object.entries(scores);
      entries.sort((a, b) => b[1] - a[1]);
      if (entries.length >= 2 && entries[0]![1] === entries[1]![1]) {
        isDraw = true;
      } else if (entries[0]) {
        winnerId = entries[0][0];
      }
    }

    return {
      state: { cards, flippedIndices: [], scores } satisfies MemoryMatchState,
      nextTurnUserId: allMatched ? null : isMatch ? playerId : other?.userId ?? null,
      status: allMatched ? "completed" : "active",
      winnerId,
      isDraw,
    };
  },
};
