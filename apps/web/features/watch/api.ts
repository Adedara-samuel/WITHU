import type { WatchSession } from "@withu/shared-types";
import type { CreateWatchSessionInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

export const watchApi = {
  listSessions: () => apiFetch<WatchSession[]>("/api/watch/sessions"),
  createSession: (input: CreateWatchSessionInput) => apiFetch<WatchSession>("/api/watch/sessions", { method: "POST", body: input }),
  getSession: (id: string) => apiFetch<WatchSession>(`/api/watch/sessions/${id}`),
  joinSession: (id: string) => apiFetch<WatchSession>(`/api/watch/sessions/${id}/join`, { method: "POST" }),
  endSession: (id: string) => apiFetch<WatchSession>(`/api/watch/sessions/${id}/end`, { method: "POST" }),
};
