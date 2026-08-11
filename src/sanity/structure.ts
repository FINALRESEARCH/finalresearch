import type { StructureResolver } from 'sanity/structure'

export const structure: StructureResolver = (S) =>
  S.list()
    .title('FINAL RESEARCH')
    .items([
      S.listItem()
        .title('Projects')
        .child(
          S.documentTypeList('clientPortal')
            .title('Projects')
            .defaultOrdering([{ field: 'projectCode.current', direction: 'asc' }]),
        ),
      S.listItem()
        .title('Pages')
        .child(S.documentTypeList('portalPage').title('Pages')),
      S.divider(),
      S.listItem()
        .title('Activity')
        .child(
          S.documentTypeList('portalEvent')
            .title('Activity')
            .defaultOrdering([{ field: 'at', direction: 'desc' }]),
        ),
    ])
