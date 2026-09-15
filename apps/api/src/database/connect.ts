import mongoose from "mongoose";
import { env } from "../config/env";

let connected = false;

export async function connectDatabase(): Promise<void> {
  if (connected) return;
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.mongodbUri);
  connected = true;
  // eslint-disable-next-line no-console
  console.log(`[db] connected to ${env.mongodbUri}`);
}

export async function disconnectDatabase(): Promise<void> {
  if (!connected) return;
  await mongoose.disconnect();
  connected = false;
}
