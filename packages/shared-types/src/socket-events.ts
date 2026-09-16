import type { AffectionKind } from "./love-drop";
import type { Message, MessageReaction } from "./message";
import type { LoveDrop } from "./love-drop";
import type { GameSession } from "./game";
import type { Mood, UserStatus, PresenceState } from "./user";
import type { WatchSession } from "./together";
import type { ListenSession } from "./together";
import type { AppNotification } from "./notification";
import type { CallEndReason, CallKind, CallSignal } from "./call";

/**
 * Every socket payload is intentionally tiny. We never send full documents
 * back and forth on hot paths (typing, presence, game moves) - only ids and
 * the minimal delta, so the app stays cheap on poor connections.
 */

export interface ServerToClientEvents {
  USER_ONLINE: (payload: { userId: string; presence: PresenceState }) => void;
  USER_OFFLINE: (payload: { userId: string; lastSeen: string }) => void;

  TYPING_STARTED: (payload: { coupleId: string; userId: string }) => void;
  TYPING_STOPPED: (payload: { coupleId: string; userId: string }) => void;

  MESSAGE_SENT: (payload: { message: Message }) => void;
  MESSAGE_UPDATED: (payload: { message: Message }) => void;
  MESSAGE_DELETED: (payload: { messageId: string; coupleId: string }) => void;
  MESSAGE_READ: (payload: { coupleId: string; userId: string; readUpToId: string }) => void;
  REACTION_SENT: (payload: { messageId: string; reaction: MessageReaction }) => void;
  REACTION_REMOVED: (payload: { messageId: string; userId: string; emoji: string }) => void;

  AFFECTION_SENT: (payload: {
    id: string;
    coupleId: string;
    senderId: string;
    kind: AffectionKind;
    createdAt: string;
  }) => void;

  LOVE_DROP_SENT: (payload: { loveDrop: LoveDrop }) => void;
  LOVE_DROP_OPENED: (payload: { loveDropId: string; openedAt: string }) => void;

  GAME_INVITE: (payload: { session: GameSession }) => void;
  GAME_INVITE_RESPONDED: (payload: { sessionId: string; accepted: boolean }) => void;
  GAME_STATE_UPDATED: (payload: { session: GameSession }) => void;
  GAME_FINISHED: (payload: { session: GameSession }) => void;

  WATCH_INVITE: (payload: { session: WatchSession }) => void;
  WATCH_STATE_UPDATED: (payload: { session: WatchSession }) => void;
  WATCH_ENDED: (payload: { sessionId: string }) => void;

  LISTEN_INVITE: (payload: { session: ListenSession }) => void;
  LISTEN_STATE_UPDATED: (payload: { session: ListenSession }) => void;
  LISTEN_ENDED: (payload: { sessionId: string }) => void;

  CALL_INCOMING: (payload: { callId: string; callerId: string; callerName: string; kind: CallKind }) => void;
  CALL_ACCEPTED: (payload: { callId: string }) => void;
  CALL_DECLINED: (payload: { callId: string }) => void;
  CALL_ENDED: (payload: { callId: string; reason: CallEndReason }) => void;
  CALL_SIGNAL: (payload: { callId: string; signal: CallSignal }) => void;

  COUPLE_LEAVE_REQUESTED: (payload: { coupleId: string; requestedBy: string }) => void;
  COUPLE_LEAVE_CANCELLED: (payload: { coupleId: string; cancelledBy: string }) => void;
  COUPLE_DISSOLVED: (payload: { coupleId: string }) => void;

  MOOD_CHANGED: (payload: { userId: string; mood: Mood | null; moodMessage: string | null }) => void;
  STATUS_CHANGED: (payload: { userId: string; status: UserStatus | null }) => void;

  TOGETHER_SESSION_STARTED: (payload: { coupleId: string; activity: string; activityRefId: string | null }) => void;
  TOGETHER_SESSION_ENDED: (payload: { coupleId: string }) => void;

  NOTIFICATION_RECEIVED: (payload: { notification: AppNotification }) => void;

  ERROR: (payload: { message: string; code?: string }) => void;
}

export interface ClientToServerEvents {
  PRESENCE_HEARTBEAT: () => void;

  TYPING_START: (payload: { coupleId: string }) => void;
  TYPING_STOP: (payload: { coupleId: string }) => void;

  MESSAGE_READ_UP_TO: (payload: { coupleId: string; messageId: string }) => void;

  AFFECTION_SEND: (payload: { coupleId: string; kind: AffectionKind }) => void;

  GAME_JOIN_ROOM: (payload: { sessionId: string }) => void;
  GAME_MOVE: (payload: { sessionId: string; payload: Record<string, unknown> }) => void;

  WATCH_JOIN_ROOM: (payload: { sessionId: string }) => void;
  WATCH_PLAY: (payload: { sessionId: string; positionSeconds: number }) => void;
  WATCH_PAUSE: (payload: { sessionId: string; positionSeconds: number }) => void;
  WATCH_SEEK: (payload: { sessionId: string; positionSeconds: number }) => void;
  WATCH_SYNC_REQUEST: (payload: { sessionId: string }) => void;

  LISTEN_JOIN_ROOM: (payload: { sessionId: string }) => void;
  LISTEN_PLAY: (payload: { sessionId: string; positionSeconds: number }) => void;
  LISTEN_PAUSE: (payload: { sessionId: string; positionSeconds: number }) => void;
  LISTEN_SEEK: (payload: { sessionId: string; positionSeconds: number }) => void;

  MOOD_SET: (payload: { mood: Mood | null; moodMessage: string | null }) => void;
  STATUS_SET: (payload: { status: UserStatus | null }) => void;

  CALL_START: (payload: { callId: string; kind: CallKind }) => void;
  CALL_RESPOND: (payload: { callId: string; accept: boolean }) => void;
  CALL_SIGNAL: (payload: { callId: string; signal: CallSignal }) => void;
  CALL_END: (payload: { callId: string }) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  coupleId: string | null;
}
