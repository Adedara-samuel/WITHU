import type { Request, Response } from "express";
import { created, ok } from "../../common/response";
import { toAuthenticatedUser } from "../users/user.mapper";
import * as authService from "./auth.service";

export async function handleRegister(req: Request, res: Response) {
  const { user, tokens } = await authService.register(req.body);
  return created(res, { user: toAuthenticatedUser(user), tokens });
}

export async function handleLogin(req: Request, res: Response) {
  const { user, tokens } = await authService.login(req.body);
  return ok(res, { user: toAuthenticatedUser(user), tokens });
}

export async function handleRefresh(req: Request, res: Response) {
  const { user, tokens } = await authService.refresh(req.body.refreshToken);
  return ok(res, { user: toAuthenticatedUser(user), tokens });
}

export async function handleLogout(req: Request, res: Response) {
  await authService.logout(req.userId!);
  return ok(res, { loggedOut: true });
}

export async function handleRequestPasswordReset(req: Request, res: Response) {
  const { devToken } = await authService.requestPasswordReset(req.body.email);
  return ok(res, { sent: true, devToken });
}

export async function handleResetPassword(req: Request, res: Response) {
  await authService.resetPassword(req.body.token, req.body.password);
  return ok(res, { reset: true });
}

export async function handleChangePassword(req: Request, res: Response) {
  await authService.changePassword(req.userId!, req.body.currentPassword, req.body.newPassword);
  return ok(res, { changed: true });
}
