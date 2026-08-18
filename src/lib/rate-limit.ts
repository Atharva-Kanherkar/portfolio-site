import { AGENT_CORS } from './agent-http';

// The assistant endpoints are unauthenticated, CORS-open, and advertised in
// robots.txt and llms.txt, so anything on the internet can spend the OpenAI
// budget. This is a per-instance in-memory bucket: serverless runs several
// instances, so the real ceiling is a multiple of MAX_REQUESTS. It is meant to
// blunt casual abuse and runaway crawlers, not to be an exact quota. Swap in a
// shared store (KV/Redis) if that ever stops being enough.
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;
const MAX_TRACKED_CLIENTS = 5000;

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
  // A flood of unique keys must not grow the map without bound.
  if (buckets.size > MAX_TRACKED_CLIENTS) buckets.clear();
}

// Reading context.clientAddress throws on adapters that do not supply it, and
// destructuring it in a route signature invokes that getter on every request.
// Take it lazily and fall back to the proxy headers instead of 500-ing.
export function clientKey(context: { request: Request; clientAddress?: string }): string {
  try {
    if (context.clientAddress) return context.clientAddress;
  } catch {
    // Adapter does not expose it; the headers below are enough.
  }
  const forwarded = context.request.headers.get('x-forwarded-for');
  // x-forwarded-for is client, proxy1, proxy2 — the first entry is the caller.
  if (forwarded) return forwarded.split(',')[0]!.trim();
  return context.request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfterSeconds: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  prune(now);

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { ok: true };
  }

  if (bucket.count >= MAX_REQUESTS) {
    return { ok: false, retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)) };
  }

  bucket.count += 1;
  return { ok: true };
}

export const RATE_LIMIT_MESSAGE = `Too many requests. This assistant allows ${MAX_REQUESTS} questions per minute per client. Bulk facts are free and unlimited at /for-agents.md, /llms-full.txt, and /api/site.json.`;

export function rateLimitResponse(context: {
  request: Request;
  clientAddress?: string;
}): Response | null {
  const verdict = checkRateLimit(clientKey(context));
  if (verdict.ok) return null;
  return new Response(JSON.stringify({ error: RATE_LIMIT_MESSAGE }), {
    status: 429,
    headers: {
      ...AGENT_CORS,
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'Retry-After': String(verdict.retryAfterSeconds),
    },
  });
}
