import type { Response } from "express";
import type { ApiResponse } from "@withu/shared-types";

export function ok<T>(res: Response, data: T, status = 200): Response<ApiResponse<T>> {
  return res.status(status).json({ success: true, data });
}

export function created<T>(res: Response, data: T): Response<ApiResponse<T>> {
  return ok(res, data, 201);
}
