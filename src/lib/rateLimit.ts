/**
 * In-memory sliding-window rate limiter.
 *
 * Runs only in Node.js route handlers (App Router).
 * NOT suitable for Edge Runtime (no shared memory across instances).
 *
 * Sliding window log algorithm:
 *   – Keeps a list of request timestamps per key.
 *   – On each call, prunes entries older than `windowMs`.
 *   – Denies the request if the remaining count ≥ limit.
 */

// ── Types ─────────────────────────────────────────────────────────────────────

interface WindowEntry {
  /** Sorted ascending list of accepted request timestamps (ms). */
  timestamps: number[]
}

export interface RateLimitResult {
  /** Whether this request is within the allowed rate. */
  ok: boolean
  /** Maximum requests allowed in the window. */
  limit: number
  /** How many requests are still allowed right now. */
  remaining: number
  /** Milliseconds until the oldest timestamp expires (= when quota recovers). */
  resetIn: number
}

// ── Store ─────────────────────────────────────────────────────────────────────

const store = new Map<string, WindowEntry>()

// Auto-cleanup: remove entries inactive for more than 10 minutes every 5 min.
// `unref()` prevents this from keeping the process alive in dev / test.
let _cleanupStarted = false

function startCleanup() {
  if (_cleanupStarted) return
  _cleanupStarted = true
  const timer = setInterval(() => {
    const cutoff = Date.now() - 10 * 60_000
    for (const [key, entry] of store) {
      if (!entry.timestamps.length || entry.timestamps.at(-1)! < cutoff) {
        store.delete(key)
      }
    }
  }, 5 * 60_000)
  // Don't block process exit in test/dev environments
  if (typeof timer === "object" && "unref" in timer) timer.unref()
}

// ── Core function ─────────────────────────────────────────────────────────────

/**
 * Check and record a request for `key`.
 *
 * @param key       Unique identifier per client, e.g. `"review:192.168.1.1"`
 * @param limit     Max requests allowed in `windowMs`
 * @param windowMs  Sliding window size in milliseconds
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number,
): RateLimitResult {
  startCleanup()

  const now = Date.now()
  const cutoff = now - windowMs
  const entry = store.get(key) ?? { timestamps: [] }

  // Prune expired timestamps
  entry.timestamps = entry.timestamps.filter((t) => t > cutoff)

  const count = entry.timestamps.length
  const ok = count < limit

  if (ok) {
    entry.timestamps.push(now)
  }

  store.set(key, entry)

  // Time until the oldest accepted request falls out of the window
  const resetIn =
    entry.timestamps.length > 0
      ? Math.max(0, entry.timestamps[0] + windowMs - now)
      : windowMs

  return {
    ok,
    limit,
    remaining: Math.max(0, limit - entry.timestamps.length),
    resetIn,
  }
}

// ── IP extraction ─────────────────────────────────────────────────────────────

/**
 * Extract the client IP from a Next.js request (works with both
 * `Request` and `NextRequest`).
 *
 * Priority: x-forwarded-for (first hop) → x-real-ip → fallback
 */
export function getClientIP(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()

  const realIP = req.headers.get("x-real-ip")
  if (realIP) return realIP.trim()

  return "127.0.0.1"
}

// ── Response helper ───────────────────────────────────────────────────────────

/**
 * Build a 429 JSON response with standard rate-limit headers.
 *
 * @param result  The result from `checkRateLimit`
 * @param message Optional custom message (defaults to a friendly English message)
 */
export function rateLimitResponse(
  result: RateLimitResult,
  message?: string,
): Response {
  const retryAfterSecs = Math.ceil(result.resetIn / 1000)
  const body = JSON.stringify({
    error:
      message ??
      `Too many requests. Please wait ${retryAfterSecs} second${retryAfterSecs !== 1 ? "s" : ""} before trying again.`,
    retryAfter: retryAfterSecs,
  })

  return new Response(body, {
    status: 429,
    headers: {
      "Content-Type": "application/json",
      "Retry-After": String(retryAfterSecs),
      "X-RateLimit-Limit": String(result.limit),
      "X-RateLimit-Remaining": "0",
      "X-RateLimit-Reset": String(Math.ceil((Date.now() + result.resetIn) / 1000)),
    },
  })
}
