import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface GameMoveDoc {
  _id: Types.ObjectId;
  sessionId: Types.ObjectId;
  playerId: Types.ObjectId;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export type GameMoveHydrated = HydratedDocument<GameMoveDoc>;

const gameMoveSchema = new Schema<GameMoveDoc>(
  {
    sessionId: { type: Schema.Types.ObjectId, ref: "GameSession", required: true, index: true },
    playerId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    payload: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const GameMoveModel = model<GameMoveDoc>("GameMove", gameMoveSchema);
