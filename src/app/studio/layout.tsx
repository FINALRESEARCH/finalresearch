import type { Metadata } from 'next'

// Studio needs its own viewport (no user-scaling clamp from the landing page).
export { viewport } from 'next-sanity/studio'

export const metadata: Metadata = {
  title: 'Studio — FINAL RESEARCH',
  robots: { index: false, follow: false, nocache: true },
}

/**
 * globals.css pins html/body to 100vh with overflow hidden for the landing
 * page. Studio manages its own scrolling, so undo that here only.
 */
export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style>{`html, body { height: auto; overflow: auto; }`}</style>
      {children}
    </>
  )
}
