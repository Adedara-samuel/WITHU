import type { Request, Response } from "express";
import { created, ok } from "../../common/response";
import { emitToCouple } from "../../sockets/emitter";
import * as service from "./watch.service";
import { toWatchSession } from "./watch.mapper";

export async function handleCreateSession(req: Request, res: Response) {
  const session = await service.createWatchSession(req.coupleId!, req.userId!, req.body);
  const mapped = toWatchSession(session);
  emitToCouple(req.coupleId!, "WATCH_INVITE", { session: mapped });
  return created(res, mapped);
}

export async function handleGetSession(req: Request, res: Response) {
  const session = await service.getWatchSession(req.params.id!, req.userId!);
  return ok(res, toWatchSession(session));
}

export async function handleListSessions(req: Request, res: Response) {
  const sessions = await service.listWatchSessions(req.coupleId!);
  return ok(res, sessions.map(toWatchSession));
}

export async function handleJoinSession(req: Request, res: Response) {
  const session = await service.joinWatchSession(req.params.id!, req.userId!);
  const mapped = toWatchSession(session);
  emitToCouple(req.coupleId!, "WATCH_STATE_UPDATED", { session: mapped });
  return ok(res, mapped);
}

export async function handleEndSession(req: Request, res: Response) {
  const session = await service.endWatchSession(req.params.id!, req.userId!);
  emitToCouple(req.coupleId!, "WATCH_ENDED", { sessionId: session._id.toString() });
  return ok(res, toWatchSession(session));
}
