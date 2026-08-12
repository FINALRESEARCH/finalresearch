type Bullet = { text?: string; indent?: number }

export type ScopeTableBlock = {
  _key: string
  heading?: string
  date?: string
  rows?: {
    _key: string
    title?: string
    bullets?: Bullet[]
    deliverables?: string[]
    time?: string
    cost?: string
  }[]
  currency?: string
  duration?: string
  priceOriginal?: string
  priceFinal?: string
  startNote?: string
  endNote?: string
  paymentTerms?: string
  payableTo?: string
}

function formatDate(value?: string): string {
  if (!value) return ''
  const [y, m, d] = value.split('-')
  return y && m && d ? `${d}.${m}.${y}` : value
}

const EM_DASH = '—'

export function ScopeTable({
  block,
  projectCode,
}: {
  block: ScopeTableBlock
  projectCode: string
}) {
  const rows = block.rows ?? []

  return (
    <section className="fr-scope" aria-label={block.heading || 'Scope'}>
      <div className="fr-scope__scroll">
        <table className="fr-scope__table">
          <thead>
            <tr className="fr-scope__bar-row">
              <th scope="col">FINAL RESEARCH</th>
              <th scope="col">{block.heading}</th>
              <th scope="col">{formatDate(block.date)}</th>
              <th scope="col" className="fr-scope__cell--end">
                {projectCode.toUpperCase().replace(/-/g, '_')}
              </th>
            </tr>
            <tr>
              <th scope="col">Scope</th>
              <th scope="col">Deliverables</th>
              <th scope="col">Time</th>
              <th scope="col" className="fr-scope__cell--end">
                Cost ({block.currency || 'CAD'})
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row._key}>
                <td>
                  <div className="fr-scope__row-title">{row.title}</div>
                  {row.bullets && row.bullets.length > 0 && (
                    <ul className="fr-scope__bullets">
                      {row.bullets.map((bullet, i) => (
                        <li
                          key={i}
                          className={`fr-scope__bullet fr-scope__bullet--${bullet.indent || 0}`}
                        >
                          {bullet.text}
                        </li>
                      ))}
                    </ul>
                  )}
                </td>
                <td>
                  {row.deliverables && row.deliverables.length > 0 ? (
                    row.deliverables.map((line, i) => (
                      <div key={i} className="fr-scope__deliverable">
                        {line}
                      </div>
                    ))
                  ) : (
                    EM_DASH
                  )}
                </td>
                <td>
                  {row.time
                    ? row.time
                        .split(' / ')
                        .map((line, i) => <div key={i}>{line}</div>)
                    : EM_DASH}
                </td>
                <td className="fr-scope__cell--end">{row.cost || EM_DASH}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="fr-scope__totals">
        <span className="fr-scope__totals-label">Totals</span>
        <span className="fr-scope__totals-duration">
          {block.duration && `DURATION: ${block.duration}`}
        </span>
        <span className="fr-scope__totals-price">
          {block.priceOriginal && (
            <s className="fr-scope__price-was">{block.priceOriginal}</s>
          )}{' '}
          <strong>{block.priceFinal}</strong>
        </span>
      </div>

      <div className="fr-scope__footnotes">
        <span className="fr-scope__footnotes-spacer" />
        <div className="fr-scope__footnotes-dates">
          {block.startNote && <div>START: {block.startNote}</div>}
          {block.endNote && <div>END: {block.endNote}</div>}
        </div>
        <div className="fr-scope__footnotes-payment">
          {block.paymentTerms && (
            <div>
              Payment Terms:
              <br />
              {block.paymentTerms}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
