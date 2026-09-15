import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { AffectionKind } from "@withu/shared-types";

export interface AffectionEventDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  senderId: Types.ObjectId;
  kind: AffectionKind;
  createdAt: Date;
}

export type AffectionEventHydrated = HydratedDocument<AffectionEventDoc>;

const affectionEventSchema = new Schema<AffectionEventDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

affectionEventSchema.index({ coupleId: 1, createdAt: -1 });

export const AffectionEventModel = model<AffectionEventDoc>("AffectionEvent", affectionEventSchema);
