export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars

export function generateInviteCode(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return code;
}

/** Drift correction threshold for watch/listen sync, in seconds. */
export const SYNC_DRIFT_TOLERANCE_SECONDS = 1.5;

export function needsResync(localPosition: number, authoritativePosition: number): boolean {
  return Math.abs(localPosition - authoritativePosition) > SYNC_DRIFT_TOLERANCE_SECONDS;
}
