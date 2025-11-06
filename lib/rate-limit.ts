export class RateLimitError extends Error {
  status = 429;
  retryAfter: number;
  constructor(message: string, retryAfter: number) {
    super(message);
    this.retryAfter = retryAfter;
  }
}

type Bucket = {
  count: number;
  expiresAt: number;
};

const store = new Map<string, Bucket>();

export function enforceRateLimit(
  key: string,
  limit = Number(process.env.RATE_LIMIT_DEFAULT ?? 100),
  windowSeconds = Number(process.env.RATE_LIMIT_WINDOW_SEC ?? 300)
) {
  const now = Date.now();
  const bucket = store.get(key);

  if (!bucket || bucket.expiresAt <= now) {
    store.set(key, { count: 1, expiresAt: now + windowSeconds * 1000 });
    return;
  }

  if (bucket.count >= limit) {
    const retryAfter = Math.ceil((bucket.expiresAt - now) / 1000);
    throw new RateLimitError("Limite de requisições atingido", retryAfter);
  }

  bucket.count += 1;
}
