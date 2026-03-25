'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToWaitlist = () => {
    document.getElementById('waitlist')?.scrollIntoView({ behavior: 'smooth' })
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

          {/* Join waitlist button */}
          <button
            onClick={scrollToWaitlist}
            style={{
              backgroundColor: '#54F2F2',
              color: '#042A2B',
              padding: '9px 20px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '14px',
              fontWeight: '700',
              fontFamily: 'DM Sans, sans-serif',
              letterSpacing: '-0.2px',
              cursor: 'pointer',
            }}
          >
            Join waitlist
          </button>
        </div>
      </div>
    </nav>
  )
}
