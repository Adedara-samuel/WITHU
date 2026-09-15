import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { MessageStatus, MessageType } from "@withu/shared-types";

export interface MessageAttachmentDoc {
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  bytes: number | null;
}

export interface MessageReactionDoc {
  emoji: string;
  userId: Types.ObjectId;
}

export interface MessageDoc {
  _id: Types.ObjectId;
  coupleId: Types.ObjectId;
  senderId: Types.ObjectId;
  type: MessageType;
  text: string | null;
  attachment: MessageAttachmentDoc | null;
  replyToId: Types.ObjectId | null;
  reactions: MessageReactionDoc[];
  status: MessageStatus;
  editedAt: Date | null;
  deletedAt: Date | null;
  createdAt: Date;
}

export type MessageHydrated = HydratedDocument<MessageDoc>;

const attachmentSchema = new Schema<MessageAttachmentDoc>(
  {
    url: { type: String, required: true },
    thumbnailUrl: { type: String, default: null },
    width: { type: Number, default: null },
    height: { type: Number, default: null },
    durationMs: { type: Number, default: null },
    bytes: { type: Number, default: null },
  },
  { _id: false }
);

const reactionSchema = new Schema<MessageReactionDoc>(
  {
    emoji: { type: String, required: true, maxlength: 8 },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { _id: false }
);

const messageSchema = new Schema<MessageDoc>(
  {
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true, default: "text" },
    text: { type: String, default: null, maxlength: 4000 },
    attachment: { type: attachmentSchema, default: null },
    replyToId: { type: Schema.Types.ObjectId, ref: "Message", default: null },
    reactions: { type: [reactionSchema], default: [] },
    status: { type: String, default: "sent" },
    editedAt: { type: Date, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ coupleId: 1, _id: -1 });
messageSchema.index({ coupleId: 1, text: "text" });

export const MessageModel = model<MessageDoc>("Message", messageSchema);
