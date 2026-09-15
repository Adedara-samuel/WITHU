import { Types } from "mongoose";
import { getGameModule, InvalidMoveError } from "@withu/game-engine";
import type { GameKey } from "@withu/shared-types";
import { AppError } from "../../common/errors";
import { getCoupleWithPartners } from "../couples/couple.service";
import { GameSessionModel } from "./game-session.model";
import { GameMoveModel } from "./game-move.model";
import { createNotification } from "../notifications/notification.service";

export async function createGameSession(coupleId: string, hostId: string, gameKey: GameKey) {
  const { partnerOne, partnerTwo } = await getCoupleWithPartners(coupleId);
  if (!partnerTwo) throw AppError.conflict("Your partner hasn't joined your relationship space yet");

  const players = [partnerOne, partnerTwo].map((p) => ({
    userId: p._id,
    name: p.name,
    avatarUrl: p.avatarUrl,
  }));

  const gameModule = getGameModule(gameKey);
  const { state, firstTurnUserId } = gameModule.createInitialState(
    players.map((p) => ({ userId: p.userId.toString(), name: p.name, avatarUrl: p.avatarUrl })),
    hostId
  );

  const session = await GameSessionModel.create({
    gameKey,
    coupleId,
    players,
    hostId,
    currentTurnUserId: firstTurnUserId,
    state,
    status: "invited",
  });

  const opponentId = partnerOne._id.toString() === hostId ? partnerTwo._id.toString() : partnerOne._id.toString();
  await createNotification({
    userId: opponentId,
    coupleId,
    type: "game_invite",
    title: "Game invitation",
    body: `${players.find((p) => p.userId.toString() === hostId)?.name ?? "Your partner"} wants to play ${gameKey.replace(/_/g, " ")}`,
    data: { sessionId: session._id.toString(), gameKey },
  });

  return session;
}

async function getSessionForMember(sessionId: string, userId: string) {
  const session = await GameSessionModel.findById(sessionId);
  if (!session) throw AppError.notFound("Game session not found");
  if (!session.players.some((p) => p.userId.toString() === userId)) {
    throw AppError.forbidden("You're not a player in this game");
  }
  return session;
}

export async function respondToInvite(sessionId: string, userId: string, accept: boolean) {
  const session = await getSessionForMember(sessionId, userId);
  if (session.status !== "invited") throw AppError.conflict("This invitation is no longer pending");
  if (session.hostId.toString() === userId) throw AppError.badRequest("You can't respond to your own invitation");

  session.status = accept ? "active" : "declined";
  await session.save();
  return session;
}

export async function getSession(sessionId: string, userId: string) {
  return getSessionForMember(sessionId, userId);
}

export async function listSessions(coupleId: string, limit = 20) {
  return GameSessionModel.find({ coupleId }).sort({ createdAt: -1 }).limit(limit);
}

export async function applyMove(sessionId: string, userId: string, payload: Record<string, unknown>) {
  const session = await getSessionForMember(sessionId, userId);
  if (session.status !== "active") throw AppError.conflict("This game isn't active");

  const gameModule = getGameModule(session.gameKey);
  const players = session.players.map((p) => ({ userId: p.userId.toString(), name: p.name, avatarUrl: p.avatarUrl }));

  let result;
  try {
    result = gameModule.applyMove({
      state: session.state,
      players,
      currentTurnUserId: session.currentTurnUserId ? session.currentTurnUserId.toString() : null,
      playerId: userId,
      payload,
    });
  } catch (err) {
    if (err instanceof InvalidMoveError) throw AppError.badRequest(err.message);
    throw err;
  }

  await GameMoveModel.create({ sessionId: session._id, playerId: userId, payload });

  session.state = result.state;
  session.currentTurnUserId = result.nextTurnUserId ? new Types.ObjectId(result.nextTurnUserId) : null;
  session.status = result.status;
  session.winnerId = result.winnerId ? new Types.ObjectId(result.winnerId) : null;
  session.isDraw = result.isDraw;
  if (result.status === "completed") session.finishedAt = new Date();
  await session.save();

  return session;
}

export async function cancelSession(sessionId: string, userId: string) {
  const session = await getSessionForMember(sessionId, userId);
  if (session.status === "completed") throw AppError.conflict("This game has already finished");
  session.status = "cancelled";
  await session.save();
  return session;
}
