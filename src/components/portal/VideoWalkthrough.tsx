import { signPlayback } from '@/lib/portal/mux'
import { VideoPlayer, type Chapter } from './VideoPlayer'

export type VideoWalkthroughBlock = {
  _key: string
  title?: string
  description?: string
  /** Dereferenced from the mux.videoAsset in portalPageQuery. */
  playbackId?: string
  assetStatus?: string
  durationSeconds?: number
  aspectRatio?: string
  /** Editor-picked poster frame; falls back to the first frame. */
  thumbTime?: number
  chapters?: Chapter[]
}

export async function VideoWalkthrough({
  block,
}: {
  block: VideoWalkthroughBlock
}) {
  if (!block.playbackId) return null

  // Mux is still transcoding; a player here would just error.
  if (block.assetStatus && block.assetStatus !== 'ready') {
    return (
      <section className="fr-video">
        {block.title && <h2 className="fr-video__title">{block.title}</h2>}
        <div className="fr-video__placeholder">Video is still processing.</div>
      </section>
    )
  }

  const tokens = await signPlayback(block.playbackId, block.thumbTime ?? 0)

  return (
    <section className="fr-video">
      {block.title && <h2 className="fr-video__title">{block.title}</h2>}
      {block.description && (
        <p className="fr-video__description">{block.description}</p>
      )}

      {tokens ? (
        <VideoPlayer
          playbackId={block.playbackId}
          tokens={{ playback: tokens.playback, storyboard: tokens.storyboard }}
          posterToken={tokens.thumbnail}
          title={block.title}
          aspectRatio={block.aspectRatio}
          initialDuration={block.durationSeconds}
          chapters={block.chapters}
        />
      ) : (
        <div className="fr-video__placeholder">
          Video unavailable — Mux signing keys are not configured.
        </div>
      )}
    </section>
  )
}
