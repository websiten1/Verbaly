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
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '20px 32px',
        backgroundColor: 'rgba(84,242,242,0.08)',
        border: '1px solid rgba(84,242,242,0.25)',
        borderRadius: '12px',
      }}>
        <span style={{ fontSize: '22px' }}>🎉</span>
        <p style={{ color: '#54F2F2', fontWeight: '600', fontSize: '16px', margin: 0 }}>
          You&apos;re on the list!
        </p>
        <p style={{ color: '#9ECFCF', fontSize: '14px', margin: 0 }}>
          Check the new tab to confirm your spot.
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
        gap: '10px',
        width: '100%',
        maxWidth: compact ? '480px' : '420px',
        margin: '0 auto',
      }}
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        style={{
          flex: 1,
          padding: compact ? '11px 16px' : '14px 18px',
          borderRadius: '10px',
          border: '1px solid rgba(84,242,242,0.25)',
          backgroundColor: 'rgba(255,255,255,0.06)',
          color: '#E4F5F5',
          fontSize: '15px',
          fontFamily: 'DM Sans, sans-serif',
          outline: 'none',
          width: compact ? 'auto' : '100%',
        }}
      />
      <button
        type="submit"
        style={{
          padding: compact ? '11px 22px' : '14px 28px',
          borderRadius: '10px',
          backgroundColor: '#54F2F2',
          color: '#042A2B',
          fontSize: '15px',
          fontWeight: '700',
          fontFamily: 'DM Sans, sans-serif',
          border: 'none',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
          letterSpacing: '-0.2px',
        }}
      >
        Join the waitlist →
      </button>
    </form>
  )
}
