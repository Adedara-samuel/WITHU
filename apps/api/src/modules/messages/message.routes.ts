import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth, requireCouple } from "../../middleware/auth";
import { validateBody, validateQuery } from "../../middleware/validate";
import {
  editMessageSchema,
  listMessagesQuerySchema,
  reactToMessageSchema,
  sendMessageSchema,
} from "@withu/validation";
import * as controller from "./message.controller";

const router = Router();

router.use(requireAuth, requireCouple);

router.get("/", validateQuery(listMessagesQuerySchema), asyncHandler(controller.handleListMessages));
router.get("/search", asyncHandler(controller.handleSearchMessages));
router.post("/", validateBody(sendMessageSchema), asyncHandler(controller.handleSendMessage));
router.patch("/:id", validateBody(editMessageSchema), asyncHandler(controller.handleEditMessage));
router.delete("/:id", asyncHandler(controller.handleDeleteMessage));
router.post("/:id/reactions", validateBody(reactToMessageSchema), asyncHandler(controller.handleReactToMessage));
router.delete("/:id/reactions/:emoji", asyncHandler(controller.handleRemoveReaction));

export default router;
