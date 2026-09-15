import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { InvitationStatus } from "@withu/shared-types";

export interface CoupleInvitationDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  code: string;
  inviterId: Types.ObjectId;
  inviteeEmail: string | null;
  status: InvitationStatus;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export type CoupleInvitationHydrated = HydratedDocument<CoupleInvitationDoc>;

const invitationSchema = new Schema<CoupleInvitationDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true },
    code: { type: String, required: true, unique: true },
    inviterId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    inviteeEmail: { type: String, default: null, lowercase: true, trim: true },
    status: { type: String, default: "pending" },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

invitationSchema.index({ coupleId: 1, status: 1 });

export const CoupleInvitationModel = model<CoupleInvitationDoc>("CoupleInvitation", invitationSchema);
