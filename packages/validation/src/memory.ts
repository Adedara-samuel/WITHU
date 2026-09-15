import { z } from "zod";

const memoryCategory = z.enum([
  "first_date",
  "trip",
  "birthday",
  "funny",
  "favourite",
  "place_to_visit",
  "milestone",
  "general",
]);

export const createMemorySchema = z.object({
  title: z.string().trim().min(1).max(120),
  caption: z.string().trim().max(1000).nullable().optional(),
  category: memoryCategory.default("general"),
  photo: z
    .object({
      url: z.string().url(),
      thumbnailUrl: z.string().url(),
      width: z.number().int().positive(),
      height: z.number().int().positive(),
    })
    .nullable()
    .optional(),
  location: z.string().trim().max(120).nullable().optional(),
  occurredOn: z.string().datetime().nullable().optional(),
});
export type CreateMemoryInput = z.infer<typeof createMemorySchema>;

const milestoneKind = z.enum([
  "met",
  "first_conversation",
  "first_date",
  "first_i_love_you",
  "first_trip",
  "anniversary",
  "birthday",
  "custom",
]);

export const createMilestoneSchema = z.object({
  kind: milestoneKind,
  title: z.string().trim().min(1).max(120),
  description: z.string().trim().max(500).nullable().optional(),
  date: z.string().datetime(),
  icon: z.string().trim().max(20).default("heart"),
});
export type CreateMilestoneInput = z.infer<typeof createMilestoneSchema>;
