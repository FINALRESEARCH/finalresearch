'use client'

import MuxPlayerReact from '@mux/mux-player-react'

export function MuxPlayer({
  playbackId,
  tokens,
  title,
}: {
  playbackId: string
  tokens: { playback: string; thumbnail: string; storyboard: string }
  title?: string
}) {
  return (
    <MuxPlayerReact
      playbackId={playbackId}
      tokens={{
        playback: tokens.playback,
        thumbnail: tokens.thumbnail,
        storyboard: tokens.storyboard,
      }}
      metadata={{ video_title: title }}
      streamType="on-demand"
      accentColor="#464861"
      style={{ aspectRatio: '16 / 9', width: '100%' }}
    />
  )
}
