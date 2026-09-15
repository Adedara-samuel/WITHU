import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { sendAffectionSchema, sendLoveDropSchema } from "@withu/validation";
import * as controller from "./love-drop.controller";

const router = Router();

router.use(requireAuth, requireCouple);

router.post("/", validateBody(sendLoveDropSchema), asyncHandler(controller.handleSendLoveDrop));
router.get("/", asyncHandler(controller.handleListLoveDrops));
router.post("/:id/open", asyncHandler(controller.handleOpenLoveDrop));

router.post("/affection", validateBody(sendAffectionSchema), asyncHandler(controller.handleSendAffection));
router.get("/affection/history", asyncHandler(controller.handleListAffectionHistory));

export default router;
