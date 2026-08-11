import { defineField, defineType } from 'sanity'
import { formatProjectTitle } from '@/lib/portal/format'

/**
 * Append-only view log. Written by the server, read in Studio.
 */
export const portalEvent = defineType({
  name: 'portalEvent',
  title: 'Portal event',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({
      name: 'portal',
      type: 'reference',
      to: [{ type: 'clientPortal' }],
      // Weak, so the log never blocks deleting a finished project. Orphaned
      // events survive the portal and simply lose their project title.
      weak: true,
    }),
    defineField({
      name: 'kind',
      type: 'string',
      options: {
        list: [
          { title: 'Unlocked', value: 'unlock' },
          { title: 'Page view', value: 'pageview' },
          { title: 'Failed attempt', value: 'failed' },
        ],
      },
    }),
    defineField({ name: 'path', type: 'string' }),
    defineField({ name: 'at', type: 'datetime' }),
    defineField({
      name: 'userAgent',
      type: 'string',
    }),
    defineField({
      name: 'ipHash',
      title: 'IP hash',
      type: 'string',
      description: 'Salted hash, not the address itself.',
    }),
  ],
  preview: {
    select: { kind: 'kind', path: 'path', at: 'at', code: 'portal.projectCode.current' },
    prepare({ kind, path, at, code }) {
      return {
        title: `${code ? formatProjectTitle(code) : 'unknown'} — ${kind}`,
        subtitle: `${path || ''} ${at ? new Date(at).toLocaleString() : ''}`.trim(),
      }
    },
  },
})
