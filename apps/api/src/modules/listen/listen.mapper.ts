import type { ListenSession } from "@withu/shared-types";
import type { ListenSessionHydrated } from "./listen.model";

export function toListenSession(session: ListenSessionHydrated): ListenSession {
  return {
    id: session._id.toString(),
    coupleId: session.coupleId.toString(),
    hostId: session.hostId.toString(),
    guestId: session.guestId ? session.guestId.toString() : null,
    track: session.track,
    status: session.status,
    currentPositionSeconds: session.currentPositionSeconds,
    playing: session.playing,
    lastSyncedAt: session.lastSyncedAt.toISOString(),
    createdAt: session.createdAt.toISOString(),
  };
}
