import type { Memory, Milestone } from "@withu/shared-types";
import type { CreateMemoryInput, CreateMilestoneInput } from "@withu/validation";
import { apiFetch } from "@/lib/api-client";

export const memoriesApi = {
  list: (cursor?: string) =>
    apiFetch<{ memories: Memory[]; nextCursor: string | null }>("/api/memories", { query: { cursor } }),
  create: (input: CreateMemoryInput) => apiFetch<Memory>("/api/memories", { method: "POST", body: input }),
  remove: (id: string) => apiFetch<{ deleted: boolean }>(`/api/memories/${id}`, { method: "DELETE" }),
  listMilestones: () => apiFetch<Milestone[]>("/api/memories/milestones"),
  createMilestone: (input: CreateMilestoneInput) => apiFetch<Milestone>("/api/memories/milestones", { method: "POST", body: input }),
  removeMilestone: (id: string) => apiFetch<{ deleted: boolean }>(`/api/memories/milestones/${id}`, { method: "DELETE" }),
};
