/**
 * Regenerates the PDF for an existing invoice, e.g. after editing it in
 * Studio.
 *
 * Usage:
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/invoices/render-pdf.ts FR_INVOICE_117_26 [--out <path>]
 */
import { writeFile } from 'node:fs/promises'
import { fetchInvoiceByNumber } from '../../src/lib/invoices/queries'
import { renderInvoicePdf } from '../../src/lib/invoices/renderPdf'

async function main() {
  const args = process.argv.slice(2)
  const outIdx = args.indexOf('--out')
  const outPath = outIdx >= 0 ? args[outIdx + 1] : undefined
  const invoiceNumber = args[0]
  if (!invoiceNumber) throw new Error('Usage: render-pdf.ts <invoiceNumber> [--out <path>]')

  const invoice = await fetchInvoiceByNumber(invoiceNumber)
  if (!invoice) throw new Error(`No invoice found with invoiceNumber "${invoiceNumber}"`)

  const pdf = await renderInvoicePdf(invoice)
  const filename = outPath || `${invoiceNumber}.pdf`
  await writeFile(filename, pdf)
  console.log(`Wrote ${filename}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
