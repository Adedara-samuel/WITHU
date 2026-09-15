import type { Request, Response } from "express";
import { ok } from "../../common/response";
import * as service from "./notification.service";
import { toDailyChallenge, toNotification } from "./notification.mapper";

export async function handleListNotifications(req: Request, res: Response) {
  const notifications = await service.listNotifications(req.userId!);
  return ok(res, notifications.map(toNotification));
}

export async function handleMarkRead(req: Request, res: Response) {
  await service.markNotificationRead(req.userId!, req.params.id!);
  return ok(res, { read: true });
}

export async function handleMarkAllRead(req: Request, res: Response) {
  await service.markAllNotificationsRead(req.userId!);
  return ok(res, { read: true });
}

export async function handleGetDailyChallenge(req: Request, res: Response) {
  const challenge = await service.getOrCreateDailyChallenge(req.coupleId!);
  return ok(res, toDailyChallenge(challenge));
}

export async function handleCompleteDailyChallenge(req: Request, res: Response) {
  const challenge = await service.completeDailyChallenge(req.coupleId!, req.userId!);
  return ok(res, toDailyChallenge(challenge));
}
