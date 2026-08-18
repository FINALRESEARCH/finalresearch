'use client'

import MuxVideo from '@mux/mux-video-react'
import { useCallback, useEffect, useRef, useState } from 'react'

/** Cycles on click, starting from 1x. */
const RATES = [1, 1.25, 1.5, 2, 0.5]

/**
 * Drops the hours field below an hour so short clips read "0:42", not
 * "0:00:42". `ref` (the duration) pads the leading field to a constant width —
 * without it the elapsed time gains a digit at 10:00 and shoves the scrubber
 * sideways mid-playback.
 */
function timecode(seconds: number, ref = seconds): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0
  const total = Math.floor(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const ss = String(s).padStart(2, '0')

  const refTotal = Number.isFinite(ref) && ref > 0 ? Math.floor(ref) : total
  const refH = Math.floor(refTotal / 3600)
  if (refH > 0 || h > 0) return `${h}:${String(m).padStart(2, '0')}:${ss}`

  const refM = Math.floor((refTotal % 3600) / 60)
  return `${String(m).padStart(String(refM).length, '0')}:${ss}`
}

/**
 * Reserves the width of the widest label so toggling never reflows the row.
 * Every option is rendered into the same grid cell; only the live one is
 * visible. Font-independent, unlike a hand-tuned min-width.
 */
function StableLabel({ value, options }: { value: string; options: string[] }) {
  return (
    <span className="fr-player__stable">
      {options.map((option) => (
        <span key={option} aria-hidden="true" className="fr-player__stable-ghost">
          {option}
        </span>
      ))}
      <span>{value}</span>
    </span>
  )
}

export type Chapter = {
  _key: string
  label?: string
  startSeconds?: number
}

export function VideoPlayer({
  playbackId,
  tokens,
  title,
  posterToken,
  aspectRatio,
  initialDuration,
  chapters,
}: {
  playbackId: string
  tokens: { playback: string; storyboard: string }
  title?: string
  posterToken?: string
  /** Mux reports "32:17" — normalised to a CSS ratio so the frame fits the
   *  actual asset instead of assuming 16:9. */
  aspectRatio?: string
  initialDuration?: number
  chapters?: Chapter[]
}) {
  const videoRef = useRef<HTMLVideoElement | undefined>(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const scrubberRef = useRef<HTMLDivElement>(null)

  const [playing, setPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(initialDuration ?? 0)
  const [buffered, setBuffered] = useState(0)
  const [rateIndex, setRateIndex] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [scrubbing, setScrubbing] = useState(false)

  const rate = RATES[rateIndex]

  const seekTo = useCallback((seconds: number) => {
    const v = videoRef.current
    if (!v) return
    const clamped = Math.min(Math.max(seconds, 0), v.duration || Infinity)
    v.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  const togglePlay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) void v.play()
    else v.pause()
  }, [])

  function cycleRate() {
    const next = (rateIndex + 1) % RATES.length
    setRateIndex(next)
    if (videoRef.current) videoRef.current.playbackRate = RATES[next]
  }

  /* Element fullscreen so the text controls come along; iOS Safari only allows
     it on the <video> itself, so fall back to that and lose the custom chrome
     rather than doing nothing. */
  function toggleFullscreen() {
    const el = containerRef.current as (HTMLDivElement & {
      webkitRequestFullscreen?: () => void
    }) | null
    const doc = document as Document & {
      webkitFullscreenElement?: Element | null
      webkitExitFullscreen?: () => void
    }
    if (!el) return

    if (doc.fullscreenElement || doc.webkitFullscreenElement) {
      if (doc.exitFullscreen) void doc.exitFullscreen()
      else doc.webkitExitFullscreen?.()
      return
    }

    if (el.requestFullscreen) void el.requestFullscreen()
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen()
    else {
      const v = videoRef.current as (HTMLVideoElement & {
        webkitEnterFullscreen?: () => void
      }) | undefined
      v?.webkitEnterFullscreen?.()
    }
  }

  useEffect(() => {
    const onChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null }
      setIsFullscreen(Boolean(doc.fullscreenElement || doc.webkitFullscreenElement))
    }
    document.addEventListener('fullscreenchange', onChange)
    document.addEventListener('webkitfullscreenchange', onChange)
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.removeEventListener('webkitfullscreenchange', onChange)
    }
  }, [])

  function onScrubPointer(clientX: number) {
    const el = scrubberRef.current
    const v = videoRef.current
    if (!el || !v) return
    const total = v.duration || duration
    if (!total) return
    const rect = el.getBoundingClientRect()
    const frac = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)
    seekTo(frac * total)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    // Let the text buttons handle their own activation.
    if ((event.target as HTMLElement).tagName === 'BUTTON') return
    if (event.key === ' ' || event.key === 'k') {
      event.preventDefault()
      togglePlay()
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()
      seekTo(currentTime - 5)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      seekTo(currentTime + 5)
    } else if (event.key === 'f') {
      event.preventDefault()
      toggleFullscreen()
    }
  }

  const progress = duration ? (currentTime / duration) * 100 : 0
  const bufferedPct = duration ? (buffered / duration) * 100 : 0
  const ratio = aspectRatio ? aspectRatio.replace(':', ' / ') : '16 / 9'

  return (
    <div
      ref={containerRef}
      className={`fr-player${isFullscreen ? ' fr-player--fullscreen' : ''}`}
      tabIndex={0}
      onKeyDown={onKeyDown}
    >
      <div className="fr-player__stage">
        <MuxVideo
          ref={videoRef}
          className="fr-player__video"
          style={{ aspectRatio: ratio }}
          playbackId={playbackId}
          tokens={{ playback: tokens.playback, storyboard: tokens.storyboard }}
          streamType="on-demand"
          metadata={{ video_title: title }}
          poster={
            posterToken
              ? `https://image.mux.com/${playbackId}/thumbnail.webp?token=${posterToken}`
              : undefined
          }
          preload="metadata"
          playsInline
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onRateChange={(e) => {
            const r = (e.currentTarget as HTMLVideoElement).playbackRate
            const i = RATES.indexOf(r)
            if (i >= 0) setRateIndex(i)
          }}
          onLoadedMetadata={(e) => {
            const v = e.currentTarget as HTMLVideoElement
            if (Number.isFinite(v.duration)) setDuration(v.duration)
          }}
          onTimeUpdate={(e) => {
            if (scrubbing) return
            setCurrentTime((e.currentTarget as HTMLVideoElement).currentTime)
          }}
          onProgress={(e) => {
            const v = e.currentTarget as HTMLVideoElement
            if (v.buffered.length) setBuffered(v.buffered.end(v.buffered.length - 1))
          }}
          onEnded={() => setPlaying(false)}
        />
      </div>

      <div className="fr-player__controls">
        <button
          type="button"
          className="fr-player__button"
          onClick={togglePlay}
          aria-label={playing ? 'Pause' : 'Play'}
        >
          <StableLabel
            value={playing ? 'PAUSE' : 'PLAY'}
            options={['PLAY', 'PAUSE']}
          />
        </button>

        <span className="fr-player__time">
          {timecode(currentTime, duration)} / {timecode(duration)}
        </span>

        <div
          ref={scrubberRef}
          className="fr-player__scrubber"
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={Math.floor(duration)}
          aria-valuenow={Math.floor(currentTime)}
          aria-valuetext={`${timecode(currentTime)} of ${timecode(duration)}`}
          tabIndex={0}
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            setScrubbing(true)
            onScrubPointer(e.clientX)
          }}
          onPointerMove={(e) => {
            if (scrubbing) onScrubPointer(e.clientX)
          }}
          onPointerUp={(e) => {
            e.currentTarget.releasePointerCapture(e.pointerId)
            setScrubbing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') {
              e.preventDefault()
              seekTo(currentTime - 5)
            } else if (e.key === 'ArrowRight') {
              e.preventDefault()
              seekTo(currentTime + 5)
            }
          }}
        >
          <div className="fr-player__track" />
          <div className="fr-player__buffered" style={{ width: `${bufferedPct}%` }} />
          <div className="fr-player__progress" style={{ width: `${progress}%` }} />
          <div className="fr-player__handle" style={{ left: `${progress}%` }} />
        </div>

        <button
          type="button"
          className="fr-player__button"
          onClick={cycleRate}
          aria-label={`Playback speed ${rate}x`}
        >
          <StableLabel
            value={`${rate}x`}
            options={RATES.map((r) => `${r}x`)}
          />
        </button>

        <button
          type="button"
          className="fr-player__button"
          onClick={toggleFullscreen}
          aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          <StableLabel
            value={isFullscreen ? 'EXIT' : 'FULL'}
            options={['FULL', 'EXIT']}
          />
        </button>
      </div>

      {chapters && chapters.length > 0 && (
        <ul className="fr-player__chapters">
          {chapters.map((chapter) => {
            const start = chapter.startSeconds || 0
            return (
              <li key={chapter._key}>
                <button
                  type="button"
                  className="fr-player__chapter"
                  onClick={() => {
                    seekTo(start)
                    void videoRef.current?.play()
                  }}
                >
                  <span className="fr-video__timecode">
                    {timecode(start, duration)}
                  </span>
                  <span>{chapter.label}</span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
