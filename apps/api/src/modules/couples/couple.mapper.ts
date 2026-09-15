import { relationshipStreakDays } from "@withu/shared-utils";
import type { Couple, CoupleInvitation } from "@withu/shared-types";
import { toPublicUser } from "../users/user.mapper";
import type { CoupleHydrated } from "./couple.model";
import type { CoupleInvitationHydrated } from "./invitation.model";
import type { UserHydrated } from "../users/user.model";

export function toCouple(couple: CoupleHydrated, partnerOne: UserHydrated, partnerTwo: UserHydrated | null): Couple {
  const shareLastSeen = couple.settings.privacy.shareLastSeen;
  const shareMood = couple.settings.privacy.shareMood;
  return {
    id: couple._id.toString(),
    relationshipName: couple.relationshipName,
    anniversaryDate: couple.anniversaryDate?.toISOString() ?? null,
    partnerOne: toPublicUser(partnerOne, { shareLastSeen, shareMood }),
    partnerTwo: partnerTwo ? toPublicUser(partnerTwo, { shareLastSeen, shareMood }) : null,
    settings: couple.settings,
    streakDays: relationshipStreakDays(couple.togetherSince.toISOString()),
    togetherSince: couple.togetherSince.toISOString(),
    createdAt: couple.createdAt.toISOString(),
  };
}

export function toInvitation(invitation: CoupleInvitationHydrated, inviterName: string): CoupleInvitation {
  return {
    id: invitation._id.toString(),
    code: invitation.code,
    inviterId: invitation.inviterId.toString(),
    inviterName,
    inviteeEmail: invitation.inviteeEmail,
    status: invitation.status,
    createdAt: invitation.createdAt.toISOString(),
    expiresAt: invitation.expiresAt.toISOString(),
  };
}
