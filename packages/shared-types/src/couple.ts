import type { PublicUser } from "./user";

export interface CoupleSettings {
  privacy: {
    shareLastSeen: boolean;
    shareMood: boolean;
  };
}

export interface Couple {
  id: string;
  relationshipName: string | null;
  anniversaryDate: string | null;
  partnerOne: PublicUser;
  partnerTwo: PublicUser | null;
  settings: CoupleSettings;
  streakDays: number;
  togetherSince: string;
  createdAt: string;
}

export type InvitationStatus = "pending" | "accepted" | "rejected" | "expired";

export interface CoupleInvitation {
  id: string;
  code: string;
  inviterId: string;
  inviterName: string;
  inviteeEmail: string | null;
  status: InvitationStatus;
  createdAt: string;
  expiresAt: string;
}
