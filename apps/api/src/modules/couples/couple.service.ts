import { generateInviteCode } from "@withu/shared-utils";
import type { CreateCoupleInput, UpdateCoupleInput } from "@withu/validation";
import { AppError } from "../../common/errors";
import { UserModel } from "../users/user.model";
import { createNotification } from "../notifications/notification.service";
import { CoupleModel, type CoupleHydrated } from "./couple.model";
import { CoupleInvitationModel } from "./invitation.model";

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export async function getCoupleWithPartners(coupleId: string) {
  const couple = await CoupleModel.findById(coupleId);
  if (!couple) throw AppError.notFound("Relationship space not found");
  const [partnerOne, partnerTwo] = await Promise.all([
    UserModel.findById(couple.partnerOneId),
    couple.partnerTwoId ? UserModel.findById(couple.partnerTwoId) : Promise.resolve(null),
  ]);
  if (!partnerOne) throw AppError.notFound("Partner not found");
  return { couple, partnerOne, partnerTwo };
}

export function assertCoupleMember(couple: CoupleHydrated, userId: string) {
  const isMember =
    couple.partnerOneId.toString() === userId || (couple.partnerTwoId && couple.partnerTwoId.toString() === userId);
  if (!isMember) throw AppError.forbidden("You're not part of this relationship space");
}

/** Looks up the other person in a couple, e.g. to route a call directly to them. */
export async function getPartnerId(coupleId: string, userId: string): Promise<string | null> {
  const couple = await CoupleModel.findById(coupleId).select("partnerOneId partnerTwoId");
  if (!couple) return null;
  const partnerOneId = couple.partnerOneId.toString();
  const partnerTwoId = couple.partnerTwoId?.toString() ?? null;
  if (partnerOneId === userId) return partnerTwoId;
  if (partnerTwoId === userId) return partnerOneId;
  return null;
}

export async function createCouple(userId: string, input: CreateCoupleInput) {
  const user = await UserModel.findById(userId);
  if (!user) throw AppError.notFound("User not found");
  if (user.coupleId) throw AppError.conflict("You're already part of a relationship space");

  const couple = await CoupleModel.create({
    partnerOneId: user._id,
    relationshipName: input.relationshipName ?? null,
    anniversaryDate: input.anniversaryDate ? new Date(input.anniversaryDate) : null,
  });

  user.coupleId = couple._id;
  await user.save();

  return { couple, partnerOne: user, partnerTwo: null };
}

export async function createInvitation(userId: string, inviteeEmail?: string) {
  const user = await UserModel.findById(userId);
  if (!user?.coupleId) throw AppError.forbidden("Create a relationship space first");

  const couple = await CoupleModel.findById(user.coupleId);
  if (!couple) throw AppError.notFound("Relationship space not found");
  if (couple.partnerTwoId) throw AppError.conflict("Your relationship space already has two people");

  await CoupleInvitationModel.updateMany(
    { coupleId: couple._id, status: "pending" },
    { status: "expired" }
  );

  const invitation = await CoupleInvitationModel.create({
    coupleId: couple._id,
    code: generateInviteCode(),
    inviterId: user._id,
    inviteeEmail: inviteeEmail ?? null,
    status: "pending",
    expiresAt: new Date(Date.now() + INVITATION_TTL_MS),
  });

  return { invitation, inviterName: user.name };
}

export async function acceptInvitation(userId: string, code: string) {
  const invitation = await CoupleInvitationModel.findOne({ code: code.toUpperCase() });
  if (!invitation) throw AppError.notFound("Invitation not found");
  if (invitation.status !== "pending") throw AppError.conflict("This invitation is no longer valid");
  if (invitation.expiresAt.getTime() < Date.now()) {
    invitation.status = "expired";
    await invitation.save();
    throw AppError.conflict("This invitation has expired");
  }

  const [user, couple] = await Promise.all([
    UserModel.findById(userId),
    CoupleModel.findById(invitation.coupleId),
  ]);
  if (!user) throw AppError.notFound("User not found");
  if (!couple) throw AppError.notFound("Relationship space not found");
  if (couple.partnerOneId.toString() === userId) {
    throw AppError.badRequest("You can't accept your own invitation");
  }
  if (user.coupleId) throw AppError.conflict("You're already part of a relationship space");
  if (couple.partnerTwoId) throw AppError.conflict("This relationship space is already complete");

  couple.partnerTwoId = user._id;
  user.coupleId = couple._id;
  invitation.status = "accepted";

  await Promise.all([couple.save(), user.save(), invitation.save()]);

  await createNotification({
    userId: couple.partnerOneId.toString(),
    coupleId: couple._id.toString(),
    type: "couple_invite",
    title: "Your partner joined!",
    body: `${user.name} just joined your relationship space. You're together now.`,
    data: { coupleId: couple._id.toString() },
  });

  return getCoupleWithPartners(couple._id.toString());
}

export async function rejectInvitation(code: string) {
  const invitation = await CoupleInvitationModel.findOne({ code: code.toUpperCase() });
  if (!invitation) throw AppError.notFound("Invitation not found");
  if (invitation.status !== "pending") throw AppError.conflict("This invitation is no longer pending");
  invitation.status = "rejected";
  await invitation.save();
  return invitation;
}

export async function updateCoupleSettings(userId: string, input: UpdateCoupleInput) {
  const user = await UserModel.findById(userId);
  if (!user?.coupleId) throw AppError.forbidden("You're not part of a relationship space");

  const couple = await CoupleModel.findById(user.coupleId);
  if (!couple) throw AppError.notFound("Relationship space not found");
  assertCoupleMember(couple, userId);

  if (input.relationshipName !== undefined) couple.relationshipName = input.relationshipName;
  if (input.anniversaryDate !== undefined) {
    couple.anniversaryDate = input.anniversaryDate ? new Date(input.anniversaryDate) : null;
  }
  if (input.settings?.privacy) {
    couple.settings.privacy = { ...couple.settings.privacy, ...input.settings.privacy };
  }
  await couple.save();
  return getCoupleWithPartners(couple._id.toString());
}

function otherPartnerId(couple: CoupleHydrated, userId: string): string | null {
  const partnerOneId = couple.partnerOneId.toString();
  const partnerTwoId = couple.partnerTwoId?.toString() ?? null;
  if (partnerOneId === userId) return partnerTwoId;
  if (partnerTwoId === userId) return partnerOneId;
  return null;
}

/**
 * Leaving is a mutual-consent action: the first request just records intent
 * and notifies the other partner. The space is only dissolved once BOTH
 * partners (when there are two) have requested to leave.
 */
export async function requestLeaveCouple(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user?.coupleId) throw AppError.forbidden("You're not part of a relationship space");

  const couple = await CoupleModel.findById(user.coupleId);
  if (!couple) throw AppError.notFound("Relationship space not found");
  assertCoupleMember(couple, userId);

  const partnerId = otherPartnerId(couple, userId);
  const alreadyRequested = couple.pendingLeaveRequestedBy.some((id) => id.toString() === userId);

  // Solo space (no partner yet) or partner already asked to leave -> dissolve immediately.
  const partnerAlreadyRequested = partnerId
    ? couple.pendingLeaveRequestedBy.some((id) => id.toString() === partnerId)
    : false;

  if (!partnerId || partnerAlreadyRequested) {
    const coupleId = couple._id.toString();
    await UserModel.updateMany({ coupleId: couple._id }, { coupleId: null });
    await CoupleModel.findByIdAndDelete(couple._id);
    return { dissolved: true as const, coupleId, partnerId };
  }

  if (!alreadyRequested) {
    couple.pendingLeaveRequestedBy.push(user._id);
    await couple.save();
  }

  await createNotification({
    userId: partnerId,
    coupleId: couple._id.toString(),
    type: "couple_leave_request",
    title: "Your partner wants to leave",
    body: `${user.name} has asked to end your relationship space. Both of you must agree before it closes.`,
    data: { coupleId: couple._id.toString(), requestedBy: userId },
  });

  return { dissolved: false as const, coupleId: couple._id.toString(), partnerId };
}

export async function cancelLeaveRequest(userId: string) {
  const user = await UserModel.findById(userId);
  if (!user?.coupleId) throw AppError.forbidden("You're not part of a relationship space");

  const couple = await CoupleModel.findById(user.coupleId);
  if (!couple) throw AppError.notFound("Relationship space not found");
  assertCoupleMember(couple, userId);

  // Either partner can call off a pending leave - the requester retracting it, or the
  // other partner declining it. Either way both people keep the space, so we clear it entirely.
  couple.pendingLeaveRequestedBy = [];
  await couple.save();

  return { coupleId: couple._id.toString(), partnerId: otherPartnerId(couple, userId) };
}
