import type { Message, MessagePage } from "@withu/shared-types";
import type { EditMessageInput, SendMessageInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

export const messagesApi = {
  list: (cursor?: string) => apiFetch<MessagePage>("/api/messages", { query: { cursor } }),
  send: (input: SendMessageInput) => apiFetch<Message>("/api/messages", { method: "POST", body: input }),
  edit: (id: string, input: EditMessageInput) => apiFetch<Message>(`/api/messages/${id}`, { method: "PATCH", body: input }),
  remove: (id: string) => apiFetch<{ deleted: boolean }>(`/api/messages/${id}`, { method: "DELETE" }),
  react: (id: string, emoji: string) => apiFetch<Message>(`/api/messages/${id}/reactions`, { method: "POST", body: { emoji } }),
  removeReaction: (id: string, emoji: string) =>
    apiFetch<Message>(`/api/messages/${id}/reactions/${encodeURIComponent(emoji)}`, { method: "DELETE" }),
  search: (q: string) => apiFetch<Message[]>("/api/messages/search", { query: { q } }),
};
