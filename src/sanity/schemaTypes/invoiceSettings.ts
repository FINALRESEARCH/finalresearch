import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Singleton. Holds the company letterhead plus one reusable payment/tax
 * profile per billing region (Canada, US, UK, EU). New invoices snapshot
 * these values in at creation time — editing a profile here only affects
 * invoices created afterward, never past ones.
 */
export const invoiceSettings = defineType({
  name: 'invoiceSettings',
  title: 'Invoice Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      type: 'invoiceCompany',
    }),
    defineField({
      name: 'lastInvoiceNumber',
      title: 'Last invoice number',
      type: 'number',
      description: 'The running FR_INVOICE_NNN_YY sequence. The next invoice created uses this + 1.',
      validation: (rule) => rule.required().integer().positive(),
    }),
    defineField({
      name: 'wireTransfer',
      title: 'Wire (SWIFT) transfer',
      type: 'invoiceBankDetails',
      description:
        'Shown on every invoice regardless of region, below the region-specific payment block.',
    }),
    defineField({
      name: 'regions',
      type: 'array',
      validation: (rule) => rule.min(1),
      of: [
        defineArrayMember({
          name: 'invoiceRegionProfile',
          title: 'Region profile',
          type: 'object',
          fields: [
            defineField({
              name: 'regionCode',
              type: 'string',
              options: {
                list: [
                  { title: 'Canada', value: 'CA' },
                  { title: 'United States', value: 'US' },
                  { title: 'United Kingdom', value: 'UK' },
                  { title: 'EU', value: 'EU' },
                ],
              },
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'currency',
              type: 'string',
              description: 'ISO code, e.g. CAD',
              validation: (rule) => rule.required(),
            }),
            defineField({
              name: 'currencySymbol',
              type: 'string',
              description: 'e.g. $, £, €',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'tax', type: 'invoiceTax' }),
            defineField({
              name: 'payment',
              type: 'invoicePaymentNote',
              validation: (rule) => rule.required(),
            }),
            defineField({ name: 'bank', type: 'invoiceBankDetails' }),
          ],
          preview: {
            select: { title: 'regionCode', currency: 'currency' },
            prepare({ title, currency }) {
              return { title, subtitle: currency }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Invoice Settings' }
    },
  },
})
