import { Types } from "mongoose";
import type { CreateListenSessionInput } from "@withu/validation";
import { AppError } from "../../common/errors";
import { assertCoupleMember, getCoupleWithPartners } from "../couples/couple.service";
import { createNotification } from "../notifications/notification.service";
import { ListenSessionModel, type ListenSessionHydrated } from "./listen.model";

export function computeLivePosition(session: ListenSessionHydrated): number {
  if (!session.playing) return session.currentPositionSeconds;
  const elapsedSeconds = (Date.now() - session.lastSyncedAt.getTime()) / 1000;
  return session.currentPositionSeconds + Math.max(0, elapsedSeconds);
}

async function getSessionForMember(sessionId: string, userId: string) {
  const session = await ListenSessionModel.findById(sessionId);
  if (!session) throw AppError.notFound("Listen session not found");
  const { couple } = await getCoupleWithPartners(session.coupleId.toString());
  assertCoupleMember(couple, userId);
  return session;
}

export async function createListenSession(coupleId: string, hostId: string, input: CreateListenSessionInput) {
  const { partnerOne, partnerTwo } = await getCoupleWithPartners(coupleId);
  const session = await ListenSessionModel.create({ coupleId, hostId, track: input.track, status: "invited" });

  const guestUser = partnerOne._id.toString() === hostId ? partnerTwo : partnerOne;
  if (guestUser) {
    await createNotification({
      userId: guestUser._id.toString(),
      coupleId,
      type: "listen_invite",
      title: "Listen Together",
      body: `Come listen to "${input.track.title}" together`,
      data: { sessionId: session._id.toString() },
    });
  }
  return session;
}

export async function joinListenSession(sessionId: string, userId: string) {
  const session = await getSessionForMember(sessionId, userId);
  if (session.hostId.toString() !== userId && !session.guestId) {
    session.guestId = new Types.ObjectId(userId);
  }
  if (session.status === "invited") session.status = "active";
  await session.save();
  return session;
}

export async function getListenSession(sessionId: string, userId: string) {
  return getSessionForMember(sessionId, userId);
}

export async function listListenSessions(coupleId: string, limit = 10) {
  return ListenSessionModel.find({ coupleId }).sort({ createdAt: -1 }).limit(limit);
}

async function updatePlayback(
  sessionId: string,
  userId: string,
  patch: { playing?: boolean; positionSeconds: number; status?: ListenSessionHydrated["status"] }
) {
  const session = await getSessionForMember(sessionId, userId);
  if (session.status === "ended") throw AppError.conflict("This listen session has ended");
  session.currentPositionSeconds = Math.max(0, patch.positionSeconds);
  session.lastSyncedAt = new Date();
  if (patch.playing !== undefined) session.playing = patch.playing;
  if (patch.status) session.status = patch.status;
  await session.save();
  return session;
}

export const playListenSession = (sessionId: string, userId: string, positionSeconds: number) =>
  updatePlayback(sessionId, userId, { playing: true, positionSeconds, status: "active" });

export const pauseListenSession = (sessionId: string, userId: string, positionSeconds: number) =>
  updatePlayback(sessionId, userId, { playing: false, positionSeconds, status: "paused" });

export const seekListenSession = (sessionId: string, userId: string, positionSeconds: number) =>
  updatePlayback(sessionId, userId, { positionSeconds });

export async function endListenSession(sessionId: string, userId: string) {
  const session = await getSessionForMember(sessionId, userId);
  session.status = "ended";
  session.playing = false;
  await session.save();
  return session;
}
