'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', color: '#3B82F6', delay: '0ms', icon: 'dashboard' },
  { href: '/rewrite', label: 'Rewrite', shortLabel: 'Rewrite', color: '#54F2F2', delay: '75ms', icon: 'rewrite' },
  { href: '/generate', label: 'Generate', shortLabel: 'Generate', color: '#A78BFA', delay: '150ms', icon: 'generate' },
  { href: '/profile', label: 'Style Profile', shortLabel: 'Profile', color: '#F59E0B', delay: '225ms', icon: 'profile' },
  { href: '/history', label: 'History', shortLabel: 'History', color: '#EC4899', delay: '300ms', icon: 'history' },
  { href: '/pricing', label: 'Pricing', shortLabel: 'Plans', color: '#5EB1BF', delay: '375ms', icon: 'pricing' },
]

function NavIcon({ icon, color, size = 18 }: { icon: string; color: string; size?: number }) {
  const svgProps = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    style: { color, flexShrink: 0 },
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
    <div className="flex h-screen" style={{ backgroundColor: '#FCFCFC' }}>
      {/* Sidebar — hidden on mobile, shown on md+ */}
      <aside
        className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0"
        style={{
          backgroundColor: '#042A2B',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 10,
          width: '240px',
        }}
      >
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', color: '#FCFCFC' }}>
              <span style={{ fontWeight: 700 }}>Verba</span><em style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#54F2F2', fontSize: '110%' }}>ly</em>
            </span>
          </Link>
        </div>

        <nav style={{ flex: 1, padding: '16px 12px' }}>
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
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '4px',
                  transition: 'all 200ms ease',
                  transitionDelay: item.delay,
                  transform: mounted ? 'translateX(0)' : 'translateX(-20px)',
                  opacity: mounted ? 1 : 0,
                  ...(isActive
                    ? {
                        backgroundColor: 'rgba(84,242,242,0.12)',
                        borderLeft: '3px solid #54F2F2',
                        color: '#FCFCFC',
                      }
                    : isHovered
                    ? {
                        backgroundColor: 'rgba(94,177,191,0.15)',
                        borderLeft: '3px solid transparent',
                        color: '#FCFCFC',
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderLeft: '3px solid transparent',
                        color: 'rgba(252,252,252,0.7)',
                      }),
                }}
              >
                <NavIcon icon={item.icon} color={isActive ? '#54F2F2' : item.color} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'rgba(252,252,252,0.6)',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(252,252,252,0.6)', flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content — offset by sidebar width on md+, pad bottom for mobile nav */}
      <main className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ marginLeft: '0' }}>
        <div className="md:ml-60">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav bar — visible only on mobile */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[#042A2B] border-t border-[#5EB1BF]/20 px-2 py-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center px-1"
              style={{
                textDecoration: 'none',
                color: isActive ? '#FCFCFC' : 'rgba(252,252,252,0.6)',
                backgroundColor: isActive ? 'rgba(84,242,242,0.12)' : 'transparent',
                borderRadius: '8px',
              }}
            >
              <NavIcon icon={item.icon} color={isActive ? '#54F2F2' : 'rgba(252,252,252,0.6)'} size={20} />
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
