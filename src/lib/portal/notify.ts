import 'server-only'

import { formatProjectTitle } from './format'

/**
 * First-open notification. Deliberately dependency-free — Resend's REST API is
 * one POST, and this keeps the bundle out of the unlock path's critical route.
 */
export async function notifyFirstOpen(input: {
  portalCode: string
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY
  const to = process.env.PORTAL_NOTIFY_EMAIL

  // Not configured is a valid state, not an error — portals work without email.
  if (!apiKey || !to) return

  const title = formatProjectTitle(input.portalCode)

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'FINAL RESEARCH <portals@finalresearch.org>',
        to: [to],
        subject: `${title} opened their portal`,
        text: [
          `${title} unlocked /${input.portalCode} for the first time.`,
          '',
          new Date().toLocaleString('en-CA', { timeZone: 'America/Toronto' }),
        ].join('\n'),
      }),
    })

    if (!response.ok) {
      console.error('[portal] resend rejected', await response.text())
    }
  } catch (error) {
    console.error('[portal] failed to send first-open email', error)
  }
}
