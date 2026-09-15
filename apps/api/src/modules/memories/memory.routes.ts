import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { createMemorySchema, createMilestoneSchema } from "@withu/validation";
import * as controller from "./memory.controller";

const router = Router();

router.use(requireAuth, requireCouple);

router.get("/", asyncHandler(controller.handleListMemories));
router.post("/", validateBody(createMemorySchema), asyncHandler(controller.handleCreateMemory));
router.delete("/:id", asyncHandler(controller.handleDeleteMemory));

router.get("/milestones", asyncHandler(controller.handleListMilestones));
router.post("/milestones", validateBody(createMilestoneSchema), asyncHandler(controller.handleCreateMilestone));
router.delete("/milestones/:id", asyncHandler(controller.handleDeleteMilestone));

export default router;
