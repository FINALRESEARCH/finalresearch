import 'server-only'

import { SignJWT, jwtVerify } from 'jose'

const SESSION_DAYS = 7

function secret(): Uint8Array {
  const value = process.env.PORTAL_SESSION_SECRET
  if (!value) throw new Error('Missing environment variable: PORTAL_SESSION_SECRET')
  return new TextEncoder().encode(value)
}

/**
 * One cookie per portal — unlocking one client never grants access to
 * another, even on a shared browser. That isolation comes from the JWT's
 * `sub` claim (checked in verifySession), not from cookie scoping: the asset
 * proxy lives at /api/portal/<code>/asset/*, outside the /<code>/* page
 * path, so the cookie has to be set at the root or the browser simply never
 * sends it there.
 *
 * The `_v2` bump is deliberate, not decorative: cookies issued before the
 * path fix above are scoped to /<code> and silently never reach the asset
 * proxy, so old sessions would otherwise sit there "unlocked" but broken
 * until they expired on their own (up to 7 days). Renaming the cookie makes
 * every pre-fix session a miss, forcing one clean re-unlock instead of a
 * slow bleed of "images won't load" reports.
 */
export function cookieName(portalCode: string): string {
  return `fr_portal_v2_${portalCode}`
}

export function cookiePath(): string {
  return '/'
}

export async function issueSession(portalCode: string): Promise<string> {
  return new SignJWT({ code: portalCode })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(portalCode)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(secret())
}

/**
 * True only if the token is well-signed, unexpired, and issued for this exact
 * portal. A token minted for another portal fails the subject check.
 */
export async function verifySession(
  token: string | undefined,
  portalCode: string,
): Promise<boolean> {
  if (!token) return false
  try {
    const { payload } = await jwtVerify(token, secret(), {
      algorithms: ['HS256'],
    })
    return payload.sub === portalCode
  } catch {
    return false
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: SESSION_DAYS * 24 * 60 * 60,
}
