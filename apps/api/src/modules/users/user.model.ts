import { Schema, model, Types, type HydratedDocument } from "mongoose";
import type { Mood, UserStatus, PresenceState } from "@withu/shared-types";

export interface UserDoc {
  _id: Types.ObjectId;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  avatarUrl: string | null;
  bio: string | null;
  mood: Mood | null;
  moodMessage: string | null;
  status: UserStatus | null;
  coupleId: Types.ObjectId | null;
  lastSeen: Date | null;
  socketPresence: PresenceState;
  tokenVersion: number;
  passwordResetTokenHash: string | null;
  passwordResetExpiresAt: Date | null;
  preferences: {
    notifications: {
      messages: boolean;
      loveDrops: boolean;
      games: boolean;
      activities: boolean;
      reminders: boolean;
    };
    appearance: {
      theme: "light" | "dark" | "system";
      reducedMotion: boolean;
    };
    dataSaver: {
      enabled: boolean;
      compressImages: boolean;
      disableAutoplay: boolean;
      reduceAnimations: boolean;
      loadMediaManually: boolean;
      restrictBackgroundSync: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

export type UserHydrated = HydratedDocument<UserDoc>;

const userSchema = new Schema<UserDoc>(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 24 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    avatarUrl: { type: String, default: null },
    bio: { type: String, default: null, maxlength: 280 },
    mood: { type: String, default: null },
    moodMessage: { type: String, default: null, maxlength: 140 },
    status: { type: String, default: null },
    coupleId: { type: Schema.Types.ObjectId, ref: "Couple", default: null, index: true },
    lastSeen: { type: Date, default: null },
    socketPresence: { type: String, default: "offline" },
    tokenVersion: { type: Number, default: 0 },
    passwordResetTokenHash: { type: String, default: null, select: false },
    passwordResetExpiresAt: { type: Date, default: null },
    preferences: {
      notifications: {
        messages: { type: Boolean, default: true },
        loveDrops: { type: Boolean, default: true },
        games: { type: Boolean, default: true },
        activities: { type: Boolean, default: true },
        reminders: { type: Boolean, default: true },
      },
      appearance: {
        theme: { type: String, default: "system" },
        reducedMotion: { type: Boolean, default: false },
      },
      dataSaver: {
        enabled: { type: Boolean, default: false },
        compressImages: { type: Boolean, default: true },
        disableAutoplay: { type: Boolean, default: false },
        reduceAnimations: { type: Boolean, default: false },
        loadMediaManually: { type: Boolean, default: false },
        restrictBackgroundSync: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

export const UserModel = model<UserDoc>("User", userSchema);
