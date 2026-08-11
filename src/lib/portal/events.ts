import 'server-only'

import { createHash } from 'node:crypto'
import { sanityClient } from '@/sanity/lib/client'

type EventInput = {
  portalId: string
  kind: 'unlock' | 'pageview' | 'failed'
  path: string
  ip: string
  userAgent: string | null
}

/** Salted with the session secret so the log never holds a raw address. */
function hashIp(ip: string): string {
  return createHash('sha256')
    .update(`${process.env.PORTAL_SESSION_SECRET || ''}:${ip}`)
    .digest('hex')
    .slice(0, 16)
}

/**
 * Logging is best-effort: a Sanity write failure must never block a client
 * from reaching their content, so this swallows errors after reporting them.
 */
export async function recordEvent(input: EventInput): Promise<void> {
  try {
    await sanityClient.create({
      _type: 'portalEvent',
      portal: { _type: 'reference', _ref: input.portalId, _weak: true },
      kind: input.kind,
      path: input.path,
      at: new Date().toISOString(),
      userAgent: input.userAgent?.slice(0, 300) || undefined,
      ipHash: hashIp(input.ip),
    })
  } catch (error) {
    console.error('[portal] failed to record event', error)
  }
}

/** True if this portal has never been unlocked before — drives the first-open email. */
export async function isFirstUnlock(portalId: string): Promise<boolean> {
  try {
    const count = await sanityClient.fetch<number>(
      `count(*[_type == "portalEvent" && portal._ref == $portalId && kind == "unlock"])`,
      { portalId },
    )
    return count === 0
  } catch {
    return false
  }
}
