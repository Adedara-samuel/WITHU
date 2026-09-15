import type { AuthenticatedUser } from "@withu/shared-types";
import type { SetMoodInput, SetStatusInput, UpdatePreferencesInput, UpdateProfileInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

export const profileApi = {
  update: (input: UpdateProfileInput) => apiFetch<AuthenticatedUser>("/api/users/me", { method: "PATCH", body: input }),
  setMood: (input: SetMoodInput) => apiFetch<AuthenticatedUser>("/api/users/me/mood", { method: "POST", body: input }),
  setStatus: (input: SetStatusInput) => apiFetch<AuthenticatedUser>("/api/users/me/status", { method: "POST", body: input }),
  updatePreferences: (input: UpdatePreferencesInput) =>
    apiFetch<AuthenticatedUser>("/api/users/me/preferences", { method: "PATCH", body: input }),
};
