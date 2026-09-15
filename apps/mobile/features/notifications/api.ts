import type { AppNotification, DailyChallenge } from "@withu/shared-types";
import { apiFetch } from "@/lib/api-client";

export const notificationsApi = {
  list: () => apiFetch<AppNotification[]>("/api/notifications"),
  markAllRead: () => apiFetch<{ read: boolean }>("/api/notifications/read-all", { method: "POST" }),
  getDailyChallenge: () => apiFetch<DailyChallenge>("/api/notifications/daily-challenge"),
  completeDailyChallenge: () => apiFetch<DailyChallenge>("/api/notifications/daily-challenge/complete", { method: "POST" }),
};
