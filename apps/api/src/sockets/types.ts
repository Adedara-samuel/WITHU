import type { Server, Socket } from "socket.io";
import type {
  ClientToServerEvents,
  InterServerEvents,
  ServerToClientEvents,
  SocketData,
} from "@withu/shared-types";

export type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;
export type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

export const userRoom = (userId: string) => `user:${userId}`;
export const coupleRoom = (coupleId: string) => `couple:${coupleId}`;
export const gameRoom = (sessionId: string) => `game:${sessionId}`;
export const watchRoom = (sessionId: string) => `watch:${sessionId}`;
export const listenRoom = (sessionId: string) => `listen:${sessionId}`;
