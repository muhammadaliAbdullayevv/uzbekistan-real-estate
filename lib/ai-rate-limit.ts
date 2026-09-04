// In-memory per-user sliding window. Resets on process restart and doesn't
// share state across instances -- acceptable here since this runs as a
// single process on one VPS, and it exists to protect a free API quota from
// one runaway user, not as a hard security boundary.
const requestTimestamps = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000;

export function isAiRateLimited(userId: string, maxPerHour: number) {
  const now = Date.now();
  const timestamps = (requestTimestamps.get(userId) ?? []).filter((ts) => now - ts < WINDOW_MS);

  if (timestamps.length >= maxPerHour) {
    requestTimestamps.set(userId, timestamps);
    return true;
  }

  timestamps.push(now);
  requestTimestamps.set(userId, timestamps);
  return false;
}
