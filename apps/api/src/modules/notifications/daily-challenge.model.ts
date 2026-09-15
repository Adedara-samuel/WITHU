import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { DailyChallengeType } from "@withu/shared-types";

export interface DailyChallengeDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  type: DailyChallengeType;
  title: string;
  description: string;
  refKey: string | null;
  date: string; // YYYY-MM-DD, one per couple per day
  completedByIds: Types.ObjectId[];
  createdAt: Date;
}

export type DailyChallengeHydrated = HydratedDocument<DailyChallengeDoc>;

const dailyChallengeSchema = new Schema<DailyChallengeDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true },
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    refKey: { type: String, default: null },
    date: { type: String, required: true },
    completedByIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

dailyChallengeSchema.index({ coupleId: 1, date: 1 }, { unique: true });

export const DailyChallengeModel = model<DailyChallengeDoc>("DailyChallenge", dailyChallengeSchema);
