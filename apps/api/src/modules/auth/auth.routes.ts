import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import { authRateLimiter } from "../../middleware/rateLimit";
import { validateBody } from "../../middleware/validate";
import {
  changePasswordSchema,
  loginSchema,
  refreshSchema,
  registerSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@withu/validation";
import * as controller from "./auth.controller";

const router = Router();

router.post("/register", authRateLimiter, validateBody(registerSchema), asyncHandler(controller.handleRegister));
router.post("/login", authRateLimiter, validateBody(loginSchema), asyncHandler(controller.handleLogin));
router.post("/refresh", validateBody(refreshSchema), asyncHandler(controller.handleRefresh));
router.post("/logout", requireAuth, asyncHandler(controller.handleLogout));
router.post(
  "/password/forgot",
  authRateLimiter,
  validateBody(requestPasswordResetSchema),
  asyncHandler(controller.handleRequestPasswordReset)
);
router.post(
  "/password/reset",
  authRateLimiter,
  validateBody(resetPasswordSchema),
  asyncHandler(controller.handleResetPassword)
);
router.post(
  "/password/change",
  requireAuth,
  validateBody(changePasswordSchema),
  asyncHandler(controller.handleChangePassword)
);

export default router;
