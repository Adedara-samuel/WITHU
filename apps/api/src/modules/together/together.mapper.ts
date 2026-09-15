import type { TogetherSession } from "@withu/shared-types";
import type { TogetherSessionHydrated } from "./together.model";

export function toTogetherSession(session: TogetherSessionHydrated): TogetherSession {
  return {
    id: session._id.toString(),
    coupleId: session.coupleId.toString(),
    activity: session.activity,
    activityRefId: session.activityRefId,
    participantIds: session.participantIds.map((id) => id.toString()),
    startedAt: session.startedAt.toISOString(),
    endedAt: session.endedAt?.toISOString() ?? null,
  };
}
