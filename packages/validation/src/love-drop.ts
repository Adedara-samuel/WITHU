import { z } from "zod";

export const sendLoveDropSchema = z.object({
  kind: z.enum(["text", "animated", "scheduled", "surprise"]).default("text"),
  message: z.string().trim().min(1).max(500),
  animation: z.string().trim().max(40).nullable().optional(),
  deliverAt: z.string().datetime().optional(),
});
export type SendLoveDropInput = z.infer<typeof sendLoveDropSchema>;

export const affectionKindSchema = z.enum([
  "hug",
  "kiss",
  "love",
  "miss_you",
  "cuddle",
  "thinking_of_you",
]);

export const sendAffectionSchema = z.object({
  kind: affectionKindSchema,
});
export type SendAffectionInput = z.infer<typeof sendAffectionSchema>;
