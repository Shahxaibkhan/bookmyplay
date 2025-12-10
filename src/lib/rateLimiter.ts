type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

export type RateLimitResult = {
  ok: boolean;
  remaining: number;
  retryAfter: number;
  reset: number;
};

type Bucket = {
  count: number;
  expiresAt: number;
};

const DEFAULT_LIMIT = 5;
const DEFAULT_WINDOW_MS = 60_000;

declare global {
  // eslint-disable-next-line no-var
  var __globalRateLimitStore: Map<string, Bucket> | undefined;
}

const store: Map<string, Bucket> = globalThis.__globalRateLimitStore || new Map();
globalThis.__globalRateLimitStore = store;

export function rateLimit(
  identifier: string,
  { limit = DEFAULT_LIMIT, windowMs = DEFAULT_WINDOW_MS }: RateLimitOptions = {},
): RateLimitResult {
  const now = Date.now();
  const bucket = store.get(identifier);

  if (!bucket || bucket.expiresAt <= now) {
    const expiresAt = now + windowMs;
    store.set(identifier, { count: 1, expiresAt });
    return {
      ok: true,
      remaining: limit - 1,
      retryAfter: 0,
      reset: Math.ceil(expiresAt / 1000),
    };
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.max(0, Math.ceil((bucket.expiresAt - now) / 1000));
    return {
      ok: false,
      remaining: 0,
      retryAfter,
      reset: Math.ceil(bucket.expiresAt / 1000),
    };
  }

  bucket.count += 1;
  store.set(identifier, bucket);

  return {
    ok: true,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter: 0,
    reset: Math.ceil(bucket.expiresAt / 1000),
  };
}
