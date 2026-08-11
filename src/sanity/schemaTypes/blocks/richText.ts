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
