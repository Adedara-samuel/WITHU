import type { CallKind } from "@withu/shared-types";
import { UserModel } from "../modules/users/user.model";
import * as coupleService from "../modules/couples/couple.service";
import { createNotification } from "../modules/notifications/notification.service";
import { sendPushToUser } from "../modules/notifications/push.service";
import { emitToUser } from "./emitter";
import type { TypedSocket } from "./types";

const RING_TIMEOUT_MS = 45_000;

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

function clearRingTimeout(call: ActiveCall) {
  if (call.ringTimeout) clearTimeout(call.ringTimeout);
  call.ringTimeout = null;
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

  socket.on("CALL_START", async ({ callId, kind }) => {
    if (!coupleId || activeCalls.has(callId)) return;

    const calleeId = await coupleService.getPartnerId(coupleId, userId);
    if (!calleeId) {
      socket.emit("ERROR", { message: "You need a partner to call", code: "NO_PARTNER" });
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
      endCall(callId, call, call.status === "ringing" ? "missed" : "failed");
    }
  });
}
