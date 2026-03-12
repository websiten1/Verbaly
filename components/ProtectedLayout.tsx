'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', delay: '0ms', icon: 'dashboard' },
  { href: '/rewrite', label: 'Rewrite', shortLabel: 'Rewrite', delay: '75ms', icon: 'rewrite' },
  { href: '/generate', label: 'Generate', shortLabel: 'Generate', delay: '150ms', icon: 'generate' },
  { href: '/profile', label: 'Style Profile', shortLabel: 'Profile', delay: '225ms', icon: 'profile' },
  { href: '/history', label: 'History', shortLabel: 'History', delay: '300ms', icon: 'history' },
  { href: '/pricing', label: 'Pricing', shortLabel: 'Plans', delay: '375ms', icon: 'pricing' },
]

function NavIcon({ icon, isActive, size = 18 }: { icon: string; isActive: boolean; size?: number }) {
  const color = isActive ? '#54F2F2' : 'rgba(252,252,252,0.5)'
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: color,
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { flexShrink: 0 },
  }

  if (icon === 'dashboard') {
    return (
      <svg {...svgProps}>
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="14" y="14" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
      </svg>
    )
  }
  if (icon === 'rewrite') {
    return (
      <svg {...svgProps}>
        <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
        <path d="M21 3v5h-5"/>
        <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
        <path d="M8 16H3v5"/>
      </svg>
    )
  }
  if (icon === 'generate') {
    return (
      <svg {...svgProps}>
        <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
        <path d="M5 3v4"/>
        <path d="M3 5h4"/>
        <path d="M19 17v4"/>
        <path d="M17 19h4"/>
      </svg>
    )
  }
  if (icon === 'profile') {
    return (
      <svg {...svgProps}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    )
  }
  if (icon === 'history') {
    return (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    )
  }
  if (icon === 'pricing') {
    return (
      <svg {...svgProps}>
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    )
  }
  return null
}

const gridBg = {
  backgroundColor: '#042A2B',
  backgroundImage: `
    linear-gradient(rgba(94,177,191,0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(94,177,191,0.06) 1px, transparent 1px)
  `,
  backgroundSize: '80px 80px',
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mounted, setMounted] = useState(false)
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="flex h-screen" style={gridBg}>
      {/* Sidebar */}
      <aside
        className="hidden md:flex md:flex-col md:flex-shrink-0"
        style={{
          backgroundColor: '#021E1F',
          boxShadow: '2px 0 24px rgba(0,0,0,0.4)',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
          width: '240px',
        }}
      >
        <div style={{ padding: '28px 24px 20px' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ fontWeight: 700, color: '#FCFCFC' }}>Verbal</span>
              <span style={{ fontWeight: 700, color: '#54F2F2' }}>y</span>
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '8px 12px' }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isHovered = hoveredItem === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                onMouseEnter={() => setHoveredItem(item.href)}
                onMouseLeave={() => setHoveredItem(null)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  borderRadius: '100px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  marginBottom: '4px',
                  transition: 'all 150ms ease',
                  transitionDelay: item.delay,
                  transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: mounted ? 1 : 0,
                  ...(isActive
                    ? {
                        backgroundColor: 'rgba(84,242,242,0.1)',
                        color: '#54F2F2',
                      }
                    : isHovered
                    ? {
                        backgroundColor: 'rgba(94,177,191,0.1)',
                        color: 'rgba(252,252,252,0.9)',
                      }
                    : {
                        backgroundColor: 'transparent',
                        color: 'rgba(252,252,252,0.5)',
                      }),
                }}
              >
                <NavIcon icon={item.icon} isActive={isActive} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 12px 24px' }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '10px 14px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '100px',
              color: 'rgba(252,252,252,0.4)',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 150ms ease',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ marginLeft: '0', backgroundColor: 'transparent' }}>
        <div className="md:ml-60">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2"
        style={{
          backgroundColor: '#021E1F',
          borderTop: '1px solid rgba(84,242,242,0.1)',
        }}
      >
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-1"
              style={{
                textDecoration: 'none',
                color: isActive ? '#54F2F2' : 'rgba(252,252,252,0.45)',
                backgroundColor: isActive ? 'rgba(84,242,242,0.08)' : 'transparent',
                borderRadius: '12px',
              }}
            >
              <NavIcon icon={item.icon} isActive={isActive} size={20} />
              <span style={{ fontSize: '10px', fontWeight: isActive ? 600 : 400, lineHeight: 1 }}>
                {item.shortLabel}
              </span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
