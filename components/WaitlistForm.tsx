'use client'

import { useState } from 'react'

export default function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    window.open(
      `https://useverbalyapp.beehiiv.com/subscribe?email=${encodeURIComponent(email)}`,
      '_blank',
      'noopener,noreferrer',
    )
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{
        border: '1px solid #111111',
        padding: '20px 28px',
        display: 'inline-block',
      }}>
        <p style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#111111',
        }}>
          YOU&apos;RE ON THE LIST →
        </p>
        <p style={{
          fontFamily: 'var(--font-jet)',
          fontSize: '11px',
          color: '#666666',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          marginTop: '6px',
        }}>
          Check the new tab to confirm.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: 'flex',
        flexDirection: compact ? 'row' : 'column',
        gap: '0',
        width: '100%',
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="YOUR EMAIL ADDRESS"
        style={{
          flex: 1,
          padding: compact ? '11px 14px' : '14px 16px',
          border: '1px solid #111111',
          borderRight: compact ? 'none' : '1px solid #111111',
          borderBottom: compact ? '1px solid #111111' : 'none',
          borderRadius: 0,
          backgroundColor: 'transparent',
          color: '#111111',
          fontSize: '11px',
          fontFamily: 'var(--font-jet)',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          width: compact ? 'auto' : '100%',
        }}
      />
      <button
        type="submit"
        style={{
          padding: compact ? '11px 22px' : '14px 20px',
          backgroundColor: '#111111',
          color: '#FFFFFF',
          border: '1px solid #111111',
          borderRadius: 0,
          fontSize: '11px',
          fontWeight: 700,
          fontFamily: 'var(--font-mono)',
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        JOIN WAITLIST →
      </button>
    </form>
  )
}
