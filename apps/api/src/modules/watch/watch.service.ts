import { Types } from "mongoose";
import type { CreateWatchSessionInput } from "@withu/validation";
import { AppError } from "../../common/errors";
import { assertCoupleMember, getCoupleWithPartners } from "../couples/couple.service";
import { createNotification } from "../notifications/notification.service";
import { WatchSessionModel, type WatchSessionHydrated } from "./watch.model";

/** Position the media would be at *right now* if it has kept playing since the last sync point. */
export function computeLivePosition(session: WatchSessionHydrated): number {
  if (!session.playing) return session.currentPositionSeconds;
  const elapsedSeconds = (Date.now() - session.lastSyncedAt.getTime()) / 1000;
  return session.currentPositionSeconds + Math.max(0, elapsedSeconds);
}

async function getSessionForMember(sessionId: string, userId: string) {
  const session = await WatchSessionModel.findById(sessionId);
  if (!session) throw AppError.notFound("Watch session not found");
  const { couple } = await getCoupleWithPartners(session.coupleId.toString());
  assertCoupleMember(couple, userId);
  return session;
}

export async function createWatchSession(coupleId: string, hostId: string, input: CreateWatchSessionInput) {
  const { partnerOne, partnerTwo } = await getCoupleWithPartners(coupleId);
  const session = await WatchSessionModel.create({
    coupleId,
    hostId,
    media: input.media,
    status: "invited",
  });

  const guestUser = partnerOne._id.toString() === hostId ? partnerTwo : partnerOne;
  if (guestUser) {
    await createNotification({
      userId: guestUser._id.toString(),
      coupleId,
      type: "watch_invite",
      title: "Watch Together",
      body: `Come watch "${input.media.title}" together`,
      data: { sessionId: session._id.toString() },
    });
  }

  return session;
}

export async function joinWatchSession(sessionId: string, userId: string) {
  const session = await getSessionForMember(sessionId, userId);
  if (session.hostId.toString() !== userId && !session.guestId) {
    session.guestId = new Types.ObjectId(userId);
  }
  if (session.status === "invited") session.status = "active";
  await session.save();
  return session;
}

export async function getWatchSession(sessionId: string, userId: string) {
  return getSessionForMember(sessionId, userId);
}

export async function listWatchSessions(coupleId: string, limit = 10) {
  return WatchSessionModel.find({ coupleId }).sort({ createdAt: -1 }).limit(limit);
}

async function updatePlayback(
  sessionId: string,
  userId: string,
  patch: { playing?: boolean; positionSeconds: number; status?: WatchSessionHydrated["status"] }
) {
  const session = await getSessionForMember(sessionId, userId);
  if (session.status === "ended") throw AppError.conflict("This watch session has ended");

  session.currentPositionSeconds = Math.max(0, patch.positionSeconds);
  session.lastSyncedAt = new Date();
  if (patch.playing !== undefined) session.playing = patch.playing;
  if (patch.status) session.status = patch.status;
  await session.save();
  return session;
}

export const playWatchSession = (sessionId: string, userId: string, positionSeconds: number) =>
  updatePlayback(sessionId, userId, { playing: true, positionSeconds, status: "active" });

export const pauseWatchSession = (sessionId: string, userId: string, positionSeconds: number) =>
  updatePlayback(sessionId, userId, { playing: false, positionSeconds, status: "paused" });

export const seekWatchSession = (sessionId: string, userId: string, positionSeconds: number) =>
  updatePlayback(sessionId, userId, { positionSeconds });

export async function endWatchSession(sessionId: string, userId: string) {
  const session = await getSessionForMember(sessionId, userId);
  session.status = "ended";
  session.playing = false;
  await session.save();
  return session;
}
