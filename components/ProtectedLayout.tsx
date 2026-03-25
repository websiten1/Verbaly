'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const SIDEBAR_W = 220

const navItems = [
  { href: '/dashboard', label: 'Dashboard',     shortLabel: 'Home',    icon: 'dashboard' },
  { href: '/rewrite',   label: 'Rewrite',       shortLabel: 'Rewrite', icon: 'rewrite'   },
  { href: '/generate',  label: 'Generate',      shortLabel: 'Generate',icon: 'generate'  },
  { href: '/profile',   label: 'Style Profile', shortLabel: 'Profile', icon: 'profile'   },
  { href: '/history',   label: 'History',       shortLabel: 'History', icon: 'history'   },
  { href: '/pricing',   label: 'Pricing',       shortLabel: 'Plans',   icon: 'pricing'   },
]

function NavIcon({ icon, active, size = 16 }: { icon: string; active: boolean; size?: number }) {
  const stroke = active ? '#6B1FFF' : '#888880'
  const p = {
    width: size, height: size,
    viewBox: '0 0 24 24', fill: 'none' as const,
    stroke, strokeWidth: 1.8 as const,
    strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
    style: { flexShrink: 0 },
  }
  if (icon === 'dashboard') return (
    <svg {...p}>
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
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
  const [mounted] = useState(true)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const JET: React.CSSProperties = {
    fontFamily: "'JetBrains Mono', 'Courier New', monospace",
  }

  return (
    <>
      <style>{`
        html, body { overflow-x: hidden; background: #FFFFFF; }

        #vb-main {
          padding-left: 32px;
          padding-right: 32px;
          padding-top: 32px;
          box-sizing: border-box;
        }

        #vb-sidebar { display: none; }

        @media (min-width: 768px) {
          #vb-sidebar {
            display: flex;
            flex-direction: column;
            position: fixed;
            top: 0; left: 0; bottom: 0;
            width: ${SIDEBAR_W}px;
            background: #FFFFFF;
            border-right: 1px solid #E0E0E0;
            z-index: 30;
            overflow-y: auto;
          }
          #vb-main {
            margin-left: ${SIDEBAR_W}px;
            width: calc(100% - ${SIDEBAR_W}px);
          }
        }

        #vb-mobile-nav { display: flex; }

        @media (min-width: 768px) {
          #vb-mobile-nav { display: none; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', backgroundColor: '#FFFFFF', overflowX: 'hidden' }}>

        {/* ── Sidebar ── */}
        <aside id="vb-sidebar">

          {/* Logo */}
          <div style={{ padding: '24px 20px 20px', flexShrink: 0 }}>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <span style={{
                ...JET,
                fontFamily: "'Courier Prime', 'Courier New', monospace",
                fontSize: '14px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '.18em',
                color: '#0E0E0E',
              }}>
                Verbaly
              </span>
            </Link>
          </div>

          <div style={{ height: '1px', backgroundColor: '#E0E0E0', margin: '0 0', flexShrink: 0 }} />

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
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
                    padding: '9px 20px 9px 17px',
                    borderLeft: `3px solid ${active ? '#6B1FFF' : 'transparent'}`,
                    textDecoration: 'none',
                    ...JET,
                    fontSize: '11px',
                    fontWeight: active ? '500' : '400',
                    textTransform: 'uppercase',
                    letterSpacing: '.12em',
                    marginBottom: '1px',
                    transition: 'all 200ms ease',
                    transitionDelay: mounted ? '0ms' : `${i * 40}ms`,
                    transform: mounted ? 'translateX(0)' : 'translateX(-10px)',
                    opacity: mounted ? 1 : 0,
                    color: active ? '#0E0E0E' : '#888880',
                  }}
                >
                  <NavIcon icon={item.icon} active={active} />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Sign out */}
          <div style={{ padding: '0 0 24px', flexShrink: 0 }}>
            <div style={{ height: '1px', backgroundColor: '#E0E0E0', marginBottom: '12px' }} />
            <button
              onClick={handleSignOut}
              style={{
                width: '100%',
                padding: '9px 20px 9px 20px',
                backgroundColor: 'transparent',
                border: 'none',
                color: '#888880',
                cursor: 'pointer',
                ...JET,
                fontSize: '11px',
                textTransform: 'uppercase',
                letterSpacing: '.12em',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Sign out
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main
          id="vb-main"
          style={{ paddingBottom: '80px', minHeight: '100vh', boxSizing: 'border-box' }}
        >
          {children}
        </main>

        {/* ── Mobile bottom nav ── */}
        <nav
          id="vb-mobile-nav"
          style={{
            position: 'fixed',
            bottom: 0, left: 0, right: 0,
            zIndex: 50,
            alignItems: 'center',
            justifyContent: 'space-around',
            backgroundColor: '#FFFFFF',
            borderTop: '1px solid #E0E0E0',
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
                  color: active ? '#6B1FFF' : '#888880',
                  padding: '4px 8px',
                }}
              >
                <NavIcon icon={item.icon} active={active} size={18} />
                <span style={{
                  ...JET,
                  fontSize: '9px',
                  fontWeight: active ? '500' : '400',
                  textTransform: 'uppercase',
                  letterSpacing: '.08em',
                  lineHeight: 1,
                }}>
                  {item.shortLabel}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </>
  )
}
