import * as listenService from "../modules/listen/listen.service";
import { toListenSession } from "../modules/listen/listen.mapper";
import { emitToCouple } from "./emitter";
import { listenRoom } from "./types";
import type { TypedSocket } from "./types";

export function registerListenHandlers(socket: TypedSocket) {
  const { userId, coupleId } = socket.data;

  socket.on("LISTEN_JOIN_ROOM", async ({ sessionId }) => {
    try {
      await listenService.getListenSession(sessionId, userId);
      await socket.join(listenRoom(sessionId));
    } catch {
      socket.emit("ERROR", { message: "You don't have access to that listen session." });
    }
  });

  const broadcast = async (sessionId: string, updater: () => Promise<Awaited<ReturnType<typeof listenService.getListenSession>>>) => {
    if (!coupleId) return;
    try {
      const session = await updater();
      emitToCouple(coupleId, "LISTEN_STATE_UPDATED", { session: toListenSession(session) });
    } catch (err) {
      socket.emit("ERROR", { message: err instanceof Error ? err.message : "Playback sync failed." });
    }
  };

  socket.on("LISTEN_PLAY", ({ sessionId, positionSeconds }) =>
    broadcast(sessionId, () => listenService.playListenSession(sessionId, userId, positionSeconds))
  );

  socket.on("LISTEN_PAUSE", ({ sessionId, positionSeconds }) =>
    broadcast(sessionId, () => listenService.pauseListenSession(sessionId, userId, positionSeconds))
  );

  socket.on("LISTEN_SEEK", ({ sessionId, positionSeconds }) =>
    broadcast(sessionId, () => listenService.seekListenSession(sessionId, userId, positionSeconds))
  );
}
