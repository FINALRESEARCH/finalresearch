import 'server-only'

import { defineQuery } from 'next-sanity'
import { getClient, sanityClient } from '@/sanity/lib/client'

/**
 * Every projection here is explicit. `passcode` appears in exactly one query
 * (`portalAuthQuery`), whose result never leaves this module — a `*[...]` splat
 * anywhere else would leak it into the RSC payload.
 */

export type PortalSummary = {
  _id: string
  code: string
  status: 'live' | 'revoked'
  pages: { title: string; slug: string }[]
}

const portalSummaryQuery = defineQuery(`
  *[_type == "clientPortal" && projectCode.current == $code][0]{
    _id,
    "code": projectCode.current,
    status,
    "pages": pages[]->{
      title,
      "slug": slug.current
    }
  }
`)

const portalAuthQuery = defineQuery(`
  *[_type == "clientPortal" && projectCode.current == $code][0]{
    _id,
    status,
    passcode
  }
`)

/**
 * Queried by slug, then constrained to pages this portal actually lists. The
 * `_id in ...pages[]._ref` clause is the access check: a page belonging to
 * another client can't be pulled up by guessing its slug.
 */
const portalPageQuery = defineQuery(`
  *[
    _type == "portalPage"
    && slug.current == $slug
    && _id in *[_type == "clientPortal" && projectCode.current == $code][0].pages[]._ref
  ][0]{
    title,
    "slug": slug.current,
    subtitle,
    blocks
  }
`)

/** Safe to render. Contains no passcode. */
export async function getPortalSummary(
  code: string,
  preview = false,
): Promise<PortalSummary | null> {
  return getClient(preview).fetch(portalSummaryQuery, { code })
}

/**
 * Server-only. The returned passcode must be compared and discarded — never
 * returned from a route handler or passed into a component.
 */
export async function getPortalAuth(
  code: string,
): Promise<{
  _id: string
  status: string
  passcode: string
} | null> {
  return sanityClient.fetch(portalAuthQuery, { code })
}

export async function getPortalPage(
  code: string,
  slug: string,
  preview = false,
) {
  return getClient(preview).fetch(portalPageQuery, { code, slug })
}

/** Project codes are lowercase alphanumeric with hyphens, e.g. fr-14-c-lore. */
export function isPortalCode(value: string): boolean {
  return /^[a-z0-9-]{3,40}$/.test(value) && value.startsWith('fr-')
}
