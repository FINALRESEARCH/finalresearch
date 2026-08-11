import { defineEnableDraftMode } from 'next-sanity/draft-mode'
import { previewClient } from '@/sanity/lib/client'

/**
 * Enabling draft mode lets the caller bypass the portal passcode, so this must
 * be impossible to trigger by guessing a URL.
 *
 * `defineEnableDraftMode` validates a single-use secret that Presentation
 * writes into the dataset and appends to the preview URL. Only someone already
 * authenticated in Studio can obtain one, and it's checked server-side against
 * the dataset before the draft cookie is issued.
 */
export const { GET } = defineEnableDraftMode({
  client: previewClient(),
})
