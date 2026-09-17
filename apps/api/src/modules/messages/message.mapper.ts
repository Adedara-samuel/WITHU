import type { Message } from "@withu/shared-types";
import type { MessageHydrated } from "./message.model";

export function toMessage(m: MessageHydrated): Message {
  return {
    id: m._id.toString(),
    coupleId: m.coupleId.toString(),
    senderId: m.senderId.toString(),
    type: m.type,
    text: m.deletedAt ? null : m.text,
    attachment: m.deletedAt ? null : m.attachment,
    replyToId: m.replyToId ? m.replyToId.toString() : null,
    reactions: m.reactions.map((r) => ({ emoji: r.emoji, userId: r.userId.toString() })),
    status: m.status,
    clientTempId: m.clientTempId ?? undefined,
    editedAt: m.editedAt?.toISOString() ?? null,
    deletedAt: m.deletedAt?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}
