import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import * as controller from "./notification.controller";

const router = Router();

router.use(requireAuth);

router.get("/", asyncHandler(controller.handleListNotifications));
router.post("/read-all", asyncHandler(controller.handleMarkAllRead));
router.post("/:id/read", asyncHandler(controller.handleMarkRead));

router.get("/daily-challenge", requireCouple, asyncHandler(controller.handleGetDailyChallenge));
router.post("/daily-challenge/complete", requireCouple, asyncHandler(controller.handleCompleteDailyChallenge));

export default router;
