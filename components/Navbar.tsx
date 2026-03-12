'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E2E8F0' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '24px', color: '#042A2B', letterSpacing: '-0.5px' }}>
              <span style={{ fontWeight: 700 }}>Verba</span><em style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#54F2F2', fontSize: '110%' }}>ly</em>
            </span>
          </Link>

          {/* Nav links — hidden on mobile, shown on md+ */}
          <div className="hidden md:flex items-center gap-8">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>
                      Dashboard
                    </Link>
                    <Link href="/rewrite" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>
                      Rewrite
                    </Link>
                    <Link href="/profile" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #E2E8F0',
                        color: '#64748B',
                        padding: '8px 16px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      style={{
                        backgroundColor: '#54F2F2',
                        color: '#042A2B',
                        padding: '8px 20px',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '600',
                      }}
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile: show only one CTA button */}
          <div className="flex md:hidden">
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  style={{
                    backgroundColor: '#54F2F2',
                    color: '#042A2B',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  href="/signup"
                  style={{
                    backgroundColor: '#54F2F2',
                    color: '#042A2B',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                  }}
                >
                  Get Started
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
