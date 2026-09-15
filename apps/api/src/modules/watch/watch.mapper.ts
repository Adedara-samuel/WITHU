import type { WatchSession } from "@withu/shared-types";
import type { WatchSessionHydrated } from "./watch.model";

export function toWatchSession(session: WatchSessionHydrated): WatchSession {
  return {
    id: session._id.toString(),
    coupleId: session.coupleId.toString(),
    hostId: session.hostId.toString(),
    guestId: session.guestId ? session.guestId.toString() : null,
    media: session.media,
    status: session.status,
    currentPositionSeconds: session.currentPositionSeconds,
    playing: session.playing,
    lastSyncedAt: session.lastSyncedAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}
