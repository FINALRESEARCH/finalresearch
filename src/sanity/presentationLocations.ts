import { map } from 'rxjs'
import type { PresentationPluginOptions } from 'sanity/presentation'
import { formatProjectTitle } from '@/lib/portal/format'

/**
 * Tells Presentation which URL a document appears on, so the preview iframe
 * navigates there — both when opening a document from the list, and when
 * clicking a portalPage's own "Preview" entry point.
 *
 * clientPortal resolves straight from its own projectCode. portalPage has no
 * URL of its own — the project code that prefixes it lives on the parent
 * clientPortal — so its location is found by querying for the portal that
 * references this page. A location `select` can't do that join, but
 * `documentStore.listenQuery` can run arbitrary GROQ, including the reverse
 * reference lookup.
 */
export const presentationLocations: PresentationPluginOptions['resolve'] = {
  locations: ({ id, type }, { documentStore }) => {
    if (type === 'clientPortal') {
      return documentStore
        .listenQuery(`*[_id == $id][0]{ "code": projectCode.current }`, { id }, {})
        .pipe(
          map((doc: { code?: string } | null) =>
            doc?.code
              ? {
                  locations: [
                    { title: formatProjectTitle(doc.code), href: `/${doc.code}` },
                  ],
                }
              : { locations: [] },
          ),
        )
    }

    if (type === 'portalPage') {
      const publishedId = id.replace(/^drafts\./, '')
      return documentStore
        .listenQuery(
          `{
            "page": *[_id == $id][0]{ "slug": slug.current },
            "portal": *[_type == "clientPortal" && references($publishedId)][0]{ "code": projectCode.current }
          }`,
          { id, publishedId },
          {},
        )
        .pipe(
          map(
            (result: {
              page?: { slug?: string }
              portal?: { code?: string }
            }) =>
              result?.portal?.code && result?.page?.slug
                ? {
                    locations: [
                      {
                        title: `${formatProjectTitle(result.portal.code)} — ${result.page.slug}`,
                        href: `/${result.portal.code}/${result.page.slug}`,
                      },
                    ],
                  }
                : { locations: [] },
          ),
        )
    }

    return { locations: [] }
  },
}
