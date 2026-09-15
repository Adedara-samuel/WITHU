import type { GameSession } from "@withu/shared-types";
import type { GameSessionHydrated } from "./game-session.model";

export function toGameSession(session: GameSessionHydrated): GameSession {
  return {
    id: session._id.toString(),
    gameKey: session.gameKey,
    coupleId: session.coupleId.toString(),
    players: session.players.map((p) => ({ userId: p.userId.toString(), name: p.name, avatarUrl: p.avatarUrl })),
    hostId: session.hostId.toString(),
    currentTurnUserId: session.currentTurnUserId ? session.currentTurnUserId.toString() : null,
    state: session.state,
    status: session.status,
    winnerId: session.winnerId ? session.winnerId.toString() : null,
    isDraw: session.isDraw,
    createdAt: session.createdAt.toISOString(),
    updatedAt: session.updatedAt.toISOString(),
    finishedAt: session.finishedAt?.toISOString() ?? null,
  };
}
