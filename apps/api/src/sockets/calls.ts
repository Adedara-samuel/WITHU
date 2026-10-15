import type { CallKind } from "@withu/shared-types";
import { UserModel } from "../modules/users/user.model";
import * as coupleService from "../modules/couples/couple.service";
import { createNotification } from "../modules/notifications/notification.service";
import { sendPushToUser } from "../modules/notifications/push.service";
import { emitToUser } from "./emitter";
import type { TypedSocket } from "./types";

const RING_TIMEOUT_MS = 45_000;
// A backgrounded phone, a locked screen, or a brief network blip triggers a socket
// disconnect in as little as 20s (the Socket.IO ping timeout) well before the person
// actually left the call - give them a window to reconnect before hanging up on them.
const DISCONNECT_GRACE_MS = 30_000;

interface ActiveCall {
  callId: string;
  callerId: string;
  calleeId: string;
  coupleId: string;
  kind: CallKind;
  status: "ringing" | "active";
  ringTimeout: NodeJS.Timeout | null;
}

// Calls are ephemeral signaling, not a persisted resource - an in-memory table
// for the process is enough, mirroring how presence/typing state is handled.
const activeCalls = new Map<string, ActiveCall>();
// Pending "end call" timers from a disconnect, keyed by `${callId}:${userId}`, so a
// reconnect from that same user can cancel the hangup before it fires.
const pendingDisconnectEnds = new Map<string, NodeJS.Timeout>();

function clearRingTimeout(call: ActiveCall) {
  if (call.ringTimeout) clearTimeout(call.ringTimeout);
  call.ringTimeout = null;
}

function isUserInACall(userId: string): boolean {
  for (const call of activeCalls.values()) {
    if (call.callerId === userId || call.calleeId === userId) return true;
  }
  return false;
}

// Notifies both sides even though whoever triggered the end already knows locally -
// keeping the client's CALL_ENDED handler idempotent is simpler than tracking who to skip.
function endCall(callId: string, call: ActiveCall, reason: "ended" | "missed" | "failed") {
  clearRingTimeout(call);
  activeCalls.delete(callId);
  emitToUser(call.callerId, "CALL_ENDED", { callId, reason });
  emitToUser(call.calleeId, "CALL_ENDED", { callId, reason });
}

export function registerCallHandlers(socket: TypedSocket) {
  const { userId, coupleId } = socket.data;

  // This is a reconnect - cancel any pending hangup from a recent disconnect so an
  // in-progress call survives a brief background/lock-screen/network blip.
  for (const [key, timeout] of pendingDisconnectEnds) {
    if (key.endsWith(`:${userId}`)) {
      clearTimeout(timeout);
      pendingDisconnectEnds.delete(key);
    }
  }

  socket.on("CALL_START", async ({ callId, kind }) => {
    if (!coupleId || activeCalls.has(callId)) return;

    const calleeId = await coupleService.getPartnerId(coupleId, userId);
    if (!calleeId) {
      socket.emit("ERROR", { message: "You need a partner to call", code: "NO_PARTNER" });
      return;
    }

    // Mirrors a real phone system: if they're already on a call, the caller gets an
    // immediate busy signal instead of the callee's phone ringing on top of their call.
    if (isUserInACall(calleeId) || isUserInACall(userId)) {
      emitToUser(userId, "CALL_ENDED", { callId, reason: "busy" });
      return;
    }

    const caller = await UserModel.findById(userId).select("name");
    if (!caller) return;

    // A push alongside the socket event means the callee still hears about the call
    // if the app is backgrounded or closed, not just once it's already been missed.
    UserModel.findById(calleeId)
      .select("pushTokens")
      .then((callee) => {
        if (callee?.pushTokens.length) {
          sendPushToUser(calleeId, callee.pushTokens, {
            title: `Incoming ${kind} call`,
            body: `${caller.name} is calling you`,
            data: { type: "incoming_call", callId, kind },
          }).catch(() => undefined);
        }
      })
      .catch(() => undefined);

    const call: ActiveCall = { callId, callerId: userId, calleeId, coupleId, kind, status: "ringing", ringTimeout: null };
    call.ringTimeout = setTimeout(() => {
      const current = activeCalls.get(callId);
      if (!current || current.status !== "ringing") return;
      endCall(callId, current, "missed");
      createNotification({
        userId: current.calleeId,
        coupleId: current.coupleId,
        type: "missed_call",
        title: "Missed call",
        body: `You missed a ${current.kind} call.`,
        data: { callId, kind: current.kind },
      }).catch(() => undefined);
    }, RING_TIMEOUT_MS);

    activeCalls.set(callId, call);
    emitToUser(calleeId, "CALL_INCOMING", { callId, callerId: userId, callerName: caller.name, kind });
  });

  socket.on("CALL_RESPOND", ({ callId, accept }) => {
    const call = activeCalls.get(callId);
    if (!call || call.calleeId !== userId || call.status !== "ringing") return;

    if (accept) {
      clearRingTimeout(call);
      call.status = "active";
      emitToUser(call.callerId, "CALL_ACCEPTED", { callId });
    } else {
      activeCalls.delete(callId);
      clearRingTimeout(call);
      emitToUser(call.callerId, "CALL_DECLINED", { callId });
    }
  });

  socket.on("CALL_SIGNAL", ({ callId, signal }) => {
    const call = activeCalls.get(callId);
    if (!call) return;
    const targetId = call.callerId === userId ? call.calleeId : call.callerId;
    emitToUser(targetId, "CALL_SIGNAL", { callId, signal });
  });

  socket.on("CALL_END", ({ callId }) => {
    const call = activeCalls.get(callId);
    if (!call || (call.callerId !== userId && call.calleeId !== userId)) return;
    endCall(callId, call, "ended");
  });

  socket.on("disconnect", () => {
    for (const [callId, call] of activeCalls) {
      if (call.callerId !== userId && call.calleeId !== userId) continue;
      const key = `${callId}:${userId}`;
      const timeout = setTimeout(() => {
        pendingDisconnectEnds.delete(key);
        const current = activeCalls.get(callId);
        if (!current) return;
        endCall(callId, current, current.status === "ringing" ? "missed" : "failed");
      }, DISCONNECT_GRACE_MS);
      pendingDisconnectEnds.set(key, timeout);
    }
  });
}
