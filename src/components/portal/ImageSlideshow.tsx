'use client'

import { useRef, useState } from 'react'

export type SlideshowImage = { src: string; alt: string; lqip?: string }

/**
 * Same frame as a single fr-figure image, but the stage swipes/clicks
 * through a row of slides. Controls reuse the video player's text-button
 * chrome (fr-player__button/__time) so the two feel like one system.
 */
export function ImageSlideshow({
  slides,
  caption,
  widthPercent,
}: {
  slides: SlideshowImage[]
  caption?: string
  widthPercent: number
}) {
  const [index, setIndex] = useState(0)
  // Once a src has loaded, jumping back to it (browser cache) shouldn't
  // flash the blurred placeholder again before onLoad re-fires.
  const [loadedSrcs, setLoadedSrcs] = useState<Set<string>>(new Set())
  // Without this, a failed fetch (session lapsed, asset check flaked) never
  // fires onLoad — the blur placeholder would sit there looking stuck forever.
  const [erroredSrcs, setErroredSrcs] = useState<Set<string>>(new Set())
  const touchStartX = useRef<number | null>(null)
  const count = slides.length

  if (count === 0) return null

  function go(delta: number) {
    setIndex((i) => (i + delta + count) % count)
  }

  const current = slides[index]
  const isLoaded = loadedSrcs.has(current.src)
  const isErrored = erroredSrcs.has(current.src)

  return (
    <figure
      className="fr-figure"
      style={{ '--fr-figure-width': `${widthPercent}%` } as never}
    >
      <div
        className="fr-slideshow__stage"
        onTouchStart={(e) => {
          touchStartX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchStartX.current === null) return
          const delta = e.changedTouches[0].clientX - touchStartX.current
          touchStartX.current = null
          // A real swipe already navigated — suppress the synthetic click
          // that would otherwise fire right after and double-advance.
          if (Math.abs(delta) < 40) return
          e.preventDefault()
          go(delta < 0 ? 1 : -1)
        }}
      >
        {/* Proxied bytes: Next's optimizer would need a public URL. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.src}
          alt={current.alt}
          style={isErrored ? { display: 'none' } : undefined}
          onLoad={() =>
            setLoadedSrcs((prev) =>
              prev.has(current.src) ? prev : new Set(prev).add(current.src),
            )
          }
          onError={() =>
            setErroredSrcs((prev) =>
              prev.has(current.src) ? prev : new Set(prev).add(current.src),
            )
          }
        />
        {current.lqip && !isErrored && (
          // Sanity's precomputed blur data URI — swaps instantly on nav,
          // no network round trip, and fades out once the real image loads.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            aria-hidden="true"
            alt=""
            className={`fr-slideshow__placeholder${isLoaded ? ' fr-slideshow__placeholder--hidden' : ''}`}
            src={current.lqip}
          />
        )}
        {isErrored && (
          <div className="fr-slideshow__error">Couldn't load this image</div>
        )}
        <button
          type="button"
          className="fr-slideshow__hitzone fr-slideshow__hitzone--prev"
          onClick={() => go(-1)}
          aria-label="Previous slide"
        />
        <button
          type="button"
          className="fr-slideshow__hitzone fr-slideshow__hitzone--next"
          onClick={() => go(1)}
          aria-label="Next slide"
        />
      </div>

      <div className="fr-player__controls fr-slideshow__controls">
        <button
          type="button"
          className="fr-player__button"
          onClick={() => go(-1)}
          disabled={count < 2}
          aria-label="Previous slide"
        >
          PREV
        </button>
        <span className="fr-player__time">
          {index + 1} / {count}
        </span>
        <button
          type="button"
          className="fr-player__button"
          onClick={() => go(1)}
          disabled={count < 2}
          aria-label="Next slide"
        >
          NEXT
        </button>
      </div>

      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}
