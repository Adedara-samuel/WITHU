import { isRecentlyActive } from "@withu/shared-utils";
import type { AuthenticatedUser, PublicUser } from "@withu/shared-types";
import type { UserHydrated } from "./user.model";

export function toPublicUser(user: UserHydrated, opts: { shareLastSeen?: boolean; shareMood?: boolean } = {}): PublicUser {
  const shareLastSeen = opts.shareLastSeen ?? true;
  const shareMood = opts.shareMood ?? true;
  const presence =
    user.socketPresence === "online" ? "online" : isRecentlyActive(user.lastSeen?.toISOString()) ? "away" : "offline";

  return {
    id: user._id.toString(),
    name: user.name,
    username: user.username,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    mood: shareMood ? user.mood : null,
    moodMessage: shareMood ? user.moodMessage : null,
    status: user.status,
    presence,
    lastSeen: shareLastSeen ? user.lastSeen?.toISOString() ?? null : null,
  };
}

export function toAuthenticatedUser(user: UserHydrated): AuthenticatedUser {
  return {
    ...toPublicUser(user),
    email: user.email,
    coupleId: user.coupleId ? user.coupleId.toString() : null,
    createdAt: user.createdAt.toISOString(),
    preferences: user.preferences,
  };
}
