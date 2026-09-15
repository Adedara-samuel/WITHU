import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { env } from "./config/env";
import { apiRateLimiter } from "./middleware/rateLimit";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/users/user.routes";
import coupleRoutes from "./modules/couples/couple.routes";
import messageRoutes from "./modules/messages/message.routes";
import loveDropRoutes from "./modules/love-drops/love-drop.routes";
import gameRoutes from "./modules/games/game.routes";
import memoryRoutes from "./modules/memories/memory.routes";
import togetherRoutes from "./modules/together/together.routes";
import watchRoutes from "./modules/watch/watch.routes";
import listenRoutes from "./modules/listen/listen.routes";
import notificationRoutes from "./modules/notifications/notification.routes";

export function createApp() {
  const app = express();

  app.set("trust proxy", 1);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigins, credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  if (!env.isTest) app.use(morgan(env.isProduction ? "combined" : "dev"));
  app.use(apiRateLimiter);

  app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok", time: new Date().toISOString() } }));

  app.use("/api/auth", authRoutes);
  app.use("/api/users", userRoutes);
  app.use("/api/couples", coupleRoutes);
  app.use("/api/messages", messageRoutes);
  app.use("/api/love-drops", loveDropRoutes);
  app.use("/api/games", gameRoutes);
  app.use("/api/memories", memoryRoutes);
  app.use("/api/together", togetherRoutes);
  app.use("/api/watch", watchRoutes);
  app.use("/api/listen", listenRoutes);
  app.use("/api/notifications", notificationRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
