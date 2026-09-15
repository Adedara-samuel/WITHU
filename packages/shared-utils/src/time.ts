export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;

export function formatRelativeTime(iso: string | null | undefined): string {
  if (!iso) return "a while ago";
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < MINUTE_MS) return "just now";
  if (diff < HOUR_MS) return `${Math.floor(diff / MINUTE_MS)}m ago`;
  if (diff < DAY_MS) return `${Math.floor(diff / HOUR_MS)}h ago`;
  const days = Math.floor(diff / DAY_MS);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

export function isRecentlyActive(lastSeen: string | null | undefined, withinMs = 5 * MINUTE_MS): boolean {
  if (!lastSeen) return false;
  return Date.now() - new Date(lastSeen).getTime() < withinMs;
}

export function daysBetween(a: Date, b: Date): number {
  const startOfA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const startOfB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.round((startOfB - startOfA) / DAY_MS);
}

/** Consecutive-day streak, e.g. days since togetherSince or since last missed day. */
export function relationshipStreakDays(togetherSince: string): number {
  return Math.max(0, daysBetween(new Date(togetherSince), new Date()));
}
