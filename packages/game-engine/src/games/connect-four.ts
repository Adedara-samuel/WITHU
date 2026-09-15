import type { GamePlayerRef } from "@withu/shared-types";
import type { ApplyMoveParams, GameInitResult, GameModule, GameMoveResult } from "../types";
import { InvalidMoveError } from "../types";

const ROWS = 6;
const COLS = 7;

interface ConnectFourState {
  // flat array, row-major, length ROWS*COLS, holds userId or null
  cells: (string | null)[];
  marks: Record<string, "R" | "Y">;
}

const idx = (row: number, col: number) => row * COLS + col;

function checkWinnerFrom(cells: (string | null)[], row: number, col: number): boolean {
  const owner = cells[idx(row, col)];
  if (!owner) return false;
  const directions = [
    [0, 1],
    [1, 0],
    [1, 1],
    [1, -1],
  ];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (const sign of [1, -1]) {
      let r = row + dr! * sign;
      let c = col + dc! * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && cells[idx(r, c)] === owner) {
        count++;
        r += dr! * sign;
        c += dc! * sign;
      }
    }
    if (count >= 4) return true;
  }
  return false;
}

export const connectFourModule: GameModule = {
  createInitialState(players: GamePlayerRef[], hostId: string): GameInitResult {
    const [p1, p2] = players;
    const marks: Record<string, "R" | "Y"> = {};
    if (p1) marks[p1.userId] = "R";
    if (p2) marks[p2.userId] = "Y";
    return {
      state: { cells: Array<string | null>(ROWS * COLS).fill(null), marks } satisfies ConnectFourState,
      firstTurnUserId: hostId,
    };
  },

  applyMove({ state, players, currentTurnUserId, playerId, payload }: ApplyMoveParams): GameMoveResult {
    const s = state as unknown as ConnectFourState;
    if (currentTurnUserId !== playerId) {
      throw new InvalidMoveError("It's not your turn.");
    }
    const column = payload.column;
    if (typeof column !== "number" || column < 0 || column >= COLS) {
      throw new InvalidMoveError("Invalid column.");
    }

    const cells = [...s.cells];
    let landingRow = -1;
    for (let row = ROWS - 1; row >= 0; row--) {
      if (cells[idx(row, column)] === null) {
        landingRow = row;
        break;
      }
    }
    if (landingRow === -1) {
      throw new InvalidMoveError("That column is full.");
    }

    cells[idx(landingRow, column)] = playerId;
    const won = checkWinnerFrom(cells, landingRow, column);
    const isFull = cells.every((cell) => cell !== null);
    const other = players.find((p) => p.userId !== playerId);

    return {
      state: { cells, marks: s.marks } satisfies ConnectFourState,
      nextTurnUserId: won || isFull ? null : other?.userId ?? null,
      status: won || isFull ? "completed" : "active",
      winnerId: won ? playerId : null,
      isDraw: !won && isFull,
    };
  },
};
