/**
 * Simple in-memory rate limiter (sliding window counter).
 *
 * Suitable for single-instance deployments. For multi-instance (e.g. Vercel
 * serverless, multiple containers), this rate limiter is NOT effective because
 * each instance maintains its own counter. In that case, use a Redis-backed
 * rate limiter (e.g. @upstash/ratelimit) or a CDN-level rate limiter.
 */

interface RateEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateEntry>()

// Cleanup expired entries every 60 seconds
const CLEANUP_INTERVAL = 60_000
let lastCleanup = Date.now()

function cleanup() {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now
  for (const [key, entry] of store) {
    if (entry.resetAt <= now) store.delete(key)
  }
}

/**
 * Check rate limit for a given key.
 *
 * @param key       Unique identifier (e.g. IP, user ID, or composite)
 * @param max       Max allowed requests in the window
 * @param windowMs  Time window in milliseconds
 * @returns { allowed: boolean, remaining: number, retryAfterMs: number }
 */
export function checkRateLimit(
  key: string,
  max: number = 60,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  cleanup()

  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.resetAt <= now) {
    // New window
    store.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, remaining: max - 1, retryAfterMs: 0 }
  }

  if (entry.count >= max) {
    const retryAfterMs = entry.resetAt - now
    return { allowed: false, remaining: 0, retryAfterMs }
  }

  entry.count++
  return { allowed: true, remaining: max - entry.count, retryAfterMs: 0 }
}

/**
 * Get rate-limit headers for a NextResponse.
 */
export function rateLimitHeaders(
  result: ReturnType<typeof checkRateLimit>
): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': String(result.remaining),
  }
  if (!result.allowed) {
    headers['Retry-After'] = String(Math.ceil(result.retryAfterMs / 1000))
    headers['X-RateLimit-Remaining'] = '0'
  }
  return headers
}
