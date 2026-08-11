'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

const LENGTH = 4
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back']

export function UnlockForm({ portalCode }: { portalCode: string }) {
  const router = useRouter()
  const [digits, setDigits] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  async function submit(code: string) {
    setPending(true)
    setError(null)
    try {
      const response = await fetch(`/api/portal/${portalCode}/unlock`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: code }),
      })
      const data = await response.json()
      if (data.ok) {
        router.refresh()
        return
      }
      setError(data.error || 'Incorrect code')
      setDigits([])
    } catch {
      setError('Something went wrong. Try again.')
      setDigits([])
    } finally {
      setPending(false)
    }
  }

  function pressDigit(digit: string) {
    if (pending || digits.length >= LENGTH) return
    setError(null)
    const next = [...digits, digit]
    setDigits(next)
    if (next.length === LENGTH) submit(next.join(''))
  }

  function pressBackspace() {
    if (pending) return
    setError(null)
    setDigits((prev) => prev.slice(0, -1))
  }

  // Physical keyboards still work; the numpad is the primary input surface.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (/^[0-9]$/.test(event.key)) pressDigit(event.key)
      else if (event.key === 'Backspace') pressBackspace()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  })

  return (
    <div className="fr-unlock">
      <p className="fr-unlock__label">Enter your access code</p>

      <div className="fr-unlock__inputs" aria-hidden="true">
        {Array.from({ length: LENGTH }, (_, index) => (
          <div
            key={index}
            className="fr-unlock__digit"
            data-filled={index < digits.length || undefined}
            aria-invalid={error ? true : undefined}
          >
            {digits[index] ? '•' : ''}
          </div>
        ))}
      </div>

      <div className="fr-unlock__keypad" role="group" aria-label="Access code keypad">
        {KEYS.map((key, i) =>
          key === '' ? (
            <span key={i} aria-hidden="true" />
          ) : key === 'back' ? (
            <button
              key={i}
              type="button"
              className="fr-unlock__key fr-unlock__key--back"
              onClick={pressBackspace}
              disabled={pending || digits.length === 0}
              aria-label="Delete last digit"
            >
              ⌫
            </button>
          ) : (
            <button
              key={i}
              type="button"
              className="fr-unlock__key"
              onClick={() => pressDigit(key)}
              disabled={pending}
              aria-label={`Digit ${key}`}
            >
              {key}
            </button>
          ),
        )}
      </div>

      <p className="fr-unlock__status" role="status" aria-live="polite">
        {pending ? 'Checking…' : error}
      </p>
    </div>
  )
}
