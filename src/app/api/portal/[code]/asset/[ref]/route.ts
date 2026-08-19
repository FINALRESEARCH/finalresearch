import { cookies, draftMode } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

import { isPortalCode } from '@/lib/portal/queries'
import { cookieName, verifySession } from '@/lib/portal/session'
import {
  assetBelongsToPortal,
  assetCdnUrl,
  assetDocumentId,
  buildImageQuery,
  parseAssetRef,
} from '@/lib/portal/assets'

/**
 * The only path by which portal media reaches a browser. Re-checks the session
 * on every byte served, so revoking access or letting a cookie lapse cuts off
 * assets too — not just pages.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string; ref: string }> },
) {
  const { code, ref } = await params

  if (!isPortalCode(code)) return new NextResponse(null, { status: 404 })

  // Mirrors the page routes: a Studio-authenticated preview session bypasses
  // the passcode gate here too, so drafts can be reviewed end-to-end.
  const { isEnabled: preview } = await draftMode()

  const jar = await cookies()
  const unlocked =
    preview ||
    (await verifySession(jar.get(cookieName(code))?.value, code))
  if (!unlocked) return new NextResponse(null, { status: 404 })

  const parsed = parseAssetRef(decodeURIComponent(ref))
  if (!parsed) return new NextResponse(null, { status: 404 })

  if (!(await assetBelongsToPortal(code, assetDocumentId(parsed), preview))) {
    return new NextResponse(null, { status: 404 })
  }

  const query =
    parsed.kind === 'image'
      ? buildImageQuery(request.nextUrl.searchParams)
      : ''

  const upstream = await fetch(`${assetCdnUrl(parsed)}${query}`, {
    // Revalidated by our own cache headers below; don't let Next cache bytes.
    cache: 'no-store',
  })

  if (!upstream.ok || !upstream.body) {
    return new NextResponse(null, { status: 404 })
  }

  const download = request.nextUrl.searchParams.get('dl') === '1'
  const headers = new Headers({
    'Content-Type':
      upstream.headers.get('content-type') || 'application/octet-stream',
    // Private: proxies and CDNs must not hold a copy that outlives the session.
    'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
    'X-Robots-Tag': 'noindex, noimageindex, nosnippet',
    'Content-Disposition': download ? 'attachment' : 'inline',
  })

  const length = upstream.headers.get('content-length')
  if (length) headers.set('Content-Length', length)

  return new NextResponse(upstream.body, { status: 200, headers })
}
