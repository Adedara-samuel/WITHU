import * as userService from "../modules/users/user.service";
import { emitToCouple } from "./emitter";
import type { TypedSocket } from "./types";

export function registerMoodHandlers(socket: TypedSocket) {
  const { userId, coupleId } = socket.data;

  socket.on("MOOD_SET", async ({ mood, moodMessage }) => {
    await userService.setMood(userId, { mood, moodMessage: moodMessage ?? null });
    if (coupleId) emitToCouple(coupleId, "MOOD_CHANGED", { userId, mood, moodMessage: moodMessage ?? null });
  });

  socket.on("STATUS_SET", async ({ status }) => {
    await userService.setStatus(userId, { status });
    if (coupleId) emitToCouple(coupleId, "STATUS_CHANGED", { userId, status });
  });
}

export function registerTypingHandlers(socket: TypedSocket) {
  const { userId } = socket.data;

  socket.on("TYPING_START", ({ coupleId }) => {
    emitToCouple(coupleId, "TYPING_STARTED", { coupleId, userId });
  });

  socket.on("TYPING_STOP", ({ coupleId }) => {
    emitToCouple(coupleId, "TYPING_STOPPED", { coupleId, userId });
  });
}
