import { sanityClient } from '@/sanity/lib/client'
import type { Invoice, InvoiceSettings } from './types'

const SETTINGS_ID = 'invoiceSettings'

export async function fetchInvoiceSettings(): Promise<InvoiceSettings> {
  const settings = await sanityClient.fetch<InvoiceSettings | null>(
    `*[_id == $id][0]{ company, lastInvoiceNumber, wireTransfer, regions }`,
    { id: SETTINGS_ID },
  )
  if (!settings) {
    throw new Error(
      'No invoiceSettings document found. Run `npx tsx scripts/invoices/seed-settings.ts` first.',
    )
  }
  return settings
}

export async function fetchInvoiceByNumber(invoiceNumber: string): Promise<Invoice | null> {
  return sanityClient.fetch<Invoice | null>(
    `*[_type == "invoice" && invoiceNumber == $invoiceNumber][0]`,
    { invoiceNumber },
  )
}

export { SETTINGS_ID }
