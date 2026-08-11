import Link from 'next/link'
import { formatProjectTitle } from '@/lib/portal/format'

export function PortalHeader({
  mark = 'FINAL RESEARCH',
  subtitle,
}: {
  mark?: string
  subtitle?: string
}) {
  return (
    <header className="fr-portal__header">
      <div className="fr-portal__header-bar">{mark}</div>
      {subtitle && <div className="fr-portal__header-bar">{subtitle}</div>}
    </header>
  )
}

export function PortalFooter({ code }: { code: string }) {
  return (
    <footer className="fr-portal__footer">
      <Link href={`/${code}`} className="fr-portal__footer-code">
        {formatProjectTitle(code)}
      </Link>
    </footer>
  )
}
