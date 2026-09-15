import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { ListenSessionStatus } from "@withu/shared-types";

export interface ListenSessionDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  hostId: Types.ObjectId;
  guestId: Types.ObjectId | null;
  track: {
    providerId: "youtube" | "generic_url";
    trackId: string;
    title: string;
    artist: string | null;
    durationSeconds: number | null;
  };
  status: ListenSessionStatus;
  currentPositionSeconds: number;
  playing: boolean;
  lastSyncedAt: Date;
  createdAt: Date;
}

export type ListenSessionHydrated = HydratedDocument<ListenSessionDoc>;

const listenSessionSchema = new Schema<ListenSessionDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    hostId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    guestId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    track: {
      providerId: { type: String, required: true },
      trackId: { type: String, required: true },
      title: { type: String, required: true },
      artist: { type: String, default: null },
      durationSeconds: { type: Number, default: null },
    },
    status: { type: String, default: "created" },
    currentPositionSeconds: { type: Number, default: 0 },
    playing: { type: Boolean, default: false },
    lastSyncedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

listenSessionSchema.index({ coupleId: 1, createdAt: -1 });

export const ListenSessionModel = model<ListenSessionDoc>("ListenSession", listenSessionSchema);
