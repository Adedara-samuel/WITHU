import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { TogetherActivity } from "@withu/shared-types";

export interface TogetherSessionDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  activity: TogetherActivity;
  activityRefId: string | null;
  participantIds: Types.ObjectId[];
  startedAt: Date;
  endedAt: Date | null;
}

export type TogetherSessionHydrated = HydratedDocument<TogetherSessionDoc>;

const togetherSessionSchema = new Schema<TogetherSessionDoc>({
  coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
  activity: { type: String, default: "idle" },
  activityRefId: { type: String, default: null },
  participantIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  startedAt: { type: Date, default: () => new Date() },
  endedAt: { type: Date, default: null },
});

togetherSessionSchema.index({ coupleId: 1, endedAt: 1 });

export const TogetherSessionModel = model<TogetherSessionDoc>("TogetherSession", togetherSessionSchema);
