import { renderToBuffer } from '@react-pdf/renderer'
import { InvoicePdfDocument } from './pdfDocument'
import type { Invoice } from './types'

/** Shared by the API route and the CLI script — one render path, one look. */
export async function renderInvoicePdf(invoice: Invoice): Promise<Buffer> {
  return renderToBuffer(InvoicePdfDocument({ invoice }))
}
