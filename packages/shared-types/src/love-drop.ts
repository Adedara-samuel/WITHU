export type LoveDropKind = "text" | "animated" | "scheduled" | "surprise";

export type AffectionKind =
  | "hug"
  | "kiss"
  | "love"
  | "miss_you"
  | "cuddle"
  | "thinking_of_you";

export interface LoveDrop {
  id: string;
  coupleId: string;
  senderId: string;
  recipientId: string;
  kind: LoveDropKind;
  message: string;
  animation: string | null;
  deliverAt: string;
  deliveredAt: string | null;
  openedAt: string | null;
  createdAt: string;
}

export interface AffectionEvent {
  id: string;
  coupleId: string;
  senderId: string;
  kind: AffectionKind;
  createdAt: string;
}
