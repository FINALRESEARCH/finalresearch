import { PortableText, type PortableTextComponents } from '@portabletext/react'

import { ImageSlideshow } from './ImageSlideshow'

export type RichTextBlock = {
  _key: string
  content?: unknown[]
}

/**
 * Images route through the portal proxy, never cdn.sanity.io, so a right-click
 * "copy image address" yields a URL that dies with the session.
 */
function components(portalCode: string): PortableTextComponents {
  return {
    block: {
      // Paragraphs render left-aligned by default; editors opt a block into
      // centering by picking the "Centered" style in the toolbar.
      center: ({ children }) => <p style={{ textAlign: 'center' }}>{children}</p>,
    },
    types: {
      image: ({ value }) => {
        const ref: string | undefined = value?.asset?._ref
        if (!ref) return null
        const src = `/api/portal/${portalCode}/asset/${ref}?w=1600&auto=format`
        const widthPercent: number =
          typeof value?.widthPercent === 'number' ? value.widthPercent : 100
        return (
          <figure
            className="fr-figure"
            style={{ '--fr-figure-width': `${widthPercent}%` } as never}
          >
            {/* Proxied bytes: Next's optimizer would need a public URL. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={value?.alt || ''} loading="lazy" />
            {value?.caption && <figcaption>{value.caption}</figcaption>}
          </figure>
        )
      },
      imageSlideshow: ({ value }) => {
        type Slide = {
          _key: string
          // Dereferenced in the portal page query (queries.ts) specifically to
          // pull the lqip blur placeholder — not the raw {_ref} shape.
          asset?: { ref?: string; lqip?: string }
          alt?: string
        }
        const slides: Slide[] = Array.isArray(value?.slides) ? value.slides : []
        const images = slides
          .map((slide) => {
            const ref = slide.asset?.ref
            if (!ref) return null
            return {
              src: `/api/portal/${portalCode}/asset/${ref}?w=1600&auto=format`,
              alt: slide.alt || '',
              lqip: slide.asset?.lqip,
            }
          })
          .filter(
            (slide): slide is { src: string; alt: string; lqip: string | undefined } =>
              slide !== null,
          )
        if (images.length === 0) return null
        const widthPercent: number =
          typeof value?.widthPercent === 'number' ? value.widthPercent : 100
        return (
          <ImageSlideshow
            slides={images}
            caption={value?.caption}
            widthPercent={widthPercent}
          />
        )
      },
      externalImage: ({ value }) => {
        const url: string | undefined = value?.url
        if (!url) return null
        const widthPercent: number =
          typeof value?.widthPercent === 'number' ? value.widthPercent : 100
        const linkUrl: string | undefined = value?.linkUrl
        const image = (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={value?.alt || ''} loading="lazy" />
        )
        return (
          <figure
            className="fr-figure"
            style={{ '--fr-figure-width': `${widthPercent}%` } as never}
          >
            {/* Hotlinked from its source (e.g. Are.na) — not a Sanity asset. */}
            {linkUrl ? (
              <a href={linkUrl} rel="noopener noreferrer" target="_blank">
                {image}
              </a>
            ) : (
              image
            )}
            {value?.caption && <figcaption>{value.caption}</figcaption>}
          </figure>
        )
      },
    },
    marks: {
      link: ({ value, children }) => (
        <a href={value?.href} rel="noopener noreferrer nofollow" target="_blank">
          {children}
        </a>
      ),
    },
  }
}

export function RichText({
  block,
  portalCode,
}: {
  block: RichTextBlock
  portalCode: string
}) {
  if (!block.content?.length) return null
  return (
    <div className="fr-richtext">
      <PortableText
        value={block.content as never}
        components={components(portalCode)}
      />
    </div>
  )
}
