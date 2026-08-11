import 'server-only'

import { SignJWT, jwtVerify } from 'jose'

const SESSION_DAYS = 7

function secret(): Uint8Array {
  const value = process.env.PORTAL_SESSION_SECRET
  if (!value) throw new Error('Missing environment variable: PORTAL_SESSION_SECRET')
  return new TextEncoder().encode(value)
}

/**
 * One cookie per portal, scoped to that portal's path — unlocking one client
 * never grants access to another, even on a shared browser.
 */
export function cookieName(portalCode: string): string {
  return `fr_portal_${portalCode}`
}

export function cookiePath(portalCode: string): string {
  return `/${portalCode}`
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
