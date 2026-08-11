import { RichText, type RichTextBlock } from './RichText'
import { ScopeTable, type ScopeTableBlock } from './ScopeTable'
import { FileList, type FileListBlock } from './FileList'
import {
  VideoWalkthrough,
  type VideoWalkthroughBlock,
} from './VideoWalkthrough'

type Block =
  | ({ _type: 'richText' } & RichTextBlock)
  | ({ _type: 'scopeTable' } & ScopeTableBlock)
  | ({ _type: 'fileList' } & FileListBlock)
  | ({ _type: 'videoWalkthrough' } & VideoWalkthroughBlock)

export function BlockRenderer({
  blocks,
  portalCode,
}: {
  blocks: Block[] | null | undefined
  portalCode: string
}) {
  if (!blocks?.length) return null

  return (
    <div className="fr-blocks">
      {blocks.map((block) => {
        switch (block._type) {
          case 'richText':
            return (
              <RichText key={block._key} block={block} portalCode={portalCode} />
            )
          case 'scopeTable':
            return (
              <ScopeTable
                key={block._key}
                block={block}
                projectCode={portalCode}
              />
            )
          case 'fileList':
            return (
              <FileList key={block._key} block={block} portalCode={portalCode} />
            )
          case 'videoWalkthrough':
            return <VideoWalkthrough key={block._key} block={block} />
          default:
            return null
        }
      })}
    </div>
  )
}
