import type { GamePlayerRef, GameSessionStatus, GameState } from "@withu/shared-types";

export class InvalidMoveError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidMoveError";
  }
}

export interface GameInitResult {
  state: GameState;
  firstTurnUserId: string | null;
}

export interface GameMoveResult {
  state: GameState;
  nextTurnUserId: string | null;
  status: GameSessionStatus;
  winnerId: string | null;
  isDraw: boolean;
}

export interface ApplyMoveParams {
  state: GameState;
  players: GamePlayerRef[];
  currentTurnUserId: string | null;
  playerId: string;
  payload: Record<string, unknown>;
}

/**
 * Every game plugs into the engine through this interface only. The socket
 * and REST layers never know the shape of a specific game's state - they
 * just call createInitialState/applyMove and persist whatever comes back.
 * This is what lets new games be added without touching sessions/sockets.
 */
export interface GameModule {
  createInitialState(players: GamePlayerRef[], hostId: string): GameInitResult;
  applyMove(params: ApplyMoveParams): GameMoveResult;
}

export const otherPlayer = (players: GamePlayerRef[], userId: string): GamePlayerRef | undefined =>
  players.find((p) => p.userId !== userId);
