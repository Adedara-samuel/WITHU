import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { createWatchSessionSchema } from "@withu/validation";
import * as controller from "./watch.controller";

const router = Router();

router.use(requireAuth, requireCouple);

router.get("/sessions", asyncHandler(controller.handleListSessions));
router.post("/sessions", validateBody(createWatchSessionSchema), asyncHandler(controller.handleCreateSession));
router.get("/sessions/:id", asyncHandler(controller.handleGetSession));
router.post("/sessions/:id/join", asyncHandler(controller.handleJoinSession));
router.post("/sessions/:id/end", asyncHandler(controller.handleEndSession));

export default router;
