import { NextResponse, type NextRequest } from 'next/server'
import { fetchInvoiceByNumber } from '@/lib/invoices/queries'
import { renderInvoicePdf } from '@/lib/invoices/renderPdf'

/**
 * Renders the current Sanity state of an invoice as a PDF, live — always
 * reflects the latest edits, no regeneration step needed. Gated by a shared
 * secret since invoice PDFs carry client names, amounts, and bank details;
 * a wrong/missing key 404s rather than 401/403 so the route doesn't
 * advertise which invoice numbers exist.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> },
) {
  const secret = process.env.INVOICE_PREVIEW_SECRET
  if (!secret || request.nextUrl.searchParams.get('key') !== secret) {
    return new NextResponse(null, { status: 404 })
  }

  const { invoiceNumber } = await params
  const invoice = await fetchInvoiceByNumber(invoiceNumber)
  if (!invoice) return new NextResponse(null, { status: 404 })

  const pdf = await renderInvoicePdf(invoice)
  const download = request.nextUrl.searchParams.get('dl') === '1'

  return new NextResponse(new Uint8Array(pdf), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
      'X-Robots-Tag': 'noindex, noimageindex, nosnippet',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${invoiceNumber}.pdf"`,
    },
  })
}
