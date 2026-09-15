import type { AppNotification, DailyChallenge } from "@withu/shared-types";
import type { NotificationHydrated } from "./notification.model";
import type { DailyChallengeHydrated } from "./daily-challenge.model";

export function toNotification(n: NotificationHydrated): AppNotification {
  return {
    id: n._id.toString(),
    userId: n.userId.toString(),
    coupleId: n.coupleId ? n.coupleId.toString() : null,
    type: n.type,
    title: n.title,
    body: n.body,
    data: n.data,
    readAt: n.readAt?.toISOString() ?? null,
    createdAt: n.createdAt.toISOString(),
  };
}

export function toDailyChallenge(c: DailyChallengeHydrated): DailyChallenge {
  return {
    id: c._id.toString(),
    coupleId: c.coupleId.toString(),
    type: c.type,
    title: c.title,
    description: c.description,
    refKey: c.refKey,
    date: c.date,
    completedByIds: c.completedByIds.map((id) => id.toString()),
  };
}
