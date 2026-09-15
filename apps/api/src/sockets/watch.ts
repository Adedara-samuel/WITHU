import * as watchService from "../modules/watch/watch.service";
import { toWatchSession } from "../modules/watch/watch.mapper";
import { emitToCouple } from "./emitter";
import { watchRoom } from "./types";
import type { TypedSocket } from "./types";

export function registerWatchHandlers(socket: TypedSocket) {
  const { userId, coupleId } = socket.data;

  socket.on("WATCH_JOIN_ROOM", async ({ sessionId }) => {
    try {
      await watchService.getWatchSession(sessionId, userId);
      await socket.join(watchRoom(sessionId));
    } catch {
      socket.emit("ERROR", { message: "You don't have access to that watch session." });
    }
  });

  const broadcast = async (sessionId: string, updater: () => Promise<Awaited<ReturnType<typeof watchService.getWatchSession>>>) => {
    if (!coupleId) return;
    try {
      const session = await updater();
      emitToCouple(coupleId, "WATCH_STATE_UPDATED", { session: toWatchSession(session) });
    } catch (err) {
      socket.emit("ERROR", { message: err instanceof Error ? err.message : "Playback sync failed." });
    }
  };

  socket.on("WATCH_PLAY", ({ sessionId, positionSeconds }) =>
    broadcast(sessionId, () => watchService.playWatchSession(sessionId, userId, positionSeconds))
  );

  socket.on("WATCH_PAUSE", ({ sessionId, positionSeconds }) =>
    broadcast(sessionId, () => watchService.pauseWatchSession(sessionId, userId, positionSeconds))
  );

  socket.on("WATCH_SEEK", ({ sessionId, positionSeconds }) =>
    broadcast(sessionId, () => watchService.seekWatchSession(sessionId, userId, positionSeconds))
  );

  socket.on("WATCH_SYNC_REQUEST", async ({ sessionId }) => {
    try {
      const session = await watchService.getWatchSession(sessionId, userId);
      const mapped = toWatchSession(session);
      mapped.currentPositionSeconds = watchService.computeLivePosition(session);
      socket.emit("WATCH_STATE_UPDATED", { session: mapped });
    } catch {
      socket.emit("ERROR", { message: "Could not sync this watch session." });
    }
  });
}
