import type { SchemaTypeDefinition } from 'sanity'

import { clientPortal } from './clientPortal'
import { portalPage } from './portalPage'
import { portalEvent } from './portalEvent'
import { richText } from './blocks/richText'
import { scopeBullet, scopeRow, scopeTable } from './blocks/scopeTable'
import { videoChapter, videoWalkthrough } from './blocks/videoWalkthrough'
import { fileItem, fileList, linkItem } from './blocks/fileList'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  clientPortal,
  portalPage,
  portalEvent,
  // Blocks
  richText,
  scopeTable,
  videoWalkthrough,
  fileList,
  // Block members
  scopeRow,
  scopeBullet,
  videoChapter,
  fileItem,
  linkItem,
]
