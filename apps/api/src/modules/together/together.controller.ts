import type { Request, Response } from "express";
import { ok } from "../../common/response";
import { emitToCouple } from "../../sockets/emitter";
import * as service from "./together.service";
import { toTogetherSession } from "./together.mapper";

export async function handleGetActive(req: Request, res: Response) {
  const session = await service.getActiveSession(req.coupleId!);
  return ok(res, session ? toTogetherSession(session) : null);
}

export async function handleStart(req: Request, res: Response) {
  const session = await service.startTogetherSession(req.coupleId!, req.userId!, req.body?.activity, req.body?.activityRefId ?? null);
  emitToCouple(req.coupleId!, "TOGETHER_SESSION_STARTED", {
    coupleId: req.coupleId!,
    activity: session.activity,
    activityRefId: session.activityRefId,
  });
  return ok(res, toTogetherSession(session));
}

export async function handleUpdateActivity(req: Request, res: Response) {
  const session = await service.updateTogetherActivity(req.coupleId!, req.body.activity, req.body?.activityRefId ?? null);
  if (session) {
    emitToCouple(req.coupleId!, "TOGETHER_SESSION_STARTED", {
      coupleId: req.coupleId!,
      activity: session.activity,
      activityRefId: session.activityRefId,
    });
  }
  return ok(res, session ? toTogetherSession(session) : null);
}

export async function handleEnd(req: Request, res: Response) {
  await service.endTogetherSession(req.coupleId!);
  emitToCouple(req.coupleId!, "TOGETHER_SESSION_ENDED", { coupleId: req.coupleId! });
  return ok(res, { ended: true });
}
