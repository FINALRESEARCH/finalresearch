import { defineArrayMember, defineField, defineType } from 'sanity'
import { formatProjectTitle } from '@/lib/portal/format'

export const clientPortal = defineType({
  name: 'clientPortal',
  title: 'Project',
  type: 'document',
  fields: [
    defineField({
      name: 'projectCode',
      title: 'Project',
      type: 'slug',
      description:
        'Matches your file naming, lowercased with hyphens. FR_14_C_LORE becomes fr-14-c-lore, and the portal lives at /fr-14-c-lore',
      options: {
        maxLength: 40,
      },
      validation: (rule) =>
        rule.required().custom((value) => {
          const current = value?.current
          if (!current) return 'Required'
          if (!/^[a-z0-9-]+$/.test(current)) {
            return 'Use lowercase letters, numbers and hyphens only'
          }
          return true
        }),
    }),
    defineField({
      name: 'passcode',
      title: 'Passcode',
      type: 'string',
      description:
        'Four digits. Give this to the client. Stored in the private dataset and only ever read on the server — it is never sent to the browser.',
      validation: (rule) =>
        rule.required().regex(/^\d{4}$/, { name: 'four digits' }),
    }),
    defineField({
      name: 'status',
      type: 'string',
      description: 'Revoking makes the portal 404 immediately, for everyone.',
      initialValue: 'live',
      options: {
        list: [
          { title: 'Live', value: 'live' },
          { title: 'Revoked', value: 'revoked' },
        ],
        layout: 'radio',
        direction: 'horizontal',
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'pages',
      type: 'array',
      description: 'Order here is the order shown to the client.',
      of: [
        defineArrayMember({
          type: 'reference',
          to: [{ type: 'portalPage' }],
        }),
      ],
    }),
  ],
  preview: {
    select: {
      code: 'projectCode.current',
      status: 'status',
    },
    prepare({ code, status }) {
      return {
        title: code ? formatProjectTitle(code) : 'Untitled',
        subtitle: `/${code}${status === 'revoked' ? ' — REVOKED' : ''}`,
      }
    },
  },
})
