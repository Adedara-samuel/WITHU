import { z } from "zod";

export const gameKeySchema = z.enum([
  "tic_tac_toe",
  "connect_four",
  "memory_match",
  "would_you_rather",
  "truth_or_dare",
  "this_or_that",
  "how_well_do_you_know_me",
  "couple_questions",
]);

export const createGameSessionSchema = z.object({
  gameKey: gameKeySchema,
});
export type CreateGameSessionInput = z.infer<typeof createGameSessionSchema>;

export const respondGameInviteSchema = z.object({
  accept: z.boolean(),
});
export type RespondGameInviteInput = z.infer<typeof respondGameInviteSchema>;

export const submitGameMoveSchema = z.object({
  payload: z.record(z.unknown()),
});
export type SubmitGameMoveInput = z.infer<typeof submitGameMoveSchema>;
