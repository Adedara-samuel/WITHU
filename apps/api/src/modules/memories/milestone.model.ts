import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { MilestoneKind } from "@withu/shared-types";

export interface MilestoneDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  kind: MilestoneKind;
  title: string;
  description: string | null;
  date: Date;
  icon: string;
  createdAt: Date;
}

export type MilestoneHydrated = HydratedDocument<MilestoneDoc>;

const milestoneSchema = new Schema<MilestoneDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    kind: { type: String, required: true },
    title: { type: String, required: true, maxlength: 120 },
    description: { type: String, default: null, maxlength: 500 },
    date: { type: Date, required: true },
    icon: { type: String, default: "heart" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

milestoneSchema.index({ coupleId: 1, date: 1 });

export const MilestoneModel = model<MilestoneDoc>("Milestone", milestoneSchema);
