import { createClient, type SanityClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

/**
 * Server-only Sanity clients.
 *
 * The portals dataset is private, so every read needs a token — there is no
 * anonymous/CDN path. That also means this module must never reach the browser:
 * importing it from a Client Component would bundle the tokens.
 */
if (typeof window !== 'undefined') {
  throw new Error('src/sanity/lib/client.ts was imported in the browser')
}

const writeToken = process.env.SANITY_API_WRITE_TOKEN
if (!writeToken) {
  throw new Error('Missing environment variable: SANITY_API_WRITE_TOKEN')
}

const base = {
  projectId,
  dataset,
  apiVersion,
  // Private dataset: the CDN can't serve authenticated reads.
  useCdn: false,
} as const

/**
 * stega.studioUrl must be an absolute URL — the overlay uses it to know where
 * to postMessage the editor connection. A relative path renders overlays that
 * silently never connect.
 */
function studioOrigin(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

/** Published content, no stega. What clients see. */
export const sanityClient: SanityClient = createClient({
  ...base,
  token: writeToken,
  perspective: 'published',
})

/**
 * Drafts with stega encoding, for the Studio preview pane only.
 *
 * Stega hides field metadata inside string values as zero-width characters.
 * That is what makes text clickable in Presentation — and exactly why it must
 * never appear in published output: those characters ride along when a client
 * copies text out of a proposal.
 */
export function previewClient(): SanityClient {
  const readToken = process.env.SANITY_API_READ_TOKEN
  if (!readToken) {
    throw new Error('Missing environment variable: SANITY_API_READ_TOKEN')
  }
  return createClient({
    ...base,
    token: readToken,
    perspective: 'drafts',
    // Stega encodes field paths taken from the content source map. Without
    // this the stega option is silently a no-op and nothing is clickable.
    resultSourceMap: 'withKeyArraySelector',
    stega: {
      enabled: true,
      studioUrl: `${studioOrigin()}/studio`,
    },
  })
}

/** Picks the right client for the request. `preview` comes from draftMode(). */
export function getClient(preview: boolean): SanityClient {
  return preview ? previewClient() : sanityClient
}
