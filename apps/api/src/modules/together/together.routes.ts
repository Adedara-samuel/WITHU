import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import * as controller from "./together.controller";

const router = Router();

router.use(requireAuth, requireCouple);

router.get("/active", asyncHandler(controller.handleGetActive));
router.post("/start", asyncHandler(controller.handleStart));
router.post("/activity", asyncHandler(controller.handleUpdateActivity));
router.post("/end", asyncHandler(controller.handleEnd));

export default router;
