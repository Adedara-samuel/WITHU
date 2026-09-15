import type { ListenSession } from "@withu/shared-types";
import type { CreateListenSessionInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

export const listenApi = {
  listSessions: () => apiFetch<ListenSession[]>("/api/listen/sessions"),
  createSession: (input: CreateListenSessionInput) => apiFetch<ListenSession>("/api/listen/sessions", { method: "POST", body: input }),
  getSession: (id: string) => apiFetch<ListenSession>(`/api/listen/sessions/${id}`),
  joinSession: (id: string) => apiFetch<ListenSession>(`/api/listen/sessions/${id}/join`, { method: "POST" }),
  endSession: (id: string) => apiFetch<ListenSession>(`/api/listen/sessions/${id}/end`, { method: "POST" }),
};
