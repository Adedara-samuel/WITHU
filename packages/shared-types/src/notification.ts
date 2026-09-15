export type NotificationType =
  | "message"
  | "love_drop"
  | "affection"
  | "game_invite"
  | "game_move"
  | "watch_invite"
  | "listen_invite"
  | "together_invite"
  | "daily_challenge"
  | "memory"
  | "milestone"
  | "couple_invite";

export interface AppNotification {
  id: string;
  userId: string;
  coupleId: string | null;
  type: NotificationType;
  title: string;
  body: string;
  data: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

export type DailyChallengeType = "challenge" | "game" | "question";

export interface DailyChallenge {
  id: string;
  coupleId: string;
  type: DailyChallengeType;
  title: string;
  description: string;
  refKey: string | null;
  date: string;
  completedByIds: string[];
}
