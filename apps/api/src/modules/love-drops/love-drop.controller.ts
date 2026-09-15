import type { Request, Response } from "express";
import { created, ok } from "../../common/response";
import { emitToCouple } from "../../sockets/emitter";
import * as service from "./love-drop.service";
import { toAffectionEvent, toLoveDrop } from "./love-drop.mapper";

export async function handleSendLoveDrop(req: Request, res: Response) {
  const drop = await service.sendLoveDrop(req.coupleId!, req.userId!, req.body);
  if (drop.deliveredAt) {
    emitToCouple(req.coupleId!, "LOVE_DROP_SENT", { loveDrop: toLoveDrop(drop) });
  }
  return created(res, toLoveDrop(drop));
}

export async function handleListLoveDrops(req: Request, res: Response) {
  const { drops, nextCursor } = await service.listLoveDrops(req.coupleId!, req.query.cursor as string | undefined);
  return ok(res, { loveDrops: drops.map(toLoveDrop), nextCursor });
}

export async function handleOpenLoveDrop(req: Request, res: Response) {
  const drop = await service.openLoveDrop(req.params.id!, req.userId!);
  emitToCouple(req.coupleId!, "LOVE_DROP_OPENED", { loveDropId: drop._id.toString(), openedAt: drop.openedAt!.toISOString() });
  return ok(res, toLoveDrop(drop));
}

export async function handleSendAffection(req: Request, res: Response) {
  const event = await service.recordAffection(req.coupleId!, req.userId!, req.body.kind);
  const mapped = toAffectionEvent(event);
  emitToCouple(req.coupleId!, "AFFECTION_SENT", mapped);
  return created(res, mapped);
}

export async function handleListAffectionHistory(req: Request, res: Response) {
  const events = await service.listAffectionHistory(req.coupleId!);
  return ok(res, events.map(toAffectionEvent));
}
