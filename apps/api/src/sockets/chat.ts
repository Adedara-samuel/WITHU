import * as messageService from "../modules/messages/message.service";
import { emitToCouple } from "./emitter";
import type { TypedSocket } from "./types";

export function registerChatHandlers(socket: TypedSocket) {
  const { userId, coupleId } = socket.data;

  socket.on("MESSAGE_READ_UP_TO", async ({ coupleId: targetCoupleId, messageId }) => {
    if (!coupleId || coupleId !== targetCoupleId) return;
    await messageService.markReadUpTo(coupleId, userId, messageId);
    emitToCouple(coupleId, "MESSAGE_READ", { coupleId, userId, readUpToId: messageId });
  });
}
