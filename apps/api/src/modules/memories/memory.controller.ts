import type { Request, Response } from "express";
import { created, ok } from "../../common/response";
import * as service from "./memory.service";
import { toMemory, toMilestone } from "./memory.mapper";

export async function handleCreateMemory(req: Request, res: Response) {
  const memory = await service.createMemory(req.coupleId!, req.userId!, req.body);
  return created(res, toMemory(memory));
}

export async function handleListMemories(req: Request, res: Response) {
  const { memories, nextCursor } = await service.listMemories(
    req.coupleId!,
    req.query.cursor as string | undefined,
    undefined,
    req.query.category as string | undefined
  );
  return ok(res, { memories: memories.map(toMemory), nextCursor });
}

export async function handleDeleteMemory(req: Request, res: Response) {
  await service.deleteMemory(req.coupleId!, req.params.id!, req.userId!);
  return ok(res, { deleted: true });
}

export async function handleCreateMilestone(req: Request, res: Response) {
  const milestone = await service.createMilestone(req.coupleId!, req.body);
  return created(res, toMilestone(milestone));
}

export async function handleListMilestones(req: Request, res: Response) {
  const milestones = await service.listMilestones(req.coupleId!);
  return ok(res, milestones.map(toMilestone));
}

export async function handleDeleteMilestone(req: Request, res: Response) {
  await service.deleteMilestone(req.coupleId!, req.params.id!);
  return ok(res, { deleted: true });
}
