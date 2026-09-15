import { z } from "zod";

export const createCoupleSchema = z.object({
  relationshipName: z.string().trim().max(60).optional(),
  anniversaryDate: z.string().datetime().optional(),
});
export type CreateCoupleInput = z.infer<typeof createCoupleSchema>;

export const createInvitationSchema = z.object({
  inviteeEmail: z.string().trim().toLowerCase().email().optional(),
});
export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

export const acceptInvitationSchema = z.object({
  code: z.string().trim().min(4).max(20),
});
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;

export const updateCoupleSchema = z.object({
  relationshipName: z.string().trim().max(60).nullable().optional(),
  anniversaryDate: z.string().datetime().nullable().optional(),
  settings: z
    .object({
      privacy: z
        .object({
          shareLastSeen: z.boolean(),
          shareMood: z.boolean(),
        })
        .partial(),
    })
    .partial()
    .optional(),
});
export type UpdateCoupleInput = z.infer<typeof updateCoupleSchema>;
