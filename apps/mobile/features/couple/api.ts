import type { Couple, CoupleInvitation } from "@withu/shared-types";
import type { AcceptInvitationInput, CreateCoupleInput, UpdateCoupleInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

export const coupleApi = {
  getMine: () => apiFetch<Couple>("/api/couples/me"),
  create: (input: CreateCoupleInput) => apiFetch<Couple>("/api/couples", { method: "POST", body: input }),
  update: (input: UpdateCoupleInput) => apiFetch<Couple>("/api/couples/me", { method: "PATCH", body: input }),
  leave: () => apiFetch<{ left: boolean }>("/api/couples/leave", { method: "POST" }),
  invite: (inviteeEmail?: string) =>
    apiFetch<CoupleInvitation>("/api/couples/invite", { method: "POST", body: { inviteeEmail } }),
  accept: (input: AcceptInvitationInput) => apiFetch<Couple>("/api/couples/accept", { method: "POST", body: input }),
  reject: (input: AcceptInvitationInput) =>
    apiFetch<{ rejected: boolean }>("/api/couples/reject", { method: "POST", body: input }),
};
