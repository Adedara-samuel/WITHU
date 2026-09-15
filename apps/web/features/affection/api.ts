import type { AffectionEvent, LoveDrop } from "@withu/shared-types";
import type { SendAffectionInput, SendLoveDropInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

export const affectionApi = {
  send: (input: SendAffectionInput) => apiFetch<AffectionEvent>("/api/love-drops/affection", { method: "POST", body: input }),
  history: () => apiFetch<AffectionEvent[]>("/api/love-drops/affection/history"),
  sendLoveDrop: (input: SendLoveDropInput) => apiFetch<LoveDrop>("/api/love-drops", { method: "POST", body: input }),
  listLoveDrops: (cursor?: string) =>
    apiFetch<{ loveDrops: LoveDrop[]; nextCursor: string | null }>("/api/love-drops", { query: { cursor } }),
  openLoveDrop: (id: string) => apiFetch<LoveDrop>(`/api/love-drops/${id}/open`, { method: "POST" }),
};
