import { defineArrayMember, defineField, defineType } from 'sanity'

export const fileItem = defineType({
  name: 'fileItem',
  title: 'File',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      type: 'string',
      description: 'Optional short description shown beside the label',
    }),
    defineField({
      name: 'file',
      type: 'file',
      validation: (rule) => rule.required(),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'note' },
  },
})

export const linkItem = defineType({
  name: 'linkItem',
  title: 'Link',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      type: 'string',
    }),
    defineField({
      name: 'href',
      type: 'url',
      validation: (rule) =>
        rule.required().uri({ scheme: ['http', 'https'] }),
    }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'href' },
  },
})

export const fileList = defineType({
  name: 'fileList',
  title: 'Files & links',
  type: 'object',
  fields: [
    defineField({
      name: 'heading',
      type: 'string',
    }),
    defineField({
      name: 'items',
      type: 'array',
      of: [
        defineArrayMember({ type: 'fileItem' }),
        defineArrayMember({ type: 'linkItem' }),
      ],
      validation: (rule) => rule.min(1),
    }),
  ],
  preview: {
    select: { heading: 'heading', items: 'items' },
    prepare({ heading, items }) {
      const n = items?.length || 0
      return {
        title: heading || 'Files & links',
        subtitle: `${n} item${n === 1 ? '' : 's'}`,
      }
    },
  },
})
