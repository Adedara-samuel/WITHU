import type { TogetherActivity, TogetherSession } from "@withu/shared-types";
import { apiFetch } from "@/lib/api-client";

export const togetherApi = {
  getActive: () => apiFetch<TogetherSession | null>("/api/together/active"),
  start: (activity: TogetherActivity = "idle", activityRefId: string | null = null) =>
    apiFetch<TogetherSession>("/api/together/start", { method: "POST", body: { activity, activityRefId } }),
  updateActivity: (activity: TogetherActivity, activityRefId: string | null = null) =>
    apiFetch<TogetherSession | null>("/api/together/activity", { method: "POST", body: { activity, activityRefId } }),
  end: () => apiFetch<{ ended: boolean }>("/api/together/end", { method: "POST" }),
};
