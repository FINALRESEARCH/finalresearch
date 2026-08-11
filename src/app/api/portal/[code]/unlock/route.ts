import { timingSafeEqual } from 'node:crypto'
import { NextResponse, type NextRequest } from 'next/server'

import { getPortalAuth, isPortalCode } from '@/lib/portal/queries'
import {
  assertRateLimiterReady,
  consumeUnlockAttempt,
} from '@/lib/portal/ratelimit'
import {
  cookieName,
  cookiePath,
  issueSession,
  sessionCookieOptions,
} from '@/lib/portal/session'
import { isFirstUnlock, recordEvent } from '@/lib/portal/events'
import { notifyFirstOpen } from '@/lib/portal/notify'

/**
 * Every failure path returns the same body and status. A caller cannot tell a
 * wrong code from a portal that doesn't exist from one that's been revoked —
 * otherwise this endpoint becomes an oracle for enumerating client codes.
 */
const DENIED = { ok: false as const, error: 'Incorrect code' }

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params

  if (!isPortalCode(code)) {
    return NextResponse.json(DENIED, { status: 401 })
  }

  // Refuse to serve unlocks in production without a shared rate limiter —
  // an in-memory limiter across serverless instances is no limiter at all.
  try {
    assertRateLimiterReady()
  } catch (error) {
    console.error('[portal]', error)
    return NextResponse.json(
      { ok: false, error: 'Temporarily unavailable' },
      { status: 503 },
    )
  }

  const ip = clientIp(request)

  // Spend budget before touching the passcode, so guessing always costs.
  const limit = await consumeUnlockAttempt(code, ip)
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many attempts. Try again later.' },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfter) } },
    )
  }

  let submitted: string
  try {
    const body = await request.json()
    submitted = typeof body?.passcode === 'string' ? body.passcode : ''
  } catch {
    return NextResponse.json(DENIED, { status: 401 })
  }

  const portal = await getPortalAuth(code)

  if (!portal || portal.status !== 'live') {
    return NextResponse.json(DENIED, { status: 401 })
  }

  if (!constantTimeEquals(submitted, portal.passcode)) {
    await recordEvent({
      portalId: portal._id,
      kind: 'failed',
      path: `/${code}`,
      ip,
      userAgent: request.headers.get('user-agent'),
    })
    return NextResponse.json(DENIED, { status: 401 })
  }

  const token = await issueSession(code)
  const response = NextResponse.json({ ok: true })
  response.cookies.set({
    name: cookieName(code),
    value: token,
    path: cookiePath(code),
    ...sessionCookieOptions,
  })

  // Checked before the event is written, or the unlock we're about to log
  // would itself make this look like a repeat visit.
  const first = await isFirstUnlock(portal._id)

  await recordEvent({
    portalId: portal._id,
    kind: 'unlock',
    path: `/${code}`,
    ip,
    userAgent: request.headers.get('user-agent'),
  })

  if (first) {
    await notifyFirstOpen({ portalCode: code })
  }

  return response
}
