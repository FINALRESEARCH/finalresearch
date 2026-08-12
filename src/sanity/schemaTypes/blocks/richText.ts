import { defineArrayMember, defineField, defineType } from 'sanity'
import { WidthSliderInput } from '../../components/WidthSliderInput'

export const richText = defineType({
  name: 'richText',
  title: 'Rich text',
  type: 'object',
  fields: [
    defineField({
      name: 'content',
      type: 'array',
      of: [
        defineArrayMember({
          type: 'block',
          styles: [
            { title: 'Normal', value: 'normal' },
            { title: 'Centered', value: 'center' },
            { title: 'Heading', value: 'h2' },
            { title: 'Subheading', value: 'h3' },
            { title: 'Quote', value: 'blockquote' },
          ],
          lists: [
            { title: 'Bullet', value: 'bullet' },
            { title: 'Numbered', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: 'Bold', value: 'strong' },
              { title: 'Italic', value: 'em' },
              { title: 'Strike', value: 'strike-through' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: 'Link',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    validation: (rule) =>
                      rule.uri({ scheme: ['http', 'https', 'mailto'] }),
                  },
                ],
              },
            ],
          },
        }),
        defineArrayMember({
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
            defineField({
              name: 'caption',
              type: 'string',
            }),
            defineField({
              name: 'widthPercent',
              title: 'Width',
              type: 'number',
              initialValue: 100,
              validation: (rule) => rule.min(10).max(100),
              components: { input: WidthSliderInput },
            }),
          ],
        }),
        defineArrayMember({
          type: 'object',
          name: 'externalImage',
          title: 'External image (URL)',
          description:
            'Hotlinked, not uploaded — for reference images living elsewhere (e.g. Are.na). Breaks if the source removes it.',
          fields: [
            defineField({
              name: 'url',
              type: 'url',
              title: 'Image URL',
              validation: (rule) =>
                rule.required().uri({ scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'alt',
              type: 'string',
              title: 'Alt text',
            }),
            defineField({
              name: 'caption',
              type: 'string',
            }),
            defineField({
              name: 'linkUrl',
              title: 'Links to',
              type: 'url',
              description:
                'Optional — wraps the image in a link to this URL, e.g. the site being referenced.',
              validation: (rule) =>
                rule.uri({ scheme: ['http', 'https'] }),
            }),
            defineField({
              name: 'widthPercent',
              title: 'Width',
              type: 'number',
              initialValue: 100,
              validation: (rule) => rule.min(10).max(100),
              components: { input: WidthSliderInput },
            }),
          ],
          preview: {
            select: { caption: 'caption', url: 'url' },
            prepare({ caption, url }) {
              return { title: caption || 'External image', subtitle: url }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { content: 'content' },
    prepare({ content }) {
      const first = (content || []).find(
        (b: { _type: string }) => b._type === 'block',
      )
      const text = first?.children
        ?.map((c: { text?: string }) => c.text)
        .join('')
      return { title: text || 'Rich text' }
    },
  },
})
