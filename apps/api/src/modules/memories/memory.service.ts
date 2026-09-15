import { decodeCursor, encodeCursor } from "@withu/shared-utils";
import type { CreateMemoryInput, CreateMilestoneInput } from "@withu/validation";
import { AppError } from "../../common/errors";
import { getCoupleWithPartners } from "../couples/couple.service";
import { createNotification } from "../notifications/notification.service";
import { MemoryModel } from "./memory.model";
import { MilestoneModel } from "./milestone.model";

export async function createMemory(coupleId: string, authorId: string, input: CreateMemoryInput) {
  const memory = await MemoryModel.create({
    coupleId,
    authorId,
    title: input.title,
    caption: input.caption ?? null,
    category: input.category,
    photo: input.photo ?? null,
    location: input.location ?? null,
    occurredOn: input.occurredOn ? new Date(input.occurredOn) : null,
  });

  const { partnerOne, partnerTwo } = await getCoupleWithPartners(coupleId);
  const recipient = partnerOne._id.toString() === authorId ? partnerTwo : partnerOne;
  if (recipient) {
    await createNotification({
      userId: recipient._id.toString(),
      coupleId,
      type: "memory",
      title: "A new memory was added",
      body: memory.title,
      data: { memoryId: memory._id.toString() },
    });
  }

  return memory;
}

export async function listMemories(coupleId: string, cursor?: string, limit = 20, category?: string) {
  const decoded = decodeCursor(cursor);
  const query: Record<string, unknown> = { coupleId };
  if (category) query.category = category;
  if (decoded) query._id = { $lt: decoded };

  const memories = await MemoryModel.find(query)
    .sort({ _id: -1 })
    .limit(limit + 1);
  const hasMore = memories.length > limit;
  const page = hasMore ? memories.slice(0, limit) : memories;
  const nextCursor = hasMore ? encodeCursor(page[page.length - 1]!._id.toString()) : null;
  return { memories: page, nextCursor };
}

export async function deleteMemory(coupleId: string, memoryId: string, authorId: string) {
  const memory = await MemoryModel.findOne({ _id: memoryId, coupleId });
  if (!memory) throw AppError.notFound("Memory not found");
  if (memory.authorId.toString() !== authorId) throw AppError.forbidden("You can only remove memories you added");
  await memory.deleteOne();
}

export async function createMilestone(coupleId: string, input: CreateMilestoneInput) {
  return MilestoneModel.create({
    coupleId,
    kind: input.kind,
    title: input.title,
    description: input.description ?? null,
    date: new Date(input.date),
    icon: input.icon,
  });
}

export async function listMilestones(coupleId: string) {
  return MilestoneModel.find({ coupleId }).sort({ date: 1 });
}

export async function deleteMilestone(coupleId: string, milestoneId: string) {
  const milestone = await MilestoneModel.findOneAndDelete({ _id: milestoneId, coupleId });
  if (!milestone) throw AppError.notFound("Milestone not found");
}
