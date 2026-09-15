import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { createGameSessionSchema, respondGameInviteSchema, submitGameMoveSchema } from "@withu/validation";
import * as controller from "./game.controller";

const router = Router();

router.get("/", asyncHandler(controller.handleListCatalog));

router.use(requireAuth, requireCouple);

router.get("/sessions", asyncHandler(controller.handleListSessions));
router.post("/sessions", validateBody(createGameSessionSchema), asyncHandler(controller.handleCreateSession));
router.get("/sessions/:id", asyncHandler(controller.handleGetSession));
router.post(
  "/sessions/:id/respond",
  validateBody(respondGameInviteSchema),
  asyncHandler(controller.handleRespondInvite)
);
router.post("/sessions/:id/moves", validateBody(submitGameMoveSchema), asyncHandler(controller.handleSubmitMove));
router.post("/sessions/:id/cancel", asyncHandler(controller.handleCancelSession));

export default router;
