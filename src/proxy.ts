import { NextResponse, type NextRequest } from 'next/server'

/**
 * Belt-and-braces noindex. The page-level metadata already emits a robots meta
 * tag, but that only helps for HTML — the header covers proxied PDFs, images,
 * and downloads too, which have no <head> to put a tag in.
 *
 * Worth being clear-eyed: this is a request, not a control. Well-behaved
 * crawlers honour it; the passcode and asset proxy are what actually enforce
 * privacy.
 */
const NOINDEX = 'noindex, nofollow, noarchive, nosnippet, noimageindex'

/**
 * Matched by prefix in code rather than in `config.matcher`: matcher patterns
 * split on path segments, so `/fr-:path*` never matches `/fr-00-c-test`
 * (the `fr-` prefix isn't a segment boundary).
 */
function isPrivatePath(pathname: string): boolean {
  return (
    pathname.startsWith('/fr-') ||
    pathname.startsWith('/studio') ||
    pathname.startsWith('/api/portal/')
  )
}

export default function proxy(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  if (!isPrivatePath(pathname)) return response

  response.headers.set('X-Robots-Tag', NOINDEX)
  // Portal URLs must never leak to third-party links via the Referer header.
  response.headers.set('Referrer-Policy', 'no-referrer')

  if (pathname.startsWith('/api/portal/')) {
    response.headers.set('Cache-Control', 'private, no-store')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
