'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
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

  return (
    <>
      <h1 style={{ color: '#1A2340', fontSize: '26px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.3px', fontFamily: 'Instrument Serif, serif' }}>
        Welcome back
      </h1>
      <p style={{ color: '#8A94A6', fontSize: '14px', marginBottom: '32px' }}>
        Sign in to your{' '}
        <span style={{ color: '#1A2340', fontWeight: 600 }}>Verbaly</span>
        {' '}account
      </p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            transition: 'all 150ms ease',
            width: '100%',
            fontFamily: 'DM Sans, sans-serif',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#8A94A6', fontSize: '14px', marginTop: '24px' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: '#1A6EFF', textDecoration: 'none', fontWeight: '500' }}>
          Sign up
        </Link>
      </p>
    </>
  )
}
