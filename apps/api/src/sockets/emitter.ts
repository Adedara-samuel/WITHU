import type { ServerToClientEvents } from "@withu/shared-types";
import type { TypedServer } from "./types";
import { coupleRoom, userRoom } from "./types";

let io: TypedServer | null = null;

export function setIo(instance: TypedServer) {
  io = instance;
}

export function getIo(): TypedServer {
  if (!io) throw new Error("Socket.IO server has not been initialized yet");
  return io;
}

export function emitToCouple<E extends keyof ServerToClientEvents>(
  coupleId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
) {
  if (!io) return;
  (io.to(coupleRoom(coupleId)).emit as (event: E, ...args: Parameters<ServerToClientEvents[E]>) => void)(
    event,
    ...args
  );
}

export function emitToUser<E extends keyof ServerToClientEvents>(
  userId: string,
  event: E,
  ...args: Parameters<ServerToClientEvents[E]>
) {
  if (!io) return;
  (io.to(userRoom(userId)).emit as (event: E, ...args: Parameters<ServerToClientEvents[E]>) => void)(event, ...args);
}
