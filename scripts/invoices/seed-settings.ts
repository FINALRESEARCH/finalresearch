/**
 * One-time (idempotent) seed of the `invoiceSettings` singleton with FR's
 * real company letterhead and per-region payment/tax profiles, transcribed
 * from FR_INVOICE_000_YY.numbers.
 *
 * Run: node --env-file=.env.local ./node_modules/.bin/tsx scripts/invoices/seed-settings.ts
 */
import { sanityClient } from '../../src/sanity/lib/client'
import type { InvoiceSettings } from '../../src/lib/invoices/types'

const SETTINGS_ID = 'invoiceSettings'

const settings: InvoiceSettings & { _id: string; _type: string } = {
  _id: SETTINGS_ID,
  _type: 'invoiceSettings',
  company: {
    legalName: 'FINAL RESEARCH',
    entityName: '1001111430 ONTARIO INC.',
    email: 'system@finalresearch.org',
    addressLines: ['16 SIMPSON AVE.', 'UNIT 3', 'TORONTO, ON', 'M4K1A2', 'CANADA'],
  },
  // Last real invoice issued was FR_INVOICE_116_26; the next one created starts at 117.
  lastInvoiceNumber: 116,
  wireTransfer: {
    heading: 'WIRE (SWIFT) TRANSFER',
    beneficiary: '1001111430 ONTARIO INC.',
    iban: 'GB95TCCL04140493076569',
    bic: 'TCCLGB3L',
    bankName: 'The Currency Cloud Limited',
    bankAddress: '12 Steward Street, The Steward Building, London, E1 6FQ, GB',
  },
  regions: [
    {
      regionCode: 'CA',
      currency: 'CAD',
      currencySymbol: '$',
      tax: { enabled: true, label: 'HST', rate: 0.13, taxNumber: '788808160RT0001' },
      payment: {
        heading: 'CANADA',
        method: 'Payable by e-transfer to',
        payTo: 'system@finalresearch.org',
      },
      bank: {
        heading: 'EFT INFORMATION',
        institutionNumber: '621',
        transitNumber: '20002',
        accountNumber: '500010039672',
      },
    },
    {
      regionCode: 'US',
      currency: 'USD',
      currencySymbol: '$',
      tax: { enabled: false },
      payment: {
        heading: 'UNITED STATES',
        method: 'Payable by Wise to',
        payTo: 'office@ericlchen.com',
      },
      bank: {
        heading: 'ACH / BANK TRANSFER',
        beneficiary: '1001111430 ONTARIO INC.',
        accountNumber: '8337735908',
        achRoutingNumber: '026073150',
        bankName: 'Community Federal Savings Bank',
        bankAddress: '5 Penn Plaza, 14th Floor, New York, NY 10001, US',
      },
    },
    {
      regionCode: 'UK',
      currency: 'GBP',
      currencySymbol: '£',
      tax: { enabled: false },
      payment: {
        heading: 'UNITED KINGDOM',
        method: 'Payable by Wise to',
        payTo: 'office@ericlchen.com',
      },
      bank: {
        heading: 'BANK TRANSFER',
        beneficiary: '1001111430 ONTARIO INC.',
        accountNumber: '93076569',
        sortCode: '041404',
        bankName: 'The Currency Cloud Limited',
        bankAddress: '12 Steward Street, The Steward Building, London, E1 6FQ, GB',
      },
    },
    {
      regionCode: 'EU',
      currency: 'EUR',
      currencySymbol: '€',
      tax: { enabled: false },
      payment: {
        heading: 'EU / WORLD',
        method: 'Payable by Wise to',
        payTo: 'office@ericlchen.com',
      },
      bank: {
        heading: 'SEPA / BANK TRANSFER',
        beneficiary: '1001111430 ONTARIO INC.',
        iban: 'GB86TCCL00997997089766',
        bic: 'TCCLGB31',
        bankName: 'The Currency Cloud Limited',
        bankAddress: '12 Steward Street, The Steward Building, London, E1 6FQ, GB',
      },
    },
  ],
}

async function main() {
  const existing = await sanityClient.fetch(`*[_id == $id][0]{ _id }`, { id: SETTINGS_ID })
  if (existing) {
    console.log(`invoiceSettings already exists (${SETTINGS_ID}) — leaving it untouched.`)
    console.log('Delete it in Studio first if you want to reseed from scratch.')
    return
  }
  const result = await sanityClient.createIfNotExists(settings)
  console.log(`Created invoiceSettings: ${result._id}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
