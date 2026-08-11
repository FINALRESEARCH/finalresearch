export type FileListBlock = {
  _key: string
  heading?: string
  items?: {
    _key: string
    _type: 'fileItem' | 'linkItem'
    label?: string
    note?: string
    href?: string
    file?: { asset?: { _ref?: string } }
  }[]
}

export function FileList({
  block,
  portalCode,
}: {
  block: FileListBlock
  portalCode: string
}) {
  const items = block.items ?? []
  if (items.length === 0) return null

  return (
    <section className="fr-files">
      {block.heading && <h2 className="fr-files__heading">{block.heading}</h2>}
      <ul className="fr-files__list">
        {items.map((item) => {
          const isLink = item._type === 'linkItem'
          const ref = item.file?.asset?._ref

          if (!isLink && !ref) return null

          // dl=1 makes the proxy send Content-Disposition: attachment.
          const href = isLink
            ? item.href
            : `/api/portal/${portalCode}/asset/${ref}?dl=1`

          return (
            <li key={item._key} className="fr-files__item">
              <a
                href={href}
                className="fr-files__link"
                {...(isLink
                  ? { target: '_blank', rel: 'noopener noreferrer nofollow' }
                  : { download: true })}
              >
                <span className="fr-files__label">{item.label}</span>
                {item.note && <span className="fr-files__note">{item.note}</span>}
                <span className="fr-files__action" aria-hidden="true">
                  {isLink ? '↗' : '↓'}
                </span>
              </a>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
