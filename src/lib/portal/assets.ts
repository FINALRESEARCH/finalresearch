import 'server-only'

import { sanityClient } from '@/sanity/lib/client'
import { dataset, projectId } from '@/sanity/env'

/**
 * Sanity asset URLs are NOT protected by dataset visibility — a private dataset
 * still serves its assets to anyone holding the URL. That is exactly why the
 * portal never emits cdn.sanity.io links: the proxy is the only thing standing
 * between a forwarded URL and the file.
 */

export type ParsedAssetRef = {
  kind: 'image' | 'file'
  id: string
  extension: string
  dimensions?: string
}

/**
 * image-6f2a...-1200x800-jpg  ->  { image, 6f2a..., jpg, 1200x800 }
 * file-6f2a...-pdf            ->  { file,  6f2a..., pdf }
 */
export function parseAssetRef(ref: string): ParsedAssetRef | null {
  const parts = ref.split('-')
  if (parts.length < 3) return null

  const [kind, id, ...rest] = parts
  if (kind !== 'image' && kind !== 'file') return null
  if (!/^[a-f0-9]{20,}$/i.test(id)) return null

  const extension = rest[rest.length - 1]
  if (!/^[a-z0-9]{1,8}$/i.test(extension)) return null

  const dimensions = kind === 'image' && rest.length > 1 ? rest[0] : undefined
  if (dimensions && !/^\d+x\d+$/.test(dimensions)) return null

  return { kind, id, extension, dimensions }
}

export function assetCdnUrl(parsed: ParsedAssetRef): string {
  const base = `https://cdn.sanity.io/${parsed.kind === 'image' ? 'images' : 'files'}/${projectId}/${dataset}`
  const name =
    parsed.kind === 'image' && parsed.dimensions
      ? `${parsed.id}-${parsed.dimensions}.${parsed.extension}`
      : `${parsed.id}.${parsed.extension}`
  return `${base}/${name}`
}

/**
 * Confirms the asset is actually referenced by one of this portal's pages.
 * Without this, an unlocked client could pull any asset in the dataset by id —
 * ids are unguessable, but "unguessable" is not an access control.
 */
export async function assetBelongsToPortal(
  portalCode: string,
  assetId: string,
): Promise<boolean> {
  const query = `count(*[
    _type == "portalPage"
    && references($assetId)
    && _id in *[_type == "clientPortal" && projectCode.current == $portalCode][0].pages[]._ref
  ])`
  try {
    const count = await sanityClient.fetch<number>(query, {
      assetId,
      portalCode,
    })
    return count > 0
  } catch {
    return false
  }
}

/** Only these reach the Sanity image pipeline; everything else is dropped. */
const ALLOWED_IMAGE_PARAMS = new Set([
  'w',
  'h',
  'fit',
  'q',
  'auto',
  'dpr',
  'rect',
  'fm',
])

export function buildImageQuery(search: URLSearchParams): string {
  const out = new URLSearchParams()
  for (const [key, value] of search) {
    if (!ALLOWED_IMAGE_PARAMS.has(key)) continue
    if (!/^[\w,.-]{1,40}$/.test(value)) continue
    out.set(key, value)
  }
  const s = out.toString()
  return s ? `?${s}` : ''
}
