import { Types } from "mongoose";
import { decodeCursor, encodeCursor } from "@withu/shared-utils";
import type { EditMessageInput, SendMessageInput } from "@withu/validation";
import { AppError } from "../../common/errors";
import { MessageModel } from "./message.model";

export async function sendMessage(coupleId: string, senderId: string, input: SendMessageInput) {
  if (input.type === "text" && (!input.text || input.text.trim().length === 0)) {
    throw AppError.badRequest("A text message needs some text.");
  }
  if ((input.type === "image" || input.type === "voice") && !input.attachment) {
    throw AppError.badRequest("This message type needs an attachment.");
  }

  try {
    return await MessageModel.create({
      coupleId,
      senderId,
      type: input.type,
      text: input.text ?? null,
      attachment: input.attachment ?? null,
      replyToId: input.replyToId ?? null,
      status: "sent",
      clientTempId: input.clientTempId ?? null,
    });
  } catch (err) {
    // A dropped response on a flaky connection can make the client retry a send that
    // actually went through - the unique (coupleId, clientTempId) index turns that
    // retry into a safe no-op that returns the original message instead of a duplicate.
    if (input.clientTempId && isDuplicateKeyError(err)) {
      const existing = await MessageModel.findOne({ coupleId, clientTempId: input.clientTempId });
      if (existing) return existing;
    }
    throw err;
  }
}

function isDuplicateKeyError(err: unknown): boolean {
  return typeof err === "object" && err !== null && "code" in err && (err as { code?: number }).code === 11000;
}

export async function listMessages(coupleId: string, cursor?: string, limit = 30) {
  const decoded = decodeCursor(cursor);
  const query: Record<string, unknown> = { coupleId };
  if (decoded) query._id = { $lt: decoded };

  const messages = await MessageModel.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasMore = messages.length > limit;
  const page = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? encodeCursor(page[page.length - 1]!._id.toString()) : null;
  return { messages: page.reverse(), nextCursor };
}

export async function searchMessages(coupleId: string, query: string, limit = 30) {
  return MessageModel.find({ coupleId, $text: { $search: query }, deletedAt: null })
    .sort({ createdAt: -1 })
    .limit(limit);
}

async function getOwnedMessage(coupleId: string, messageId: string, senderId: string) {
  const message = await MessageModel.findOne({ _id: messageId, coupleId });
  if (!message) throw AppError.notFound("Message not found");
  if (message.senderId.toString() !== senderId) throw AppError.forbidden("You can only edit your own messages");
  return message;
}

export async function editMessage(coupleId: string, messageId: string, senderId: string, input: EditMessageInput) {
  const message = await getOwnedMessage(coupleId, messageId, senderId);
  if (message.deletedAt) throw AppError.conflict("This message was deleted");
  message.text = input.text;
  message.editedAt = new Date();
  await message.save();
  return message;
}

export async function deleteMessage(coupleId: string, messageId: string, senderId: string) {
  const message = await getOwnedMessage(coupleId, messageId, senderId);
  message.deletedAt = new Date();
  message.text = null;
  message.attachment = null;
  await message.save();
  return message;
}

export async function reactToMessage(coupleId: string, messageId: string, userId: string, emoji: string) {
  const message = await MessageModel.findOne({ _id: messageId, coupleId });
  if (!message) throw AppError.notFound("Message not found");

  message.reactions = message.reactions.filter((r) => r.userId.toString() !== userId);
  message.reactions.push({ emoji, userId: new Types.ObjectId(userId) });
  await message.save();
  return message;
}

export async function removeReaction(coupleId: string, messageId: string, userId: string) {
  const message = await MessageModel.findOne({ _id: messageId, coupleId });
  if (!message) throw AppError.notFound("Message not found");
  message.reactions = message.reactions.filter((r) => r.userId.toString() !== userId);
  await message.save();
  return message;
}

export async function markReadUpTo(coupleId: string, userId: string, messageId: string) {
  // messageId can be a client-generated optimistic id (e.g. "temp-...") for a message
  // that hasn't been acked by the server yet - that's not a real ObjectId, so there's
  // nothing to mark read yet.
  if (!Types.ObjectId.isValid(messageId)) return;
  await MessageModel.updateMany(
    { coupleId, _id: { $lte: messageId }, senderId: { $ne: userId }, status: { $ne: "read" } },
    { status: "read" }
  );
}
