import type { Request, Response } from "express";
import { ok } from "../../common/response";
import { emitToCouple } from "../../sockets/emitter";
import * as service from "./user.service";
import { toAuthenticatedUser } from "./user.mapper";

export async function handleGetMe(req: Request, res: Response) {
  return ok(res, toAuthenticatedUser(req.user!));
}

export async function handleUpdateMe(req: Request, res: Response) {
  const user = await service.updateProfile(req.userId!, req.body);
  return ok(res, toAuthenticatedUser(user));
}

export async function handleSetMood(req: Request, res: Response) {
  const user = await service.setMood(req.userId!, req.body);
  if (req.coupleId) {
    emitToCouple(req.coupleId, "MOOD_CHANGED", { userId: req.userId!, mood: user.mood, moodMessage: user.moodMessage });
  }
  return ok(res, toAuthenticatedUser(user));
}

export async function handleSetStatus(req: Request, res: Response) {
  const user = await service.setStatus(req.userId!, req.body);
  if (req.coupleId) {
    emitToCouple(req.coupleId, "STATUS_CHANGED", { userId: req.userId!, status: user.status });
  }
  return ok(res, toAuthenticatedUser(user));
}

export async function handleUpdatePreferences(req: Request, res: Response) {
  const user = await service.updatePreferences(req.userId!, req.body);
  return ok(res, toAuthenticatedUser(user));
}
