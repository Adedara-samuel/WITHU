import { Router } from "express";
import { asyncHandler } from "../../common/asyncHandler";
import { requireAuth } from "../../middleware/auth";
import * as controller from "./call.controller";

const router = Router();

router.use(requireAuth);

router.get("/ice-servers", asyncHandler(controller.handleGetIceServers));

export default router;
