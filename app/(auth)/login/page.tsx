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

  return (
    <>
      <h1 style={{ color: '#0F172A', fontSize: '26px', fontWeight: '700', marginBottom: '8px', letterSpacing: '-0.5px' }}>
        Welcome back
      </h1>
      <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '32px' }}>
        Sign in to your <span style={{ fontWeight: 700 }}>Verba</span><em style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#10B981', fontSize: '110%' }}>ly</em> account
      </p>

      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label style={{ display: 'block', color: '#0F172A', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@example.com"
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#0F172A',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', color: '#0F172A', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
            style={{
              width: '100%',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '8px',
              padding: '12px 14px',
              color: '#0F172A',
              fontSize: '15px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            borderRadius: '8px',
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
            backgroundColor: loading ? 'rgba(30,58,95,0.5)' : '#1E3A5F',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '8px',
            padding: '13px 24px',
            fontSize: '15px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '8px',
            transition: 'opacity 0.15s',
          }}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <p style={{ textAlign: 'center', color: '#64748B', fontSize: '14px', marginTop: '24px' }}>
        Don&apos;t have an account?{' '}
        <Link href="/signup" style={{ color: '#1E3A5F', textDecoration: 'none', fontWeight: '500' }}>
          Sign up
        </Link>
      </p>
    </>
  )
}
