export type MessageType = "text" | "image" | "voice" | "system";
export type MessageStatus = "sending" | "sent" | "delivered" | "read" | "failed";

export interface MessageReaction {
  emoji: string;
  userId: string;
}

export interface MessageAttachment {
  url: string;
  thumbnailUrl: string | null;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  bytes: number | null;
}

export interface Message {
  id: string;
  coupleId: string;
  senderId: string;
  type: MessageType;
  text: string | null;
  attachment: MessageAttachment | null;
  replyToId: string | null;
  reactions: MessageReaction[];
  status: MessageStatus;
  editedAt: string | null;
  deletedAt: string | null;
  createdAt: string;
  /** present only for optimistic client-side messages awaiting server ack */
  clientTempId?: string;
}

export interface MessagePage {
  messages: Message[];
  nextCursor: string | null;
}
