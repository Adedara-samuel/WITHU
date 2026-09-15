import * as loveDropService from "../modules/love-drops/love-drop.service";
import { toAffectionEvent } from "../modules/love-drops/love-drop.mapper";
import { emitToCouple } from "./emitter";
import type { TypedSocket } from "./types";

export function registerAffectionHandlers(socket: TypedSocket) {
  const { userId, coupleId } = socket.data;

  socket.on("AFFECTION_SEND", async ({ coupleId: targetCoupleId, kind }) => {
    if (!coupleId || coupleId !== targetCoupleId) {
      socket.emit("ERROR", { message: "You can only send affection within your own relationship space." });
      return;
    }
    const event = await loveDropService.recordAffection(coupleId, userId, kind);
    emitToCouple(coupleId, "AFFECTION_SENT", toAffectionEvent(event));
  });
}
