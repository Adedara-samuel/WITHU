import type { GameKey } from "@withu/shared-types";
import {
  COUPLE_QUESTIONS,
  HOW_WELL_DO_YOU_KNOW_ME,
  THIS_OR_THAT,
  TRUTH_OR_DARE,
  WOULD_YOU_RATHER,
} from "@withu/constants";
import type { GameModule } from "./types";
import { ticTacToeModule } from "./games/tic-tac-toe";
import { connectFourModule } from "./games/connect-four";
import { memoryMatchModule } from "./games/memory-match";
import { createAnswerBothGame } from "./games/answer-both";
import { createTurnBasedQuestionGame } from "./games/turn-based-question";

export const GAME_MODULES: Record<GameKey, GameModule> = {
  tic_tac_toe: ticTacToeModule,
  connect_four: connectFourModule,
  memory_match: memoryMatchModule,
  would_you_rather: createAnswerBothGame(WOULD_YOU_RATHER),
  this_or_that: createAnswerBothGame(THIS_OR_THAT),
  couple_questions: createTurnBasedQuestionGame(COUPLE_QUESTIONS),
  truth_or_dare: createTurnBasedQuestionGame(TRUTH_OR_DARE),
  how_well_do_you_know_me: createTurnBasedQuestionGame(HOW_WELL_DO_YOU_KNOW_ME),
};

export function getGameModule(key: GameKey): GameModule {
  const module = GAME_MODULES[key];
  if (!module) throw new Error(`Unknown game key: ${key}`);
  return module;
}
