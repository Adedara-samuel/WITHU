import type { GameDefinition, GameKey, GameSession } from "@withu/shared-types";
import { apiFetch } from "@/lib/api-client";

export const gamesApi = {
  catalog: () => apiFetch<GameDefinition[]>("/api/games"),
  listSessions: () => apiFetch<GameSession[]>("/api/games/sessions"),
  createSession: (gameKey: GameKey) => apiFetch<GameSession>("/api/games/sessions", { method: "POST", body: { gameKey } }),
  getSession: (id: string) => apiFetch<GameSession>(`/api/games/sessions/${id}`),
  respondInvite: (id: string, accept: boolean) =>
    apiFetch<GameSession>(`/api/games/sessions/${id}/respond`, { method: "POST", body: { accept } }),
  submitMove: (id: string, payload: Record<string, unknown>) =>
    apiFetch<GameSession>(`/api/games/sessions/${id}/moves`, { method: "POST", body: { payload } }),
  cancelSession: (id: string) => apiFetch<GameSession>(`/api/games/sessions/${id}/cancel`, { method: "POST" }),
};
