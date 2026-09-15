import * as gameService from "../modules/games/game.service";
import { toGameSession } from "../modules/games/game.mapper";
import { emitToCouple } from "./emitter";
import { gameRoom } from "./types";
import type { TypedSocket } from "./types";

export function registerGameHandlers(socket: TypedSocket) {
  const { userId, coupleId } = socket.data;

  socket.on("GAME_JOIN_ROOM", async ({ sessionId }) => {
    try {
      await gameService.getSession(sessionId, userId);
      await socket.join(gameRoom(sessionId));
    } catch {
      socket.emit("ERROR", { message: "You don't have access to that game session." });
    }
  });

  socket.on("GAME_MOVE", async ({ sessionId, payload }) => {
    if (!coupleId) return;
    try {
      const session = await gameService.applyMove(sessionId, userId, payload);
      const mapped = toGameSession(session);
      emitToCouple(coupleId, "GAME_STATE_UPDATED", { session: mapped });
      if (session.status === "completed") {
        emitToCouple(coupleId, "GAME_FINISHED", { session: mapped });
      }
    } catch (err) {
      socket.emit("ERROR", { message: err instanceof Error ? err.message : "Invalid move." });
    }
  });
}
