import type { Request, Response } from "express";
import { created, ok } from "../../common/response";
import { emitToCouple } from "../../sockets/emitter";
import * as service from "./message.service";
import { toMessage } from "./message.mapper";

export async function handleSendMessage(req: Request, res: Response) {
  const message = await service.sendMessage(req.coupleId!, req.userId!, req.body);
  const mapped = toMessage(message);
  emitToCouple(req.coupleId!, "MESSAGE_SENT", { message: mapped });
  return created(res, mapped);
}

export async function handleListMessages(req: Request, res: Response) {
  const { messages, nextCursor } = await service.listMessages(req.coupleId!, req.query.cursor as string | undefined);
  return ok(res, { messages: messages.map(toMessage), nextCursor });
}

export async function handleSearchMessages(req: Request, res: Response) {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q) return ok(res, []);
  const messages = await service.searchMessages(req.coupleId!, q);
  return ok(res, messages.map(toMessage));
}

export async function handleEditMessage(req: Request, res: Response) {
  const message = await service.editMessage(req.coupleId!, req.params.id!, req.userId!, req.body);
  const mapped = toMessage(message);
  emitToCouple(req.coupleId!, "MESSAGE_UPDATED", { message: mapped });
  return ok(res, mapped);
}

export async function handleDeleteMessage(req: Request, res: Response) {
  await service.deleteMessage(req.coupleId!, req.params.id!, req.userId!);
  emitToCouple(req.coupleId!, "MESSAGE_DELETED", { messageId: req.params.id!, coupleId: req.coupleId! });
  return ok(res, { deleted: true });
}

export async function handleReactToMessage(req: Request, res: Response) {
  const message = await service.reactToMessage(req.coupleId!, req.params.id!, req.userId!, req.body.emoji);
  const reaction = message.reactions.find((r) => r.userId.toString() === req.userId);
  if (reaction) {
    emitToCouple(req.coupleId!, "REACTION_SENT", {
      messageId: message._id.toString(),
      reaction: { emoji: reaction.emoji, userId: reaction.userId.toString() },
    });
  }
  return ok(res, toMessage(message));
}

export async function handleRemoveReaction(req: Request, res: Response) {
  const message = await service.removeReaction(req.coupleId!, req.params.id!, req.userId!);
  emitToCouple(req.coupleId!, "REACTION_REMOVED", {
    messageId: message._id.toString(),
    userId: req.userId!,
    emoji: req.params.emoji ?? "",
  });
  return ok(res, toMessage(message));
}
