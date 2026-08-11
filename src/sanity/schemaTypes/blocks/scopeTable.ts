import { defineArrayMember, defineField, defineType } from 'sanity'

/**
 * Structured scope/proposal table, modelled on the FR scope PDFs:
 * a header meta bar, four columns (Scope / Deliverables / Time / Cost),
 * and a totals footer.
 */

export const scopeBullet = defineType({
  name: 'scopeBullet',
  title: 'Bullet',
  type: 'object',
  fields: [
    defineField({
      name: 'text',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'indent',
      title: 'Indent level',
      type: 'number',
      description: '0 = top level, 1 = nested, 2 = deeply nested',
      initialValue: 0,
      options: {
        list: [
          { title: 'Top level', value: 0 },
          { title: 'Nested', value: 1 },
          { title: 'Deeply nested', value: 2 },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
    }),
  ],
  preview: {
    select: { text: 'text', indent: 'indent' },
    prepare({ text, indent }) {
      return { title: `${'— '.repeat(indent || 0)}${text}` }
    },
  },
})

export const scopeRow = defineType({
  name: 'scopeRow',
  title: 'Scope row',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      title: 'Scope',
      type: 'string',
      description: 'e.g. "Research and Directions", "Web Development"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'bullets',
      type: 'array',
      of: [defineArrayMember({ type: 'scopeBullet' })],
    }),
    defineField({
      name: 'deliverables',
      type: 'array',
      of: [defineArrayMember({ type: 'string' })],
      description: 'One line per deliverable',
    }),
    defineField({
      name: 'time',
      type: 'string',
      description: 'e.g. "1-2 Weeks", "Ongoing"',
    }),
    defineField({
      name: 'cost',
      type: 'string',
      description: 'Leave blank to render an em dash',
    }),
  ],
  preview: {
    select: { title: 'title', time: 'time' },
    prepare({ title, time }) {
      return { title, subtitle: time }
    },
  },
})

export const scopeTable = defineType({
  name: 'scopeTable',
  title: 'Scope table',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      title: 'Header title',
      type: 'string',
      description: 'e.g. "Scope For Identity Design & Website"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'date',
      title: 'Header date',
      type: 'date',
      options: { dateFormat: 'DD.MM.YYYY' },
    }),
    defineField({
      name: 'rows',
      type: 'array',
      of: [defineArrayMember({ type: 'scopeRow' })],
      validation: (rule) => rule.min(1),
    }),
    defineField({
      name: 'currency',
      type: 'string',
      initialValue: 'CAD',
    }),
    defineField({
      name: 'duration',
      title: 'Total duration',
      type: 'string',
      description: 'e.g. "~ 4–6 Weeks"',
    }),
    defineField({
      name: 'priceOriginal',
      title: 'Original price',
      type: 'string',
      description: 'Optional. Renders struck through, before the final price.',
    }),
    defineField({
      name: 'priceFinal',
      title: 'Final price',
      type: 'string',
    }),
    defineField({
      name: 'startNote',
      title: 'Start',
      type: 'string',
      description: 'e.g. "~EARLY MAY"',
    }),
    defineField({
      name: 'endNote',
      title: 'End',
      type: 'string',
      description: 'e.g. "~EARLY/MID JUNE"',
    }),
    defineField({
      name: 'paymentTerms',
      type: 'string',
      description: 'e.g. "50% upfront, 50% on completion"',
    }),
    defineField({
      name: 'payableTo',
      type: 'string',
      description: 'e.g. "1001111430 ONTARIO INC."',
    }),
  ],
  preview: {
    select: { title: 'heading', price: 'priceFinal' },
    prepare({ title, price }) {
      return { title: title || 'Scope table', subtitle: price }
    },
  },
})
