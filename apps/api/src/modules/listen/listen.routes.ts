import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { createListenSessionSchema } from "@withu/validation";
import * as controller from "./listen.controller";

const router = Router();

router.use(requireAuth, requireCouple);

router.get("/sessions", asyncHandler(controller.handleListSessions));
router.post("/sessions", validateBody(createListenSessionSchema), asyncHandler(controller.handleCreateSession));
router.get("/sessions/:id", asyncHandler(controller.handleGetSession));
router.post("/sessions/:id/join", asyncHandler(controller.handleJoinSession));
router.post("/sessions/:id/end", asyncHandler(controller.handleEndSession));

export default router;
