'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const INPUT: React.CSSProperties = {
  width: '100%',
  backgroundColor: '#F9F8F5',
  border: '1px solid #E5E2D8',
  borderRadius: '10px',
  padding: '12px 16px',
  color: '#16150F',
  fontSize: '15px',
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
}

export default function SignupPage() {
  const [email,           setEmail]           = useState('')
  const [password,        setPassword]        = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error,           setError]           = useState<string | null>(null)
  const [success,         setSuccess]         = useState(false)
  const [loading,         setLoading]         = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) { setError('Passwords do not match'); return }
    if (password.length < 6)         { setError('Password must be at least 6 characters'); return }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    })

    if (error) { setError(error.message); setLoading(false); return }

    setSuccess(true)
    setLoading(false)
    setTimeout(() => { router.push('/dashboard'); router.refresh() }, 2000)
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '24px 0' }}>
        {/* Animated check ring */}
        <div style={{
          width: '64px', height: '64px',
          backgroundColor: 'rgba(84,242,242,0.1)',
          border: '1px solid rgba(84,242,242,0.25)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '26px', color: '#54F2F2',
        }}>
          ✓
        </div>
        <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '24px', fontWeight: '400', color: '#16150F', marginBottom: '10px' }}>
          Account created!
        </h2>
        <p style={{ color: '#6B6960', fontSize: '14px', lineHeight: '1.65' }}>
          Check your email to confirm, or you&apos;ll be redirected to your dashboard shortly.
        </p>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: '28px', fontWeight: '400',
          color: '#16150F', letterSpacing: '-0.5px',
          marginBottom: '6px',
        }}>
          Create your account
        </h1>
        <p style={{ color: '#A09D95', fontSize: '14px' }}>
          Start writing like yourself in minutes.
        </p>
      </div>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#6B6960', fontSize: '13px', fontWeight: '500', marginBottom: '7px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={INPUT}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#6B6960', fontSize: '13px', fontWeight: '500', marginBottom: '7px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={INPUT}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#6B6960', fontSize: '13px', fontWeight: '500', marginBottom: '7px' }}>
            Confirm password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={INPUT}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(220,38,38,0.05)',
            border: '1px solid rgba(220,38,38,0.18)',
            borderRadius: '10px',
            padding: '11px 14px',
            color: '#DC2626',
            fontSize: '13px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? 'rgba(4,42,43,0.5)' : '#042A2B',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '10px',
            padding: '13px 24px',
            fontSize: '15px', fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '4px',
            fontFamily: 'DM Sans, sans-serif',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          {loading && (
            <span style={{
              width: '15px', height: '15px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#FFFFFF',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
              display: 'inline-block',
            }} />
          )}
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#A09D95', fontSize: '13px', marginTop: '20px' }}>
        By signing up you agree to our terms of service.
      </p>

      <p style={{ textAlign: 'center', color: '#A09D95', fontSize: '14px', marginTop: '12px' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#042A2B', textDecoration: 'none', fontWeight: '600' }}>
          Sign in
        </Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
