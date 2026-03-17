'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.push('/dashboard')
      router.refresh()
    }, 2000)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#F8F9FC',
    border: '1px solid #E8ECF4',
    borderRadius: '10px',
    padding: '12px 16px',
    color: '#1A2340',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'DM Sans, sans-serif',
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: 'rgba(26,110,255,0.08)',
          border: '1px solid rgba(26,110,255,0.2)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: '24px',
          color: '#1A6EFF',
        }}>
          ✓
        </div>
        <h2 style={{ color: '#1A2340', fontSize: '22px', fontWeight: '700', marginBottom: '12px', fontFamily: 'Instrument Serif, serif' }}>
          Account created!
        </h2>
        <p style={{ color: '#8A94A6', fontSize: '14px', lineHeight: '1.6' }}>
          Check your email to confirm your account, or you&apos;ll be redirected shortly.
        </p>
      </div>
    )
  }

  return (
    <>
      <h1 style={{ color: '#1A2340', fontSize: '26px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.3px', fontFamily: 'Instrument Serif, serif' }}>
        Create your account
      </h1>
      <p style={{ color: '#8A94A6', fontSize: '14px', marginBottom: '32px' }}>
        Start writing like yourself in minutes
      </p>

      <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#4A5568', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#4A5568', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#4A5568', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={inputStyle}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '10px',
            padding: '12px',
            color: '#DC2626',
            fontSize: '14px',
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: loading ? 'rgba(26,110,255,0.5)' : '#1A6EFF',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '13px 24px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            width: '100%',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#8A94A6', fontSize: '14px', marginTop: '24px' }}>
        Already have an account?{' '}
        <Link href="/login" style={{ color: '#1A6EFF', textDecoration: 'none', fontWeight: '500' }}>
          Sign in
        </Link>
      </p>
    </>
  )
}
