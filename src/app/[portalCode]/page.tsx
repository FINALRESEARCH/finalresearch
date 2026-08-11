import { cookies, draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { getPortalSummary, isPortalCode } from '@/lib/portal/queries'
import { formatProjectTitle } from '@/lib/portal/format'
import { cookieName, verifySession } from '@/lib/portal/session'
import { PortalFooter, PortalHeader } from '@/components/portal/PortalChrome'
import { UnlockForm } from './UnlockForm'

// Private, per-visitor, and revocable in real time — never prerender.
export const dynamic = 'force-dynamic'

export default async function PortalIndex({
  params,
}: {
  params: Promise<{ portalCode: string }>
}) {
  const { portalCode } = await params

  if (!isPortalCode(portalCode)) notFound()

  // Draft mode is only reachable through the Studio-authenticated enable
  // route, so it doubles as proof of an editor session.
  const { isEnabled: preview } = await draftMode()

  const portal = await getPortalSummary(portalCode, preview)

  // Revoked portals are indistinguishable from portals that never existed.
  // Editors still preview revoked portals; clients never see them.
  if (!portal || (portal.status !== 'live' && !preview)) notFound()

  const jar = await cookies()
  const unlocked =
    preview ||
    (await verifySession(jar.get(cookieName(portalCode))?.value, portalCode))

  if (!unlocked) {
    return (
      <main className="fr-portal__gate">
        <div className="fr-portal__mark">FINAL RESEARCH</div>
        <UnlockForm portalCode={portalCode} />
      </main>
    )
  }

  // Highest PRES_XX number first — the most recent client presentation leads.
  const pages = (portal.pages?.filter((p) => p?.slug) ?? []).sort((a, b) =>
    b.title.localeCompare(a.title),
  )

  return (
    <main className="fr-portal__main">
      <PortalHeader />

      {pages.length === 0 ? (
        <p className="fr-portal__empty">Nothing here yet.</p>
      ) : (
        <ul className="fr-portal__index">
          {pages.map((page) => (
            <li key={page.slug}>
              <Link href={`/${portalCode}/${page.slug}`} className="fr-portal__link">
                <span className="fr-portal__link-title">{page.title}</span>
                {page.summary && (
                  <span className="fr-portal__link-summary">{page.summary}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}

      <PortalFooter code={portalCode} />
    </main>
  )
}
