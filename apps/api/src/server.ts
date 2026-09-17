import http from "http";
import { createApp } from "./app";
import { createSocketServer } from "./sockets";
import { connectDatabase } from "./database/connect";
import { env } from "./config/env";

// Socket.IO event handlers (unlike HTTP routes, which go through asyncHandler) have no
// built-in error boundary - one bad/malformed event throwing was enough to crash the
// whole process for both people in the couple. Log and keep running instead.
process.on("unhandledRejection", (err) => {
  // eslint-disable-next-line no-console
  console.error("[api] Unhandled rejection (recovered)", err);
});
process.on("uncaughtException", (err) => {
  // eslint-disable-next-line no-console
  console.error("[api] Uncaught exception (recovered)", err);
});

async function main() {
  await connectDatabase();

  const app = createApp();
  const httpServer = http.createServer(app);
  createSocketServer(httpServer);

  httpServer.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`[api] WITHU server listening on port ${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("[api] Failed to start server", err);
  process.exit(1);
});
