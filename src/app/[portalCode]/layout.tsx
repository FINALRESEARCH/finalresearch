import type { Metadata } from 'next'
import { draftMode } from 'next/headers'
import './portal.css'

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    nocache: true,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
}

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEnabled: preview } = await draftMode()

  // Imported inside the branch, not at module scope: a static import puts the
  // VisualEditing chunk in every client's page as a preloaded <script>, even
  // when the component itself never renders.
  const Overlay = preview
    ? (await import('next-sanity/visual-editing')).VisualEditing
    : null

  return (
    <>
      {/* The landing page pins body to 100vh; portals scroll. */}
      <style>{`html, body { height: auto; overflow: auto; }`}</style>
      <div className="fr-portal">{children}</div>
      {Overlay && <Overlay />}
    </>
  )
}
