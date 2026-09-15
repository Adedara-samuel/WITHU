import { Types } from "mongoose";
import type { NotificationType } from "@withu/shared-types";
import { dailyChallengeForDate } from "@withu/constants";
import { NotificationModel } from "./notification.model";
import { DailyChallengeModel } from "./daily-challenge.model";
import { emitToUser } from "../../sockets/emitter";
import { toNotification } from "./notification.mapper";
import { UserModel } from "../users/user.model";

interface CreateNotificationInput {
  userId: string;
  coupleId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

const PREFERENCE_KEY_BY_TYPE: Partial<Record<NotificationType, "messages" | "loveDrops" | "games" | "activities" | "reminders">> = {
  message: "messages",
  love_drop: "loveDrops",
  affection: "loveDrops",
  game_invite: "games",
  game_move: "games",
  watch_invite: "activities",
  listen_invite: "activities",
  together_invite: "activities",
  daily_challenge: "reminders",
  memory: "activities",
  milestone: "activities",
};

export async function createNotification(input: CreateNotificationInput) {
  const prefKey = PREFERENCE_KEY_BY_TYPE[input.type];
  if (prefKey) {
    const recipient = await UserModel.findById(input.userId).select("preferences");
    if (recipient && !recipient.preferences.notifications[prefKey]) {
      return null; // recipient opted out of this notification category
    }
  }

  const notification = await NotificationModel.create({
    userId: input.userId,
    coupleId: input.coupleId,
    type: input.type,
    title: input.title,
    body: input.body,
    data: input.data ?? {},
  });

  emitToUser(input.userId, "NOTIFICATION_RECEIVED", { notification: toNotification(notification) });
  return notification;
}

export async function listNotifications(userId: string, limit = 30) {
  return NotificationModel.find({ userId }).sort({ createdAt: -1 }).limit(limit);
}

export async function markNotificationRead(userId: string, notificationId: string) {
  await NotificationModel.updateOne({ _id: notificationId, userId }, { readAt: new Date() });
}

export async function markAllNotificationsRead(userId: string) {
  await NotificationModel.updateMany({ userId, readAt: null }, { readAt: new Date() });
}

export async function getOrCreateDailyChallenge(coupleId: string) {
  const today = new Date().toISOString().slice(0, 10);
  const existing = await DailyChallengeModel.findOne({ coupleId, date: today });
  if (existing) return existing;

  const template = dailyChallengeForDate(new Date());
  return DailyChallengeModel.create({
    coupleId,
    type: "challenge",
    title: template.title,
    description: template.description,
    date: today,
  });
}

export async function completeDailyChallenge(coupleId: string, userId: string) {
  const challenge = await getOrCreateDailyChallenge(coupleId);
  if (!challenge.completedByIds.some((id) => id.toString() === userId)) {
    challenge.completedByIds.push(new Types.ObjectId(userId));
    await challenge.save();
  }
  return challenge;
}
