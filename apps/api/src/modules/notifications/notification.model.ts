import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { NotificationType } from "@withu/shared-types";

export interface NotificationDoc {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  coupleId: Types.ObjectId | null;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: Date | null;
  createdAt: Date;
}

export type NotificationHydrated = HydratedDocument<NotificationDoc>;

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", default: null },
    type: { type: String, required: true },
    title: { type: String, required: true, maxlength: 140 },
    body: { type: String, required: true, maxlength: 500 },
    data: { type: Schema.Types.Mixed, default: {} },
    readAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

export const NotificationModel = model<NotificationDoc>("Notification", notificationSchema);
