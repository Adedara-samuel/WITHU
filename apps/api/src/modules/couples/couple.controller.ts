import type { Request, Response } from "express";
import { created, ok } from "../../common/response";
import { AppError } from "../../common/errors";
import * as coupleService from "./couple.service";
import { toCouple, toInvitation } from "./couple.mapper";

export async function handleCreateCouple(req: Request, res: Response) {
  const { couple, partnerOne, partnerTwo } = await coupleService.createCouple(req.userId!, req.body);
  return created(res, toCouple(couple, partnerOne, partnerTwo));
}

export async function handleGetMyCouple(req: Request, res: Response) {
  if (!req.coupleId) throw AppError.notFound("You're not part of a relationship space yet");
  const { couple, partnerOne, partnerTwo } = await coupleService.getCoupleWithPartners(req.coupleId);
  return ok(res, toCouple(couple, partnerOne, partnerTwo));
}

export async function handleUpdateCouple(req: Request, res: Response) {
  const { couple, partnerOne, partnerTwo } = await coupleService.updateCoupleSettings(req.userId!, req.body);
  return ok(res, toCouple(couple, partnerOne, partnerTwo));
}

export async function handleCreateInvitation(req: Request, res: Response) {
  const { invitation, inviterName } = await coupleService.createInvitation(req.userId!, req.body?.inviteeEmail);
  return created(res, toInvitation(invitation, inviterName));
}

export async function handleAcceptInvitation(req: Request, res: Response) {
  const { couple, partnerOne, partnerTwo } = await coupleService.acceptInvitation(req.userId!, req.body.code);
  return ok(res, toCouple(couple, partnerOne, partnerTwo));
}

export async function handleRejectInvitation(req: Request, res: Response) {
  await coupleService.rejectInvitation(req.body.code);
  return ok(res, { rejected: true });
}

export async function handleLeaveCouple(req: Request, res: Response) {
  await coupleService.leaveCouple(req.userId!);
  return ok(res, { left: true });
}
