/**
 * Creates an invoice document (auto-incrementing the number off
 * invoiceSettings.lastInvoiceNumber, snapshotting the region's company/tax/
 * payment/bank block) and renders it straight to a PDF file.
 *
 * Usage:
 *   node --env-file=.env.local ./node_modules/.bin/tsx scripts/invoices/create.ts <json> [--out <path>]
 *
 * <json> is either an inline JSON string or a path to a .json file, shaped
 * like CreateInvoiceInput (see src/lib/invoices/types.ts):
 *   {
 *     "region": "CA",
 *     "date": "2026-08-12",
 *     "billedTo": { "name": "...", "attn": "...", "addressLines": ["..."] },
 *     "lineItems": [{ "description": "...", "quantity": 1, "year": 2026, "cost": 1000 }],
 *     "notes": "optional"
 *   }
 */
import { writeFile } from 'node:fs/promises'
import { existsSync, readFileSync } from 'node:fs'
import { sanityClient } from '../../src/sanity/lib/client'
import { fetchInvoiceSettings, SETTINGS_ID } from '../../src/lib/invoices/queries'
import { renderInvoicePdf } from '../../src/lib/invoices/renderPdf'
import type { CreateInvoiceInput, Invoice } from '../../src/lib/invoices/types'

function parseArgs(): { input: CreateInvoiceInput; outPath?: string } {
  const args = process.argv.slice(2)
  const outIdx = args.indexOf('--out')
  const outPath = outIdx >= 0 ? args[outIdx + 1] : undefined
  const jsonArgs = outIdx >= 0 ? [...args.slice(0, outIdx), ...args.slice(outIdx + 2)] : args
  const raw = jsonArgs[0]
  if (!raw) throw new Error('Usage: create.ts <json | path.json> [--out <path>]')
  const text = raw.trim().startsWith('{') ? raw : readFileSync(raw, 'utf8')
  return { input: JSON.parse(text) as CreateInvoiceInput, outPath }
}

async function main() {
  const { input, outPath } = parseArgs()

  if (!existsSync('.env.local')) {
    console.warn('Warning: .env.local not found in cwd — make sure env vars are loaded.')
  }

  const settings = await fetchInvoiceSettings()
  const profile = settings.regions.find((r) => r.regionCode === input.region)
  if (!profile) {
    throw new Error(
      `No region profile for "${input.region}" in invoiceSettings. Known: ${settings.regions.map((r) => r.regionCode).join(', ')}`,
    )
  }

  const number = settings.lastInvoiceNumber + 1
  const year = Number(input.date.slice(2, 4))
  const invoiceNumber = `FR_INVOICE_${number}_${String(year).padStart(2, '0')}`

  const dateYear = Number(input.date.slice(0, 4))
  const lineItems = input.lineItems.map((item) => ({
    description: item.description,
    quantity: item.quantity ?? 1,
    year: item.year ?? dateYear,
    cost: item.cost,
  }))
  const subtotal = round2(lineItems.reduce((sum, item) => sum + item.cost, 0))
  const taxAmount = profile.tax?.enabled ? round2(subtotal * (profile.tax.rate ?? 0)) : 0
  const total = round2(subtotal + taxAmount)

  const doc: Omit<Invoice, '_id'> & { _type: string } = {
    _type: 'invoice',
    invoiceNumber,
    number,
    date: input.date,
    region: input.region,
    currency: profile.currency,
    company: settings.company,
    billedTo: input.billedTo,
    lineItems,
    subtotal,
    tax: profile.tax,
    total,
    payment: profile.payment,
    bank: profile.bank,
    wireTransfer: settings.wireTransfer,
    notes: input.notes,
    status: 'draft',
  }

  const created = await sanityClient.create(doc)
  await sanityClient.patch(SETTINGS_ID).set({ lastInvoiceNumber: number }).commit()

  console.log(`Created ${invoiceNumber} (${created._id})`)

  const pdf = await renderInvoicePdf(created as unknown as Invoice)
  const filename = outPath || `${invoiceNumber}.pdf`
  await writeFile(filename, pdf)
  console.log(`Wrote ${filename}`)
}

function round2(n: number): number {
  return Math.round(n * 100) / 100
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
