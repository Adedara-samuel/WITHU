import { Schema, model, Types, type HydratedDocument } from "mongoose";

export interface CoupleDoc {
  _id: Types.ObjectId;
  partnerOneId: Types.ObjectId;
  partnerTwoId: Types.ObjectId | null;
  relationshipName: string | null;
  anniversaryDate: Date | null;
  togetherSince: Date;
  settings: {
    privacy: {
      shareLastSeen: boolean;
      shareMood: boolean;
    };
  };
  /** User ids who have asked to end the relationship. Both partners must request
   * before the space is dissolved - this list is cleared if either side cancels. */
  pendingLeaveRequestedBy: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

export type CoupleHydrated = HydratedDocument<CoupleDoc>;

const coupleSchema = new Schema<CoupleDoc>(
  {
    partnerOneId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    partnerTwoId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    relationshipName: { type: String, default: null, maxlength: 60 },
    anniversaryDate: { type: Date, default: null },
    togetherSince: { type: Date, default: () => new Date() },
    settings: {
      privacy: {
        shareLastSeen: { type: Boolean, default: true },
        shareMood: { type: Boolean, default: true },
      },
    },
    pendingLeaveRequestedBy: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

coupleSchema.index({ partnerOneId: 1 });
coupleSchema.index({ partnerTwoId: 1 });

export const CoupleModel = model<CoupleDoc>("Couple", coupleSchema);
