'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ProtectedLayoutProps {
  children: React.ReactNode
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', color: '#3B82F6', delay: '0ms', icon: 'dashboard' },
  { href: '/rewrite', label: 'Rewrite', color: '#10B981', delay: '75ms', icon: 'rewrite' },
  { href: '/generate', label: 'Generate', color: '#8B5CF6', delay: '150ms', icon: 'generate' },
  { href: '/profile', label: 'Style Profile', color: '#F59E0B', delay: '225ms', icon: 'profile' },
  { href: '/history', label: 'History', color: '#EC4899', delay: '300ms', icon: 'history' },
]

function NavIcon({ icon, color }: { icon: string; color: string }) {
  const svgProps = {
    width: 18,
    height: 18,
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        backgroundColor: '#1E3A5F',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 10,
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '22px', color: '#FFFFFF' }}>
              <span style={{ fontWeight: 700 }}>Verba</span><em style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#10B981', fontSize: '110%' }}>ly</em>
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
                        backgroundColor: `${item.color}26`,
                        borderLeft: `3px solid ${item.color}`,
                        color: '#FFFFFF',
                      }
                    : isHovered
                    ? {
                        backgroundColor: `${item.color}1A`,
                        borderLeft: '3px solid transparent',
                        color: '#FFFFFF',
                      }
                    : {
                        backgroundColor: 'transparent',
                        borderLeft: '3px solid transparent',
                        color: 'rgba(255,255,255,0.7)',
                      }),
                }}
              >
                <NavIcon icon={item.icon} color={item.color} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button
            onClick={handleSignOut}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255,255,255,0.3)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.75)',
              cursor: 'pointer',
              fontSize: '14px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.75)', flexShrink: 0 }}>
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ marginLeft: '240px', flex: 1, minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        {children}
      </main>
    </div>
  )
}
