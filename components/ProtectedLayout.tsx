'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home',    icon: 'dashboard' },
  { href: '/rewrite',   label: 'Rewrite',   shortLabel: 'Rewrite', icon: 'rewrite'   },
  { href: '/generate',  label: 'Generate',  shortLabel: 'Generate',icon: 'generate'  },
  { href: '/profile',   label: 'Style Profile', shortLabel: 'Profile', icon: 'profile' },
  { href: '/history',   label: 'History',   shortLabel: 'History', icon: 'history'   },
  { href: '/pricing',   label: 'Pricing',   shortLabel: 'Plans',   icon: 'pricing'   },
]

function NavIcon({ icon, active, size = 18 }: { icon: string; active: boolean; size?: number }) {
  const stroke = active ? '#042A2B' : '#A09D95'
  const p = {
    width: size, height: size,
    viewBox: '0 0 24 24', fill: 'none' as const,
    stroke, strokeWidth: 1.8 as const,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    style: { flexShrink: 0 },
  }
  if (icon === 'dashboard') return (
    <svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  )
  if (icon === 'rewrite') return (
    <svg {...p}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
      <path d="M21 3v5h-5"/>
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
      <path d="M8 16H3v5"/>
    </svg>
  )
  if (icon === 'generate') return (
    <svg {...p}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
    </svg>
  )
  if (icon === 'profile') return (
    <svg {...p}>
      <circle cx="12" cy="8" r="4"/>
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
    </svg>
  )
  if (icon === 'history') return (
    <svg {...p}>
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15 15"/>
    </svg>
  )
  if (icon === 'pricing') return (
    <svg {...p}>
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  )
  return null
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const pathname = usePathname()
  const router   = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F9F8F5' }}>

      {/* ── Sidebar (desktop) ───────────────────────────────────── */}
      <aside
        className="hidden md:flex md:flex-col"
        style={{
          position: 'fixed',
          top: 0, left: 0, bottom: 0,
          width: '232px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid #E5E2D8',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Logo */}
        <div style={{ padding: '28px 20px 20px' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="#54F2F2" strokeWidth="1.4"/>
              <circle cx="10" cy="10" r="5.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.6"/>
              <circle cx="10" cy="10" r="2.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.3"/>
            </svg>
            <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.3px' }}>
              <span style={{ color: '#16150F' }}>Verba</span>
              <span style={{ color: '#54F2F2' }}>ly</span>
            </span>
          </Link>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', backgroundColor: '#F0EDE4', margin: '0 16px' }} />

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {navItems.map((item, i) => {
            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? '600' : '400',
                  marginBottom: '2px',
                  transition: 'all 200ms ease',
                  transitionDelay: mounted ? '0ms' : `${i * 40}ms`,
                  transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                  opacity: mounted ? 1 : 0,
                  backgroundColor: active ? 'rgba(84,242,242,0.12)' : 'transparent',
                  color: active ? '#042A2B' : '#A09D95',
                }}
              >
                <NavIcon icon={item.icon} active={active} />
                {item.label}
                {active && (
                  <div style={{
                    marginLeft: 'auto',
                    width: '5px', height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#54F2F2',
                    flexShrink: 0,
                  }} />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div style={{ padding: '12px 10px 24px' }}>
          <div style={{ height: '1px', backgroundColor: '#F0EDE4', marginBottom: '12px' }} />
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '9px 12px',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '8px',
              color: '#A09D95',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              fontFamily: 'DM Sans, sans-serif',
              transition: 'color 150ms, background-color 150ms',
            }}
          >
            <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ────────────────────────────────────────── */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ marginLeft: 0, paddingBottom: '72px' }}
      >
        <div className="md:ml-[232px]">
          {children}
        </div>
      </main>

      {/* ── Mobile bottom nav ───────────────────────────────────── */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around"
        style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid #E5E2D8',
          padding: '6px 4px',
          paddingBottom: 'calc(6px + env(safe-area-inset-bottom))',
        }}
      >
        {navItems.map((item) => {
          const active = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '3px',
                minWidth: '44px',
                minHeight: '44px',
                justifyContent: 'center',
                textDecoration: 'none',
                color: active ? '#042A2B' : '#A09D95',
                backgroundColor: active ? 'rgba(84,242,242,0.1)' : 'transparent',
                borderRadius: '10px',
                padding: '4px 8px',
                transition: 'all 150ms',
              }}
            >
              <NavIcon icon={item.icon} active={active} size={19} />
              <span style={{ fontSize: '10px', fontWeight: active ? '600' : '400', lineHeight: 1 }}>
                {item.shortLabel}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
