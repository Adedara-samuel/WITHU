import { Types } from "mongoose";
import type { TogetherActivity } from "@withu/shared-types";
import { TogetherSessionModel } from "./together.model";

export async function getActiveSession(coupleId: string) {
  return TogetherSessionModel.findOne({ coupleId, endedAt: null }).sort({ startedAt: -1 });
}

export async function startTogetherSession(
  coupleId: string,
  userId: string,
  activity: TogetherActivity = "idle",
  activityRefId: string | null = null
) {
  const existing = await getActiveSession(coupleId);
  if (existing) {
    existing.activity = activity;
    existing.activityRefId = activityRefId;
    if (!existing.participantIds.some((id) => id.toString() === userId)) {
      existing.participantIds.push(new Types.ObjectId(userId));
    }
    await existing.save();
    return existing;
  }

  return TogetherSessionModel.create({
    coupleId,
    activity,
    activityRefId,
    participantIds: [userId],
  });
}

export async function updateTogetherActivity(coupleId: string, activity: TogetherActivity, activityRefId: string | null) {
  const session = await getActiveSession(coupleId);
  if (!session) return null;
  session.activity = activity;
  session.activityRefId = activityRefId;
  await session.save();
  return session;
}

export async function endTogetherSession(coupleId: string) {
  const session = await getActiveSession(coupleId);
  if (!session) return null;
  session.endedAt = new Date();
  await session.save();
  return session;
}

export async function listRecentSessions(coupleId: string, limit = 10) {
  return TogetherSessionModel.find({ coupleId }).sort({ startedAt: -1 }).limit(limit);
}
