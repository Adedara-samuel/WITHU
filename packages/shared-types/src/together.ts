export type TogetherActivity =
  | "idle"
  | "chatting"
  | "playing"
  | "watching"
  | "listening"
  | "questions";

export interface TogetherSession {
  id: string;
  coupleId: string;
  activity: TogetherActivity;
  activityRefId: string | null;
  startedAt: string;
  endedAt: string | null;
  participantIds: string[];
}

export type MediaProviderId = "youtube" | "generic_url" | "local_file";

export interface MediaRef {
  providerId: MediaProviderId;
  mediaId: string;
  title: string;
  thumbnailUrl: string | null;
  durationSeconds: number | null;
}

export type WatchSessionStatus = "created" | "invited" | "active" | "paused" | "ended";

export interface WatchSession {
  id: string;
  coupleId: string;
  hostId: string;
  guestId: string | null;
  media: MediaRef;
  status: WatchSessionStatus;
  currentPositionSeconds: number;
  playing: boolean;
  lastSyncedAt: string;
  createdAt: string;
}

export interface ListenTrackRef {
  providerId: "youtube" | "generic_url";
  trackId: string;
  title: string;
  artist: string | null;
  durationSeconds: number | null;
}

export type ListenSessionStatus = "created" | "invited" | "active" | "paused" | "ended";

export interface ListenSession {
  id: string;
  coupleId: string;
  hostId: string;
  guestId: string | null;
  track: ListenTrackRef;
  status: ListenSessionStatus;
  currentPositionSeconds: number;
  playing: boolean;
  lastSyncedAt: string;
  createdAt: string;
}
