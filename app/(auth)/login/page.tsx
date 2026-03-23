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
  padding: '16px',
  color: '#16150F',
  fontSize: '15px',
  fontFamily: 'DM Sans, sans-serif',
  outline: 'none',
}

export default function LoginPage() {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [loading,  setLoading]  = useState(false)
  const router   = useRouter()
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

  return (
    <>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: '28px', fontWeight: '400',
          color: '#16150F', letterSpacing: '-0.5px',
          marginBottom: '6px',
        }}>
          Welcome back
        </h1>
        <p style={{ color: '#A09D95', fontSize: '14px' }}>
          Sign in to your Verbaly account
        </p>
      </div>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            transition: 'background-color 150ms',
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
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#A09D95', fontSize: '14px', marginTop: '24px' }}>
        No account?{' '}
        <Link href="/signup" style={{ color: '#042A2B', textDecoration: 'none', fontWeight: '600' }}>
          Sign up free
        </Link>
      </p>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
