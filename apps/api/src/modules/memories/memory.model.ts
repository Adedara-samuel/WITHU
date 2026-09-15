import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { MemoryCategory } from "@withu/shared-types";

export interface MemoryDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  authorId: Types.ObjectId;
  title: string;
  caption: string | null;
  category: MemoryCategory;
  photo: { url: string; thumbnailUrl: string; width: number; height: number } | null;
  location: string | null;
  occurredOn: Date | null;
  createdAt: Date;
}

export type MemoryHydrated = HydratedDocument<MemoryDoc>;

const memorySchema = new Schema<MemoryDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, maxlength: 120 },
    caption: { type: String, default: null, maxlength: 1000 },
    category: { type: String, default: "general" },
    photo: {
      type: new Schema(
        { url: String, thumbnailUrl: String, width: Number, height: Number },
        { _id: false }
      ),
      default: null,
    },
    location: { type: String, default: null },
    occurredOn: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

memorySchema.index({ coupleId: 1, createdAt: -1 });

export const MemoryModel = model<MemoryDoc>("Memory", memorySchema);
