import type { SchemaTypeDefinition } from 'sanity'

import { clientPortal } from './clientPortal'
import { portalPage } from './portalPage'
import { portalEvent } from './portalEvent'
import { invoice } from './invoice'
import { invoiceSettings } from './invoiceSettings'
import { richText } from './blocks/richText'
import { scopeBullet, scopeRow, scopeTable } from './blocks/scopeTable'
import { videoChapter, videoWalkthrough } from './blocks/videoWalkthrough'
import { fileItem, fileList, linkItem } from './blocks/fileList'
import {
  invoiceBankDetails,
  invoiceBillTo,
  invoiceCompany,
  invoiceLineItem,
  invoicePaymentNote,
  invoiceTax,
} from './blocks/invoiceBlocks'

export const schemaTypes: SchemaTypeDefinition[] = [
  // Documents
  clientPortal,
  portalPage,
  portalEvent,
  invoice,
  invoiceSettings,
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
  // Invoice blocks
  invoiceLineItem,
  invoiceTax,
  invoicePaymentNote,
  invoiceBankDetails,
  invoiceBillTo,
  invoiceCompany,
]
