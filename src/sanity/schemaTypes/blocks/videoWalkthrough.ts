import { defineArrayMember, defineField, defineType } from 'sanity'

export const videoChapter = defineType({
  name: 'videoChapter',
  title: 'Chapter',
  type: 'object',
  fields: [
    defineField({
      name: 'label',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'startSeconds',
      title: 'Start (seconds)',
      type: 'number',
      validation: (rule) => rule.required().min(0),
    }),
  ],
  preview: {
    select: { label: 'label', start: 'startSeconds' },
    prepare({ label, start }) {
      const m = Math.floor((start || 0) / 60)
      const s = String(Math.floor((start || 0) % 60)).padStart(2, '0')
      return { title: label, subtitle: `${m}:${s}` }
    },
  },
})

export const videoWalkthrough = defineType({
  name: 'videoWalkthrough',
  title: 'Video walkthrough',
  type: 'object',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
    }),
    defineField({
      name: 'video',
      title: 'Video',
      type: 'mux.video',
      description:
        'Upload straight to Mux. Uploads are signed-only, so playback still goes through the passcode gate — see muxInput() in sanity.config.ts.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'chapters',
      type: 'array',
      of: [defineArrayMember({ type: 'videoChapter' })],
    }),
  ],
  preview: {
    select: { title: 'title', filename: 'video.asset.filename' },
    prepare({ title, filename }) {
      return {
        title: title || 'Video walkthrough',
        subtitle: filename || 'No video uploaded',
      }
    },
  },
})
