import { z } from "zod";

export const sendMessageSchema = z.object({
  type: z.enum(["text", "image", "voice"]).default("text"),
  text: z.string().trim().max(4000).optional(),
  attachment: z
    .object({
      url: z.string().url(),
      thumbnailUrl: z.string().url().nullable().optional(),
      width: z.number().int().positive().nullable().optional(),
      height: z.number().int().positive().nullable().optional(),
      durationMs: z.number().int().positive().nullable().optional(),
      bytes: z.number().int().positive().nullable().optional(),
    })
    .optional(),
  replyToId: z.string().nullable().optional(),
  clientTempId: z.string().optional(),
});
export type SendMessageInput = z.infer<typeof sendMessageSchema>;

export const editMessageSchema = z.object({
  text: z.string().trim().min(1).max(4000),
});
export type EditMessageInput = z.infer<typeof editMessageSchema>;

export const reactToMessageSchema = z.object({
  emoji: z.string().trim().min(1).max(8),
});
export type ReactToMessageInput = z.infer<typeof reactToMessageSchema>;

export const listMessagesQuerySchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
});
export type ListMessagesQuery = z.infer<typeof listMessagesQuerySchema>;
