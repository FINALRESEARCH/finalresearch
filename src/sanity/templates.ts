import type { Template } from 'sanity'

/**
 * A new scope page arrives pre-filled with FR's standard four rows, so you edit
 * and delete rather than build from nothing. Keys are fixed strings: Sanity
 * generates fresh ones when the template is instantiated.
 */

function bullet(key: string, text: string, indent = 0) {
  return { _key: key, _type: 'scopeBullet', text, indent }
}

const SCOPE_STARTER = {
  title: 'Scope',
  slug: { _type: 'slug', current: 'scope' },
  blocks: [
    {
      _key: 'scope',
      _type: 'scopeTable',
      heading: 'Scope For Identity Design & Website',
      currency: 'CAD',
      duration: '~ 4–6 Weeks',
      paymentTerms: '50% upfront, 50% on completion',
      payableTo: '1001111430 ONTARIO INC.',
      rows: [
        {
          _key: 'row1',
          _type: 'scopeRow',
          title: 'Research and Directions',
          bullets: [
            bullet('b1', 'Research and develop distinct visual directions based on shared references'),
            bullet('b2', 'Focus on: type design and contextual use of specific typefaces'),
          ],
          deliverables: ['Proposal for an identity concept'],
          time: '1-2 Weeks',
        },
        {
          _key: 'row2',
          _type: 'scopeRow',
          title: 'Identity Design',
          bullets: [
            bullet('b3', 'Design exploration of chosen visual direction'),
            bullet('b4', 'Apply research and concept to deliverables:'),
            bullet('b5', 'Wordmark', 1),
            bullet('b6', 'Logomark', 1),
            bullet('b7', 'Typeface selection', 1),
            bullet('b8', 'Colour selection', 1),
            bullet('b9', 'Website Screens', 1),
            bullet('b10', 'Business Card / Letterhead', 1),
            bullet('b11', 'Key slides for deck template', 1),
          ],
          deliverables: [
            'Produce and iterate on logo(s) and assets',
            'Design concept for website via Figma screens',
            '1 revision round included',
            'Additional revisions billed by hours required',
          ],
          time: '2-3 Weeks',
        },
        {
          _key: 'row3',
          _type: 'scopeRow',
          title: 'Web Development',
          bullets: [
            bullet('b12', 'Front end development'),
            bullet('b13', 'CMS development (Sanity.io)'),
            bullet('b14', 'Quality control checks & browser compatibility'),
            bullet('b15', 'Configure simple SEO setup (page titles, preview images, OpenGraph settings)'),
            bullet('b16', 'Development handoff: short video tutorials on content upload (if necessary)'),
          ],
          deliverables: ['Fully developed website (Next.js) and deployed via client domain'],
          time: '2 Weeks',
        },
        {
          _key: 'row4',
          _type: 'scopeRow',
          title: 'Project Management',
          bullets: [
            bullet('b17', 'Gather requirements, scoping'),
            bullet('b18', 'Deliver design proposals and updates via walkthrough videos and calls'),
          ],
          deliverables: [],
          time: 'Ongoing',
        },
      ],
    },
  ],
}

export const schemaTemplates: Template[] = [
  {
    id: 'portalPage-scope',
    title: 'Scope page (pre-filled)',
    description: "Starts from FINAL RESEARCH's standard scope table",
    schemaType: 'portalPage',
    value: SCOPE_STARTER,
  },
]
