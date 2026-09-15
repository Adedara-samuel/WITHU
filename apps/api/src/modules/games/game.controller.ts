import type { Request, Response } from "express";
import { GAME_CATALOG } from "@withu/constants";
import { created, ok } from "../../common/response";
import { emitToCouple } from "../../sockets/emitter";
import * as service from "./game.service";
import { toGameSession } from "./game.mapper";

export async function handleListCatalog(_req: Request, res: Response) {
  return ok(res, GAME_CATALOG);
}

export async function handleCreateSession(req: Request, res: Response) {
  const session = await service.createGameSession(req.coupleId!, req.userId!, req.body.gameKey);
  const mapped = toGameSession(session);
  emitToCouple(req.coupleId!, "GAME_INVITE", { session: mapped });
  return created(res, mapped);
}

export async function handleListSessions(req: Request, res: Response) {
  const sessions = await service.listSessions(req.coupleId!);
  return ok(res, sessions.map(toGameSession));
}

export async function handleGetSession(req: Request, res: Response) {
  const session = await service.getSession(req.params.id!, req.userId!);
  return ok(res, toGameSession(session));
}

export async function handleRespondInvite(req: Request, res: Response) {
  const session = await service.respondToInvite(req.params.id!, req.userId!, req.body.accept);
  emitToCouple(req.coupleId!, "GAME_INVITE_RESPONDED", { sessionId: session._id.toString(), accepted: req.body.accept });
  emitToCouple(req.coupleId!, "GAME_STATE_UPDATED", { session: toGameSession(session) });
  return ok(res, toGameSession(session));
}

export async function handleSubmitMove(req: Request, res: Response) {
  const session = await service.applyMove(req.params.id!, req.userId!, req.body.payload);
  const mapped = toGameSession(session);
  emitToCouple(req.coupleId!, "GAME_STATE_UPDATED", { session: mapped });
  if (session.status === "completed") {
    emitToCouple(req.coupleId!, "GAME_FINISHED", { session: mapped });
  }
  return ok(res, mapped);
}

export async function handleCancelSession(req: Request, res: Response) {
  const session = await service.cancelSession(req.params.id!, req.userId!);
  emitToCouple(req.coupleId!, "GAME_STATE_UPDATED", { session: toGameSession(session) });
  return ok(res, toGameSession(session));
}
