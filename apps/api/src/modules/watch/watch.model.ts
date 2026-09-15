import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { MediaProviderId, WatchSessionStatus } from "@withu/shared-types";

export interface WatchSessionDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  hostId: Types.ObjectId;
  guestId: Types.ObjectId | null;
  media: {
    providerId: MediaProviderId;
    mediaId: string;
    title: string;
    thumbnailUrl: string | null;
    durationSeconds: number | null;
  };
  status: WatchSessionStatus;
  currentPositionSeconds: number;
  playing: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
}

export type WatchSessionHydrated = HydratedDocument<WatchSessionDoc>;

const watchSessionSchema = new Schema<WatchSessionDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    guestId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    media: {
      providerId: { type: String, required: true },
      mediaId: { type: String, required: true },
      title: { type: String, required: true },
      thumbnailUrl: { type: String, default: null },
      durationSeconds: { type: Number, default: null },
    },
    status: { type: String, default: "created" },
    currentPositionSeconds: { type: Number, default: 0 },
    playing: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

watchSessionSchema.index({ coupleId: 1, createdAt: -1 });

export const WatchSessionModel = model<WatchSessionDoc>("WatchSession", watchSessionSchema);
