import http from "http";
import { createApp } from "./app";
import { createSocketServer } from "./sockets";
import { connectDatabase } from "./database/connect";
import { env } from "./config/env";

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
