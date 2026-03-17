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
    <nav style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E8ECF4' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Ring icon */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="8.5" stroke="#1A6EFF" strokeWidth="1.5"/>
              <circle cx="10" cy="10" r="5.5" stroke="#1A6EFF" strokeWidth="1.5" opacity="0.55"/>
              <circle cx="10" cy="10" r="2.5" stroke="#1A6EFF" strokeWidth="1.5" opacity="0.25"/>
            </svg>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <span style={{ fontSize: '22px', fontWeight: '700', color: '#1A2340', letterSpacing: '-0.5px', fontFamily: 'DM Sans, sans-serif' }}>
                Verbaly
              </span>
              <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', backgroundColor: '#1A6EFF', borderRadius: '1px' }} />
            </div>
          </Link>

          {/* Nav links — hidden on mobile, shown on md+ */}
          <div className="hidden md:flex items-center gap-8">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" style={{ color: '#4A5568', textDecoration: 'none', fontSize: '14px' }}>
                      Dashboard
                    </Link>
                    <Link href="/rewrite" style={{ color: '#4A5568', textDecoration: 'none', fontSize: '14px' }}>
                      Rewrite
                    </Link>
                    <Link href="/profile" style={{ color: '#4A5568', textDecoration: 'none', fontSize: '14px' }}>
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #E8ECF4',
                        color: '#4A5568',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" style={{ color: '#4A5568', textDecoration: 'none', fontSize: '14px' }}>
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      style={{
                        backgroundColor: '#1A6EFF',
                        color: '#FFFFFF',
                        padding: '8px 20px',
                        borderRadius: '8px',
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
                    backgroundColor: '#1A6EFF',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
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
                    backgroundColor: '#1A6EFF',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
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
