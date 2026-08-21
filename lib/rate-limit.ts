// Minimal in-memory sliding-window rate limiter.
//
// This is fine for a single-instance deployment or local dev, but it does
// NOT share state across serverless instances or multiple servers. Before
// going live behind more than one instance, swap this for a shared store
// (e.g. Upstash Redis + @upstash/ratelimit) — the call sites below are
// already isolated in this one file so that swap is a single-file change.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Periodically sweep to avoid unbounded memory growth in long-lived processes.
setInterval(() => {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}, 60_000).unref?.();

export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (bucket.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  bucket.count += 1;
  return { allowed: true, remaining: limit - bucket.count };
}
