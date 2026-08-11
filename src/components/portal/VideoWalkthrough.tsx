import { signPlayback } from '@/lib/portal/mux'
import { MuxPlayer } from './MuxPlayer'

export type VideoWalkthroughBlock = {
  _key: string
  title?: string
  description?: string
  muxPlaybackId?: string
  durationSeconds?: number
  chapters?: { _key: string; label?: string; startSeconds?: number }[]
}

function timecode(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = String(Math.floor(seconds % 60)).padStart(2, '0')
  return `${m}:${s}`
}

export async function VideoWalkthrough({
  block,
}: {
  block: VideoWalkthroughBlock
}) {
  if (!block.muxPlaybackId) return null

  const tokens = await signPlayback(block.muxPlaybackId)

  return (
    <section className="fr-video">
      {block.title && <h2 className="fr-video__title">{block.title}</h2>}
      {block.description && (
        <p className="fr-video__description">{block.description}</p>
      )}

      {tokens ? (
        <MuxPlayer
          playbackId={block.muxPlaybackId}
          tokens={tokens}
          title={block.title}
        />
      ) : (
        <div className="fr-video__placeholder">
          Video unavailable — Mux signing keys are not configured.
        </div>
      )}

      {block.chapters && block.chapters.length > 0 && (
        <ul className="fr-video__chapters">
          {block.chapters.map((chapter) => (
            <li key={chapter._key}>
              <span className="fr-video__timecode">
                {timecode(chapter.startSeconds || 0)}
              </span>
              <span>{chapter.label}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
