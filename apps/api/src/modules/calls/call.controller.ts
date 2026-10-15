import type { Request, Response } from "express";
import { ok } from "../../common/response";
import { getIceServers } from "./ice-servers.service";

export async function handleGetIceServers(_req: Request, res: Response) {
  const iceServers = await getIceServers();
  return ok(res, { iceServers });
}
