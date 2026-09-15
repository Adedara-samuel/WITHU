import type { SendLoveDropInput } from "@withu/validation";
import type { AffectionKind } from "@withu/shared-types";
import { decodeCursor, encodeCursor } from "@withu/shared-utils";
import { AppError } from "../../common/errors";
import { getCoupleWithPartners } from "../couples/couple.service";
import { LoveDropModel } from "./love-drop.model";
import { AffectionEventModel } from "./affection-event.model";
import { createNotification } from "../notifications/notification.service";

function partnerIdFor(coupleId: string, partnerOneId: string, partnerTwoId: string | null, userId: string) {
  if (partnerOneId === userId) return partnerTwoId;
  if (partnerTwoId === userId) return partnerOneId;
  throw AppError.forbidden("You're not part of this relationship space");
}

export async function sendLoveDrop(coupleId: string, senderId: string, input: SendLoveDropInput) {
  const { partnerOne, partnerTwo } = await getCoupleWithPartners(coupleId);
  const recipientId = partnerIdFor(coupleId, partnerOne._id.toString(), partnerTwo?._id.toString() ?? null, senderId);
  if (!recipientId) throw AppError.conflict("Your partner hasn't joined your relationship space yet");

  const deliverAt = input.deliverAt ? new Date(input.deliverAt) : new Date();
  const isImmediate = deliverAt.getTime() <= Date.now();

  const loveDrop = await LoveDropModel.create({
    coupleId,
    senderId,
    recipientId,
    kind: input.kind,
    message: input.message,
    animation: input.animation ?? null,
    deliverAt,
    deliveredAt: isImmediate ? new Date() : null,
  });

  if (isImmediate) {
    await createNotification({
      userId: recipientId,
      coupleId,
      type: "love_drop",
      title: "A Love Drop just arrived 💌",
      body: input.message,
      data: { loveDropId: loveDrop._id.toString() },
    });
  }

  return loveDrop;
}

export async function listLoveDrops(coupleId: string, cursor?: string, limit = 20) {
  const decoded = decodeCursor(cursor);
  const query: Record<string, unknown> = { coupleId, deliveredAt: { $ne: null } };
  if (decoded) query._id = { $lt: decoded };

  const drops = await LoveDropModel.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);

  const hasMore = drops.length > limit;
  const page = hasMore ? drops.slice(0, limit) : drops;
  const nextCursor = hasMore ? encodeCursor(page[page.length - 1]!._id.toString()) : null;
  return { drops: page, nextCursor };
}

export async function openLoveDrop(loveDropId: string, userId: string) {
  const drop = await LoveDropModel.findById(loveDropId);
  if (!drop) throw AppError.notFound("Love Drop not found");
  if (drop.recipientId.toString() !== userId) throw AppError.forbidden("This Love Drop isn't for you");
  if (!drop.openedAt) {
    drop.openedAt = new Date();
    await drop.save();
  }
  return drop;
}

export async function recordAffection(coupleId: string, senderId: string, kind: AffectionKind) {
  const { partnerOne, partnerTwo } = await getCoupleWithPartners(coupleId);
  const recipientId = partnerIdFor(coupleId, partnerOne._id.toString(), partnerTwo?._id.toString() ?? null, senderId);

  const event = await AffectionEventModel.create({ coupleId, senderId, kind });

  if (recipientId) {
    await createNotification({
      userId: recipientId,
      coupleId,
      type: "affection",
      title: "Someone is thinking of you",
      body: `${kind.replace(/_/g, " ")} received`,
      data: { affectionId: event._id.toString(), kind },
    });
  }

  return event;
}

export async function listAffectionHistory(coupleId: string, limit = 30) {
  return AffectionEventModel.find({ coupleId }).sort({ createdAt: -1 }).limit(limit);
}
