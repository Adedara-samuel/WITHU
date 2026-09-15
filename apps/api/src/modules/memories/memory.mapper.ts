import type { Memory, Milestone } from "@withu/shared-types";
import type { MemoryHydrated } from "./memory.model";
import type { MilestoneHydrated } from "./milestone.model";

export function toMemory(m: MemoryHydrated): Memory {
  return {
    id: m._id.toString(),
    coupleId: m.coupleId.toString(),
    authorId: m.authorId.toString(),
    title: m.title,
    caption: m.caption,
    category: m.category,
    photo: m.photo,
    location: m.location,
    occurredOn: m.occurredOn?.toISOString() ?? null,
    createdAt: m.createdAt.toISOString(),
  };
}

export function toMilestone(m: MilestoneHydrated): Milestone {
  return {
    id: m._id.toString(),
    coupleId: m.coupleId.toString(),
    kind: m.kind,
    title: m.title,
    description: m.description,
    date: m.date.toISOString(),
    icon: m.icon,
    createdAt: m.createdAt.toISOString(),
  };
}
