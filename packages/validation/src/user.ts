import { z } from "zod";

const moodEnum = z.enum([
  "happy",
  "missing_you",
  "sleepy",
  "loved",
  "playful",
  "sad",
  "flirty",
  "busy",
]);

const statusEnum = z.enum([
  "available",
  "working",
  "studying",
  "eating",
  "sleeping",
  "outside",
  "do_not_disturb",
]);

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(60).optional(),
  bio: z.string().trim().max(280).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const setMoodSchema = z.object({
  mood: moodEnum.nullable(),
  moodMessage: z.string().trim().max(140).nullable().optional(),
});
export type SetMoodInput = z.infer<typeof setMoodSchema>;

export const setStatusSchema = z.object({
  status: statusEnum.nullable(),
});
export type SetStatusInput = z.infer<typeof setStatusSchema>;

export const updatePreferencesSchema = z.object({
  notifications: z
    .object({
      messages: z.boolean(),
      loveDrops: z.boolean(),
      games: z.boolean(),
      activities: z.boolean(),
      reminders: z.boolean(),
    })
    .partial()
    .optional(),
  appearance: z
    .object({
      theme: z.enum(["light", "dark", "system"]),
      reducedMotion: z.boolean(),
    })
    .partial()
    .optional(),
  dataSaver: z
    .object({
      enabled: z.boolean(),
      compressImages: z.boolean(),
      disableAutoplay: z.boolean(),
      reduceAnimations: z.boolean(),
      loadMediaManually: z.boolean(),
      restrictBackgroundSync: z.boolean(),
    })
    .partial()
    .optional(),
});
export type UpdatePreferencesInput = z.infer<typeof updatePreferencesSchema>;
