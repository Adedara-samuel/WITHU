import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { LoveDropKind } from "@withu/shared-types";

export interface LoveDropDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  senderId: Types.ObjectId;
  recipientId: Types.ObjectId;
  kind: LoveDropKind;
  message: string;
  animation: string | null;
  deliverAt: Date;
  deliveredAt: Date | null;
  openedAt: Date | null;
  createdAt: Date;
}

export type LoveDropHydrated = HydratedDocument<LoveDropDoc>;

const loveDropSchema = new Schema<LoveDropDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recipientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    kind: { type: String, required: true },
    message: { type: String, required: true, maxlength: 500 },
    animation: { type: String, default: null },
    deliverAt: { type: Date, required: true, index: true },
    deliveredAt: { type: Date, default: null },
    openedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

loveDropSchema.index({ coupleId: 1, createdAt: -1 });

export const LoveDropModel = model<LoveDropDoc>("LoveDrop", loveDropSchema);
