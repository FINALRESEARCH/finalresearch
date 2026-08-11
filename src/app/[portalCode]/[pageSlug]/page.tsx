import { cookies, draftMode, headers } from 'next/headers'
import { notFound } from 'next/navigation'

import {
  getPortalPage,
  getPortalSummary,
  isPortalCode,
} from '@/lib/portal/queries'
import { cookieName, verifySession } from '@/lib/portal/session'
import { recordEvent } from '@/lib/portal/events'
import { BlockRenderer } from '@/components/portal/BlockRenderer'
import { PortalFooter, PortalHeader } from '@/components/portal/PortalChrome'
import { UnlockForm } from '../UnlockForm'

export const dynamic = 'force-dynamic'

export default async function PortalContentPage({
  params,
}: {
  params: Promise<{ portalCode: string; pageSlug: string }>
}) {
  const { portalCode, pageSlug } = await params

  if (!isPortalCode(portalCode)) notFound()

  const { isEnabled: preview } = await draftMode()

  const portal = await getPortalSummary(portalCode, preview)
  if (!portal || (portal.status !== 'live' && !preview)) notFound()

  const jar = await cookies()
  const unlocked =
    preview ||
    (await verifySession(jar.get(cookieName(portalCode))?.value, portalCode))

  // Deep links stay on their own URL: show the gate here, then continue
  // straight into this page once unlocked, instead of bouncing to /[portalCode].
  if (!unlocked) {
    return (
      <main className="fr-portal__gate">
        <div className="fr-portal__mark">FINAL RESEARCH</div>
        <UnlockForm portalCode={portalCode} />
      </main>
    )
  }

  const page = await getPortalPage(portalCode, pageSlug, preview)
  if (!page) notFound()

  // Your own preview passes aren't client activity — don't log them.
  if (!preview) {
    const headerList = await headers()
    await recordEvent({
      portalId: portal._id,
      kind: 'pageview',
      path: `/${portalCode}/${pageSlug}`,
      ip:
        headerList.get('x-forwarded-for')?.split(',')[0].trim() ||
        headerList.get('x-real-ip') ||
        'unknown',
      userAgent: headerList.get('user-agent'),
    })
  }

  return (
    <main className="fr-portal__main">
      <PortalHeader mark={page.title} subtitle={page.subtitle} />

      <BlockRenderer blocks={page.blocks} portalCode={portalCode} />

      <PortalFooter code={portalCode} />
    </main>
  )
}
