import type { Request, Response } from "express";
import { created, ok } from "../../common/response";
import { emitToCouple } from "../../sockets/emitter";
import * as service from "./listen.service";
import { toListenSession } from "./listen.mapper";

export async function handleCreateSession(req: Request, res: Response) {
  const session = await service.createListenSession(req.coupleId!, req.userId!, req.body);
  const mapped = toListenSession(session);
  emitToCouple(req.coupleId!, "LISTEN_INVITE", { session: mapped });
  return created(res, mapped);
}

export async function handleGetSession(req: Request, res: Response) {
  const session = await service.getListenSession(req.params.id!, req.userId!);
  return ok(res, toListenSession(session));
}

export async function handleListSessions(req: Request, res: Response) {
  const sessions = await service.listListenSessions(req.coupleId!);
  return ok(res, sessions.map(toListenSession));
}

export async function handleJoinSession(req: Request, res: Response) {
  const session = await service.joinListenSession(req.params.id!, req.userId!);
  const mapped = toListenSession(session);
  emitToCouple(req.coupleId!, "LISTEN_STATE_UPDATED", { session: mapped });
  return ok(res, mapped);
}

export async function handleEndSession(req: Request, res: Response) {
  const session = await service.endListenSession(req.params.id!, req.userId!);
  emitToCouple(req.coupleId!, "LISTEN_ENDED", { sessionId: session._id.toString() });
  return ok(res, toListenSession(session));
}
