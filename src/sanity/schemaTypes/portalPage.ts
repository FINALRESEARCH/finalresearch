import { defineArrayMember, defineField, defineType } from 'sanity'

export const portalPage = defineType({
  name: 'portalPage',
  title: 'Portal page',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      description:
        'Appears in the URL after the project code. Generated from the PRES_XX prefix of the title, e.g. PRES_00_FR_24_C_HIDDEN becomes /pres-00',
      options: {
        source: 'title',
        maxLength: 60,
        slugify: (input) => {
          const match = input.match(/pres[_-]?(\d+)/i)
          if (match) return `pres-${match[1].padStart(2, '0')}`
          return input.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
        },
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'summary',
      type: 'text',
      rows: 2,
      description: 'Shown on the portal index beneath the page title',
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'string',
      description:
        'Shown under FINAL RESEARCH in the page header. e.g. "Q1 2026 — Web/UI/UX"',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'blocks',
      title: 'Content',
      type: 'array',
      of: [
        defineArrayMember({ type: 'richText' }),
        defineArrayMember({ type: 'scopeTable' }),
        defineArrayMember({ type: 'videoWalkthrough' }),
        defineArrayMember({ type: 'fileList' }),
      ],
    }),
  ],
  preview: {
    select: { title: 'title', slug: 'slug.current' },
    prepare({ title, slug }) {
      return { title, subtitle: slug ? `/${slug}` : 'no slug' }
    },
  },
})
