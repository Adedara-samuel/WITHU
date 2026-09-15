export type Mood =
  | "happy"
  | "missing_you"
  | "sleepy"
  | "loved"
  | "playful"
  | "sad"
  | "flirty"
  | "busy";

export type UserStatus =
  | "available"
  | "working"
  | "studying"
  | "eating"
  | "sleeping"
  | "outside"
  | "do_not_disturb";

export type PresenceState = "online" | "away" | "offline";

export interface PublicUser {
  id: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  mood: Mood | null;
  moodMessage: string | null;
  status: UserStatus | null;
  presence: PresenceState;
  lastSeen: string | null;
}

export interface AuthenticatedUser extends PublicUser {
  email: string;
  coupleId: string | null;
  createdAt: string;
  preferences: UserPreferences;
}

export interface NotificationPreferences {
  messages: boolean;
  loveDrops: boolean;
  games: boolean;
  activities: boolean;
  reminders: boolean;
}

export interface AppearancePreferences {
  theme: "light" | "dark" | "system";
  reducedMotion: boolean;
}

export interface DataSaverPreferences {
  enabled: boolean;
  compressImages: boolean;
  disableAutoplay: boolean;
  reduceAnimations: boolean;
  loadMediaManually: boolean;
  restrictBackgroundSync: boolean;
}

export interface UserPreferences {
  notifications: NotificationPreferences;
  appearance: AppearancePreferences;
  dataSaver: DataSaverPreferences;
}
