import { defineField, defineType } from 'sanity'

/**
 * Shared object shapes for invoices. Used both on `invoiceSettings` (the
 * reusable per-region defaults: bank details, tax rate, payment note) and on
 * `invoice` itself (a frozen snapshot copied in at creation time, so an old
 * invoice never changes if the settings are edited later).
 */

export const invoiceLineItem = defineType({
  name: 'invoiceLineItem',
  title: 'Line item',
  type: 'object',
  fields: [
    defineField({
      name: 'description',
      title: 'Item',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quantity',
      type: 'number',
      initialValue: 1,
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: 'year',
      type: 'number',
      description: 'Year column on the invoice, e.g. 2026',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'cost',
      title: 'Cost',
      type: 'number',
      description: 'Line total for this item (as shown in the COST column), not a per-unit rate',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'description', cost: 'cost' },
    prepare({ title, cost }) {
      return { title, subtitle: typeof cost === 'number' ? `$${cost.toFixed(2)}` : undefined }
    },
  },
})

export const invoiceTax = defineType({
  name: 'invoiceTax',
  title: 'Tax',
  type: 'object',
  fields: [
    defineField({
      name: 'enabled',
      type: 'boolean',
      initialValue: false,
      description: 'Off by default. Only Canada charges tax on FR invoices.',
    }),
    defineField({
      name: 'label',
      type: 'string',
      description: 'e.g. "HST"',
      initialValue: 'HST',
    }),
    defineField({
      name: 'rate',
      type: 'number',
      description: 'Decimal, e.g. 0.13 for 13%',
      initialValue: 0.13,
    }),
    defineField({
      name: 'taxNumber',
      title: 'Tax / business number',
      type: 'string',
      description: 'e.g. "788808160RT0001"',
    }),
  ],
})

export const invoicePaymentNote = defineType({
  name: 'invoicePaymentNote',
  title: 'Payment note',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      description: 'e.g. "CANADA", "UNITED STATES", "UNITED KINGDOM", "EU / WORLD"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'method',
      type: 'string',
      description: 'e.g. "Payable by e-transfer to" or "Payable by Wise to"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'payTo',
      title: 'Pay to',
      type: 'string',
      description: 'Email the client pays to',
      validation: (rule) => rule.required(),
    }),
  ],
})

export const invoiceBankDetails = defineType({
  name: 'invoiceBankDetails',
  title: 'Bank details',
  type: 'object',
  description: 'Fill only the fields that apply to this payment rail — the PDF skips blanks.',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
      description: 'e.g. "EFT INFORMATION", "ACH / BANK TRANSFER", "SEPA / BANK TRANSFER"',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'beneficiary', type: 'string' }),
    defineField({ name: 'institutionNumber', title: 'Institution #', type: 'string' }),
    defineField({ name: 'transitNumber', title: 'Transit #', type: 'string' }),
    defineField({ name: 'accountNumber', title: 'Account #', type: 'string' }),
    defineField({ name: 'achRoutingNumber', title: 'ACH routing number', type: 'string' }),
    defineField({ name: 'sortCode', title: 'Sort code', type: 'string' }),
    defineField({ name: 'iban', title: 'IBAN', type: 'string' }),
    defineField({ name: 'bic', title: 'BIC / SWIFT', type: 'string' }),
    defineField({ name: 'bankName', type: 'string' }),
    defineField({ name: 'bankAddress', type: 'text', rows: 2 }),
  ],
})

export const invoiceBillTo = defineType({
  name: 'invoiceBillTo',
  title: 'Billed to',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      description: 'Client or company name',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'attn',
      title: 'Attn',
      type: 'string',
      description: 'Optional contact name, e.g. "attn: Alice Yuan Zhang"',
    }),
    defineField({
      name: 'addressLines',
      title: 'Address',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'One line per row',
    }),
  ],
})

export const invoiceCompany = defineType({
  name: 'invoiceCompany',
  title: 'Company',
  type: 'object',
  fields: [
    defineField({ name: 'legalName', type: 'string', initialValue: 'FINAL RESEARCH' }),
    defineField({ name: 'entityName', type: 'string', initialValue: '1001111430 ONTARIO INC.' }),
    defineField({ name: 'email', type: 'string', initialValue: 'system@finalresearch.org' }),
    defineField({
      name: 'addressLines',
      title: 'Address',
      type: 'array',
      of: [{ type: 'string' }],
      initialValue: ['16 SIMPSON AVE.', 'UNIT 3', 'TORONTO, ON', 'M4K1A2', 'CANADA'],
    }),
  ],
})
