// Fixed-window in-memory rate limiter for the attempt endpoint. Keyed by
// session id (falling back to IP). Good enough for a single-node self-host; swap
// for Redis if you run multiple instances.

interface Window {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Window>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

export function rateLimit(
  key: string,
  limit = Number(process.env.RATE_LIMIT_MAX || 20),
  windowMs = Number(process.env.RATE_LIMIT_WINDOW_MS || 60_000),
): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const win = { count: 1, resetAt: now + windowMs };
    buckets.set(key, win);
    return { allowed: true, remaining: limit - 1, resetAt: win.resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    resetAt: existing.resetAt,
  };
}

/** Test helper to reset all buckets. */
export function _resetRateLimiter(): void {
  buckets.clear();
}
