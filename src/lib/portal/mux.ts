import 'server-only'

import Mux from '@mux/mux-node'

/**
 * Playback tokens are minted per request and expire quickly, so a player URL
 * copied out of devtools stops working within the hour rather than living
 * forever like an unlisted link.
 */
const TOKEN_TTL = '1h'

export function isMuxConfigured(): boolean {
  return Boolean(
    process.env.MUX_SIGNING_KEY_ID && process.env.MUX_SIGNING_KEY_PRIVATE,
  )
}

let client: Mux | null = null

function mux(): Mux {
  if (!client) {
    client = new Mux({
      tokenId: process.env.MUX_TOKEN_ID,
      tokenSecret: process.env.MUX_TOKEN_SECRET,
      jwtSigningKey: process.env.MUX_SIGNING_KEY_ID,
      jwtPrivateKey: process.env.MUX_SIGNING_KEY_PRIVATE,
    })
  }
  return client
}

export type MuxTokens = {
  playback: string
  thumbnail: string
  storyboard: string
}

/**
 * Returns null when Mux isn't configured, so a portal with a video block still
 * renders (with a placeholder) instead of throwing.
 */
export async function signPlayback(
  playbackId: string,
): Promise<MuxTokens | null> {
  if (!isMuxConfigured()) return null

  const sign = (type: 'video' | 'thumbnail' | 'storyboard') =>
    mux().jwt.signPlaybackId(playbackId, { type, expiration: TOKEN_TTL })

  const [playback, thumbnail, storyboard] = await Promise.all([
    sign('video'),
    sign('thumbnail'),
    sign('storyboard'),
  ])

  return { playback, thumbnail, storyboard }
}
