import { UserModel } from "../modules/users/user.model";
import { emitToCouple } from "./emitter";

// Tracks how many live sockets each user currently has open (multiple tabs/devices)
// so presence only flips to "offline" once every connection has dropped.
const activeConnections = new Map<string, number>();

// A backgrounded phone, a locked screen, or a brief network blip all trigger a socket
// disconnect well before the user actually left - reconnecting is the common case, not
// the exception. Wait for this window before telling the partner the device went offline.
const OFFLINE_GRACE_MS = 25_000;
const pendingOffline = new Map<string, NodeJS.Timeout>();

export async function markUserOnline(userId: string, coupleId: string | null) {
  const pending = pendingOffline.get(userId);
  if (pending) {
    clearTimeout(pending);
    pendingOffline.delete(userId);
  }

  const count = (activeConnections.get(userId) ?? 0) + 1;
  activeConnections.set(userId, count);
  if (count === 1) {
    await UserModel.findByIdAndUpdate(userId, { socketPresence: "online", lastSeen: new Date() });
    if (coupleId) emitToCouple(coupleId, "USER_ONLINE", { userId, presence: "online" });
  }
}

export function scheduleUserOffline(userId: string, coupleId: string | null) {
  const count = Math.max(0, (activeConnections.get(userId) ?? 1) - 1);
  activeConnections.set(userId, count);
  if (count > 0) return; // another tab/device is still connected

  const timeout = setTimeout(async () => {
    pendingOffline.delete(userId);
    if (isUserOnline(userId)) return; // reconnected during the grace window
    const lastSeen = new Date();
    await UserModel.findByIdAndUpdate(userId, { socketPresence: "offline", lastSeen });
    if (coupleId) emitToCouple(coupleId, "USER_OFFLINE", { userId, lastSeen: lastSeen.toISOString() });
  }, OFFLINE_GRACE_MS);
  pendingOffline.set(userId, timeout);
}

export function isUserOnline(userId: string): boolean {
  return (activeConnections.get(userId) ?? 0) > 0;
}
