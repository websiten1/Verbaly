'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null)
  const [loading, setLoading] = useState(true)
  const [scrolled, setScrolled] = useState(false)
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

    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: scrolled ? 'rgba(6,21,23,0.96)' : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled ? '1px solid #1E3B3F' : '1px solid transparent',
        transition: 'background-color 300ms ease, border-color 300ms ease, backdrop-filter 300ms ease',
      }}
    >
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" className="ring-glow">
              <circle cx="10" cy="10" r="8.5" stroke="#54F2F2" strokeWidth="1.4"/>
              <circle cx="10" cy="10" r="5.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.55"/>
              <circle cx="10" cy="10" r="2.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.25"/>
            </svg>
            <span style={{ fontSize: '20px', fontWeight: '700', letterSpacing: '-0.4px', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ color: '#E4F5F5' }}>Verba</span>
              <span style={{ color: '#54F2F2' }}>ly</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link href="/dashboard" style={{ color: '#9ECFCF', textDecoration: 'none', fontSize: '14px', fontWeight: '500', transition: 'color 150ms' }}>
                      Dashboard
                    </Link>
                    <Link href="/rewrite" style={{ color: '#9ECFCF', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                      Rewrite
                    </Link>
                    <Link href="/profile" style={{ color: '#9ECFCF', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                      Profile
                    </Link>
                    <button
                      onClick={handleSignOut}
                      style={{
                        background: 'transparent',
                        border: '1px solid #1E3B3F',
                        color: '#9ECFCF',
                        padding: '8px 18px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontFamily: 'DM Sans, sans-serif',
                        transition: 'border-color 150ms, color 150ms',
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/pricing" style={{ color: '#9ECFCF', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                      Pricing
                    </Link>
                    <Link href="/login" style={{ color: '#9ECFCF', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>
                      Log in
                    </Link>
                    <Link
                      href="/signup"
                      style={{
                        backgroundColor: '#54F2F2',
                        color: '#042A2B',
                        padding: '9px 20px',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontSize: '14px',
                        fontWeight: '700',
                        letterSpacing: '-0.2px',
                      }}
                    >
                      Start free
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile CTA */}
          <div className="flex md:hidden">
            {!loading && (
              user ? (
                <Link
                  href="/dashboard"
                  style={{
                    backgroundColor: 'rgba(84,242,242,0.12)',
                    color: '#54F2F2',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '600',
                    border: '1px solid rgba(84,242,242,0.25)',
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
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: '700',
                  }}
                >
                  Start free
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
