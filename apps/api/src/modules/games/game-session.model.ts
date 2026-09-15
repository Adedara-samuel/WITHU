import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { GameKey, GameSessionStatus } from "@withu/shared-types";

export interface GamePlayerRefDoc {
  userId: Types.ObjectId;
  name: string;
  avatarUrl: string | null;
}

export interface GameSessionDoc {
  _id: Types.ObjectId;
  gameKey: GameKey;
  coupleId: Types.ObjectId;
  players: GamePlayerRefDoc[];
  hostId: Types.ObjectId;
  currentTurnUserId: Types.ObjectId | null;
  state: Record<string, unknown>;
  status: GameSessionStatus;
  winnerId: Types.ObjectId | null;
  isDraw: boolean;
  createdAt: Date;
  updatedAt: Date;
  finishedAt: Date | null;
}

export type GameSessionHydrated = HydratedDocument<GameSessionDoc>;

const playerRefSchema = new Schema<GamePlayerRefDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    avatarUrl: { type: String, default: null },
  },
  { _id: false }
);

const gameSessionSchema = new Schema<GameSessionDoc>(
  {
    gameKey: { type: String, required: true },
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    players: { type: [playerRefSchema], required: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    currentTurnUserId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    state: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, default: "invited" },
    winnerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    isDraw: { type: Boolean, default: false },
    finishedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

gameSessionSchema.index({ coupleId: 1, createdAt: -1 });

export const GameSessionModel = model<GameSessionDoc>("GameSession", gameSessionSchema);
