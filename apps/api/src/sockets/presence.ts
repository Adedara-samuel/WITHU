import { UserModel } from "../modules/users/user.model";
import { emitToCouple } from "./emitter";

// Tracks how many live sockets each user currently has open (multiple tabs/devices)
// so presence only flips to "offline" once every connection has dropped.
const activeConnections = new Map<string, number>();

export async function markUserOnline(userId: string, coupleId: string | null) {
  const count = (activeConnections.get(userId) ?? 0) + 1;
  activeConnections.set(userId, count);
  if (count === 1) {
    await UserModel.findByIdAndUpdate(userId, { socketPresence: "online", lastSeen: new Date() });
    if (coupleId) emitToCouple(coupleId, "USER_ONLINE", { userId, presence: "online" });
  }
}

export async function markUserOffline(userId: string, coupleId: string | null) {
  const count = Math.max(0, (activeConnections.get(userId) ?? 1) - 1);
  activeConnections.set(userId, count);
  if (count === 0) {
    const lastSeen = new Date();
    await UserModel.findByIdAndUpdate(userId, { socketPresence: "offline", lastSeen });
    if (coupleId) emitToCouple(coupleId, "USER_OFFLINE", { userId, lastSeen: lastSeen.toISOString() });
  }
}

export function isUserOnline(userId: string): boolean {
  return (activeConnections.get(userId) ?? 0) > 0;
}
