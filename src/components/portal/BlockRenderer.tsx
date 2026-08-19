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

function renderBlock(block: Block, portalCode: string) {
  switch (block._type) {
    case 'richText':
      return <RichText key={block._key} block={block} portalCode={portalCode} />
    case 'scopeTable':
      return (
        <ScopeTable key={block._key} block={block} projectCode={portalCode} />
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
}

export function BlockRenderer({
  blocks,
  portalCode,
}: {
  blocks: Block[] | null | undefined
  portalCode: string
}) {
  if (!blocks?.length) return null

  const [first, ...rest] = blocks

  // A video opening the page gets its own full first screen, centered —
  // everything else is pushed below the fold rather than competing for the
  // same view.
  if (first._type === 'videoWalkthrough') {
    return (
      <>
        <div className="fr-portal__hero">{renderBlock(first, portalCode)}</div>
        {rest.length > 0 && (
          <div className="fr-blocks">
            {rest.map((block) => renderBlock(block, portalCode))}
          </div>
        )}
      </>
    )
  }

  return (
    <div className="fr-blocks">
      {blocks.map((block) => renderBlock(block, portalCode))}
    </div>
  )
}
