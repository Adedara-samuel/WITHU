import type { GamePlayerRef } from "@withu/shared-types";
import type { ApplyMoveParams, GameInitResult, GameModule, GameMoveResult } from "../types";
import { InvalidMoveError } from "../types";

interface TicTacToeState {
  board: (string | null)[]; // length 9, holds userId of the mark owner
  marks: Record<string, "X" | "O">;
}

const LINES: [number, number, number][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: (string | null)[]): string | null {
  for (const [a, b, c] of LINES) {
    const va = board[a];
    if (va && va === board[b] && va === board[c]) return va;
  }
  return null;
}

export const ticTacToeModule: GameModule = {
  createInitialState(players: GamePlayerRef[], hostId: string): GameInitResult {
    const [p1, p2] = players;
    const marks: Record<string, "X" | "O"> = {};
    if (p1) marks[p1.userId] = "X";
    if (p2) marks[p2.userId] = "O";
    return {
      state: { board: Array<string | null>(9).fill(null), marks } satisfies TicTacToeState,
      firstTurnUserId: hostId,
    };
  },

  applyMove({ state, players, currentTurnUserId, playerId, payload }: ApplyMoveParams): GameMoveResult {
    const s = state as unknown as TicTacToeState;
    if (currentTurnUserId !== playerId) {
      throw new InvalidMoveError("It's not your turn.");
    }
    const position = payload.position;
    if (typeof position !== "number" || position < 0 || position > 8) {
      throw new InvalidMoveError("Invalid board position.");
    }
    if (s.board[position] !== null) {
      throw new InvalidMoveError("That cell is already taken.");
    }

    const board = [...s.board];
    board[position] = playerId;

    const winnerMarkOwner = checkWinner(board);
    const isFull = board.every((cell) => cell !== null);
    const other = players.find((p) => p.userId !== playerId);

    return {
      state: { board, marks: s.marks } satisfies TicTacToeState,
      nextTurnUserId: winnerMarkOwner || isFull ? null : other?.userId ?? null,
      status: winnerMarkOwner || isFull ? "completed" : "active",
      winnerId: winnerMarkOwner,
      isDraw: !winnerMarkOwner && isFull,
    };
  },
};
