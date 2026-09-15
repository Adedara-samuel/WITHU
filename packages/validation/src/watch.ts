import { z } from "zod";

export const createWatchSessionSchema = z.object({
  media: z.object({
    providerId: z.enum(["youtube", "generic_url", "local_file"]),
    mediaId: z.string().min(1).max(400),
    title: z.string().min(1).max(200),
    thumbnailUrl: z.string().url().nullable().optional(),
    durationSeconds: z.number().int().positive().nullable().optional(),
  }),
});
export type CreateWatchSessionInput = z.infer<typeof createWatchSessionSchema>;

export const watchPlaybackSchema = z.object({
  sessionId: z.string().min(1),
  positionSeconds: z.number().min(0),
});
export type WatchPlaybackInput = z.infer<typeof watchPlaybackSchema>;

export const createListenSessionSchema = z.object({
  track: z.object({
    providerId: z.enum(["youtube", "generic_url"]),
    trackId: z.string().min(1).max(400),
    title: z.string().min(1).max(200),
    artist: z.string().max(200).nullable().optional(),
    durationSeconds: z.number().int().positive().nullable().optional(),
  }),
});
export type CreateListenSessionInput = z.infer<typeof createListenSessionSchema>;
