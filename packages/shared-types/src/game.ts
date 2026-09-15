export type GameCategory = "romantic" | "logical";

export type GameKey =
  | "tic_tac_toe"
  | "connect_four"
  | "memory_match"
  | "would_you_rather"
  | "truth_or_dare"
  | "this_or_that"
  | "how_well_do_you_know_me"
  | "couple_questions";

export interface GameDefinition {
  key: GameKey;
  name: string;
  category: GameCategory;
  description: string;
  icon: string;
  minPlayers: 2;
  maxPlayers: 2;
  isTurnBased: boolean;
}

export type GameSessionStatus = "invited" | "active" | "completed" | "declined" | "cancelled";

export interface GamePlayerRef {
  userId: string;
  name: string;
  avatarUrl: string | null;
}

/** Opaque, game-specific state blob. Each game module knows how to interpret it. */
export type GameState = Record<string, unknown>;

export interface GameMove {
  id: string;
  sessionId: string;
  playerId: string;
  payload: Record<string, unknown>;
  createdAt: string;
}

export interface GameSession {
  id: string;
  gameKey: GameKey;
  coupleId: string;
  players: GamePlayerRef[];
  hostId: string;
  currentTurnUserId: string | null;
  state: GameState;
  status: GameSessionStatus;
  winnerId: string | null;
  isDraw: boolean;
  createdAt: string;
  updatedAt: string;
  finishedAt: string | null;
}

export interface QuestionCard {
  id: string;
  category: "romantic" | "deep" | "funny" | "future" | "memories" | "random" | "flirty" | "serious" | "personal";
  text: string;
}
