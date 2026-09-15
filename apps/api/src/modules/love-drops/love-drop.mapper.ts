import type { AffectionEvent, LoveDrop } from "@withu/shared-types";
import type { LoveDropHydrated } from "./love-drop.model";
import type { AffectionEventHydrated } from "./affection-event.model";

export function toLoveDrop(drop: LoveDropHydrated): LoveDrop {
  return {
    id: drop._id.toString(),
    coupleId: drop.coupleId.toString(),
    senderId: drop.senderId.toString(),
    recipientId: drop.recipientId.toString(),
    kind: drop.kind,
    message: drop.message,
    animation: drop.animation,
    deliverAt: drop.deliverAt.toISOString(),
    deliveredAt: drop.deliveredAt?.toISOString() ?? null,
    openedAt: drop.openedAt?.toISOString() ?? null,
    createdAt: drop.createdAt.toISOString(),
  };
}

export function toAffectionEvent(event: AffectionEventHydrated): AffectionEvent {
  return {
    id: event._id.toString(),
    coupleId: event.coupleId.toString(),
    senderId: event.senderId.toString(),
    kind: event.kind,
    createdAt: event.createdAt.toISOString(),
  };
}
