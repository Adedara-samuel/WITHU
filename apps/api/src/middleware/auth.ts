import type { NextFunction, Request, Response } from "express";
import { AppError } from "../common/errors";
import { verifyAccessToken } from "../utils/jwt";
import { UserModel, type UserHydrated } from "../modules/users/user.model";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: UserHydrated;
      userId?: string;
      coupleId?: string | null;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) {
      throw AppError.unauthorized();
    }
    const token = header.slice("Bearer ".length);
    const payload = verifyAccessToken(token);

    const user = await UserModel.findById(payload.sub);
    if (!user) throw AppError.unauthorized("Account no longer exists");

    req.user = user;
    req.userId = user._id.toString();
    req.coupleId = user.coupleId ? user.coupleId.toString() : null;
    next();
  } catch {
    next(AppError.unauthorized("Invalid or expired session"));
  }
}

/** Ensures the authenticated user belongs to a couple, and exposes coupleId as a plain string. */
export function requireCouple(req: Request, _res: Response, next: NextFunction) {
  if (!req.coupleId) {
    return next(AppError.forbidden("You need to be in a relationship space first"));
  }
  next();
}
