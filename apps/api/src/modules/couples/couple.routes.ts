import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import {
  acceptInvitationSchema,
  createCoupleSchema,
  createInvitationSchema,
  updateCoupleSchema,
} from "@withu/validation";
import * as controller from "./couple.controller";

const router = Router();

router.use(requireAuth);

router.post("/", validateBody(createCoupleSchema), asyncHandler(controller.handleCreateCouple));
router.get("/me", asyncHandler(controller.handleGetMyCouple));
router.patch("/me", validateBody(updateCoupleSchema), asyncHandler(controller.handleUpdateCouple));
router.post("/leave/request", asyncHandler(controller.handleRequestLeaveCouple));
router.post("/leave/cancel", asyncHandler(controller.handleCancelLeaveRequest));

router.post("/invite", validateBody(createInvitationSchema), asyncHandler(controller.handleCreateInvitation));
router.post("/accept", validateBody(acceptInvitationSchema), asyncHandler(controller.handleAcceptInvitation));
router.post("/reject", validateBody(acceptInvitationSchema), asyncHandler(controller.handleRejectInvitation));

export default router;
