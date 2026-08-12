import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * A generated invoice. Every field here is a frozen snapshot at creation
 * time (company letterhead, tax, payment/bank block) — none of it re-reads
 * `invoiceSettings` live, so a past invoice's PDF never changes retroactively
 * if settings are edited later. Regenerate the PDF any time from these
 * fields alone.
 */
export const invoice = defineType({
  name: 'invoice',
  title: 'Invoice',
  type: 'document',
  fields: [
    defineField({
      name: 'invoiceNumber',
      title: 'Invoice number',
      type: 'string',
      description: 'e.g. "FR_INVOICE_117_26"',
      validation: (rule) =>
        rule.required().regex(/^FR_INVOICE_\d{3,}_\d{2}$/, {
          name: 'FR_INVOICE_NNN_YY',
        }),
    }),
    defineField({
      name: 'number',
      title: 'Sequence number',
      type: 'number',
      description: 'e.g. 117 — used to compute the next invoice number',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'date',
      type: 'date',
      options: { dateFormat: 'D/M/YYYY' },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'region',
      type: 'string',
      options: {
        list: [
          { title: 'Canada', value: 'CA' },
          { title: 'United States', value: 'US' },
          { title: 'United Kingdom', value: 'UK' },
          { title: 'EU', value: 'EU' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'currency',
      type: 'string',
      description: 'ISO code, snapshot from the region profile, e.g. CAD',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'company', type: 'invoiceCompany' }),
    defineField({
      name: 'billedTo',
      type: 'invoiceBillTo',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'lineItems',
      type: 'array',
      of: [defineArrayMember({ type: 'invoiceLineItem' })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'subtotal',
      type: 'number',
      description: 'Sum of line item costs',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'tax', type: 'invoiceTax' }),
    defineField({
      name: 'total',
      type: 'number',
      description: 'Subtotal + tax',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'payment',
      type: 'invoicePaymentNote',
      validation: (rule) => rule.required(),
    }),
    defineField({ name: 'bank', type: 'invoiceBankDetails' }),
    defineField({
      name: 'wireTransfer',
      title: 'Wire (SWIFT) transfer',
      type: 'invoiceBankDetails',
      description: 'Shown below the region-specific bank block, regardless of region.',
    }),
    defineField({
      name: 'notes',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'status',
      type: 'string',
      initialValue: 'draft',
      options: {
        list: [
          { title: 'Draft', value: 'draft' },
          { title: 'Sent', value: 'sent' },
          { title: 'Paid', value: 'paid' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: {
      invoiceNumber: 'invoiceNumber',
      billedTo: 'billedTo.name',
      total: 'total',
      currency: 'currency',
      status: 'status',
    },
    prepare({ invoiceNumber, billedTo, total, currency, status }) {
      const amount = typeof total === 'number' ? `${currency} ${total.toFixed(2)}` : undefined
      return {
        title: invoiceNumber || 'Untitled invoice',
        subtitle: [billedTo, amount, status !== 'draft' ? status?.toUpperCase() : undefined]
          .filter(Boolean)
          .join(' — '),
      }
    },
  },
})
