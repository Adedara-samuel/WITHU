import type { Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "../config/env";
import { verifyAccessToken } from "../utils/jwt";
import { UserModel } from "../modules/users/user.model";
import { setIo } from "./emitter";
import { markUserOffline, markUserOnline } from "./presence";
import { registerMoodHandlers, registerTypingHandlers } from "./mood";
import { registerChatHandlers } from "./chat";
import { registerAffectionHandlers } from "./affection";
import { registerGameHandlers } from "./games";
import { registerWatchHandlers } from "./watch";
import { registerListenHandlers } from "./listen";
import { registerCallHandlers } from "./calls";
import type { TypedServer } from "./types";
import { coupleRoom, userRoom } from "./types";

export function createSocketServer(httpServer: HttpServer): TypedServer {
  const io: TypedServer = new Server(httpServer, {
    cors: { origin: env.corsOrigins, credentials: true },
    // Small heartbeat keeps presence timely without hammering flaky mobile networks.
    pingInterval: 20_000,
    pingTimeout: 20_000,
  });

  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token as string | undefined;
      if (!token) return next(new Error("Authentication required"));
      const payload = verifyAccessToken(token);
      const user = await UserModel.findById(payload.sub);
      if (!user) return next(new Error("Account no longer exists"));

      socket.data.userId = user._id.toString();
      socket.data.coupleId = user.coupleId ? user.coupleId.toString() : null;
      next();
    } catch {
      next(new Error("Invalid or expired session"));
    }
  });

  io.on("connection", async (socket) => {
    const { userId, coupleId } = socket.data;

    await socket.join(userRoom(userId));
    if (coupleId) await socket.join(coupleRoom(coupleId));
    await markUserOnline(userId, coupleId);

    registerTypingHandlers(socket);
    registerMoodHandlers(socket);
    registerChatHandlers(socket);
    registerAffectionHandlers(socket);
    registerGameHandlers(socket);
    registerWatchHandlers(socket);
    registerListenHandlers(socket);
    registerCallHandlers(socket);

    socket.on("PRESENCE_HEARTBEAT", () => {
      markUserOnline(userId, coupleId).catch(() => undefined);
    });

    socket.on("disconnect", () => {
      markUserOffline(userId, coupleId).catch(() => undefined);
    });
  });

  setIo(io);
  return io;
}
