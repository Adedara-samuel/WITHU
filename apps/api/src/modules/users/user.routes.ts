import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { validateBody } from "../../middleware/validate";
import { setMoodSchema, setStatusSchema, updatePreferencesSchema, updateProfileSchema } from "@withu/validation";
import * as controller from "./user.controller";

const router = Router();

router.use(requireAuth);

router.get("/me", asyncHandler(controller.handleGetMe));
router.patch("/me", validateBody(updateProfileSchema), asyncHandler(controller.handleUpdateMe));
router.post("/me/mood", validateBody(setMoodSchema), asyncHandler(controller.handleSetMood));
router.post("/me/status", validateBody(setStatusSchema), asyncHandler(controller.handleSetStatus));
router.patch("/me/preferences", validateBody(updatePreferencesSchema), asyncHandler(controller.handleUpdatePreferences));

export default router;
