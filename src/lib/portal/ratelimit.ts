import 'server-only'

import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

/**
 * Two tiers, because a 4-digit code is only 10,000 guesses:
 *   burst — 5 attempts per 10 minutes, stops a fast script
 *   daily — 25 attempts per 24 hours, stops a slow one
 *
 * Without Upstash configured this falls back to an in-process limiter. That is
 * fine for `next dev`, and useless in production: serverless instances don't
 * share memory, so an attacker just gets a fresh budget per cold start.
 * `assertRateLimiterReady()` refuses to boot production in that state.
 */

const BURST = { limit: 5, windowSeconds: 10 * 60 }
const DAILY = { limit: 25, windowSeconds: 24 * 60 * 60 }

export type RateLimitResult = {
  allowed: boolean
  /** Seconds until the caller may try again. Only meaningful when blocked. */
  retryAfter: number
}

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN
const usingUpstash = Boolean(url && token)

export function assertRateLimiterReady(): void {
  if (process.env.NODE_ENV === 'production' && !usingUpstash) {
    throw new Error(
      'Portal rate limiting requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in production',
    )
  }
}

const redis = usingUpstash ? new Redis({ url: url!, token: token! }) : null

const burstLimiter = redis
  ? new Ratelimit({
      redis,
      prefix: 'fr:portal:burst',
      limiter: Ratelimit.slidingWindow(BURST.limit, `${BURST.windowSeconds} s`),
      analytics: false,
    })
  : null

const dailyLimiter = redis
  ? new Ratelimit({
      redis,
      prefix: 'fr:portal:daily',
      limiter: Ratelimit.slidingWindow(DAILY.limit, `${DAILY.windowSeconds} s`),
      analytics: false,
    })
  : null

// --- in-memory fallback (dev only) ---

const memory = new Map<string, number[]>()

function memoryCheck(
  key: string,
  limit: number,
  windowSeconds: number,
): RateLimitResult {
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  const hits = (memory.get(key) || []).filter((t) => now - t < windowMs)

  if (hits.length >= limit) {
    const oldest = Math.min(...hits)
    return {
      allowed: false,
      retryAfter: Math.ceil((oldest + windowMs - now) / 1000),
    }
  }

  hits.push(now)
  memory.set(key, hits)
  return { allowed: true, retryAfter: 0 }
}

/**
 * Consumes one attempt against both tiers. Call this before comparing the
 * passcode, so failures and successes alike cost budget.
 */
export async function consumeUnlockAttempt(
  portalCode: string,
  ip: string,
): Promise<RateLimitResult> {
  const key = `${portalCode}:${ip}`

  if (burstLimiter && dailyLimiter) {
    try {
      const [burst, daily] = await Promise.all([
        burstLimiter.limit(key),
        dailyLimiter.limit(key),
      ])
      const blocked = [burst, daily].filter((r) => !r.success)
      if (blocked.length > 0) {
        const soonest = Math.min(...blocked.map((r) => r.reset))
        return {
          allowed: false,
          retryAfter: Math.max(1, Math.ceil((soonest - Date.now()) / 1000)),
        }
      }
      return { allowed: true, retryAfter: 0 }
    } catch (error) {
      // Redis unreachable or quota exhausted. Fail CLOSED: an unavailable
      // limiter must block guessing, not wave it through. The cost is that a
      // Redis outage locks clients out of unlocking — the right trade here,
      // since an already-unlocked client keeps their cookie and stays in.
      console.error('[portal] rate limiter unavailable, denying', error)
      return { allowed: false, retryAfter: 60 }
    }
  }

  const burst = memoryCheck(`burst:${key}`, BURST.limit, BURST.windowSeconds)
  if (!burst.allowed) return burst
  return memoryCheck(`daily:${key}`, DAILY.limit, DAILY.windowSeconds)
}
