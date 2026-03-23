import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex' }}>

      {/* ── Left panel — dark brand ─────────────────────────── */}
      <div
        className="hidden lg:flex lg:flex-col"
        style={{
          width: '440px',
          flexShrink: 0,
          backgroundColor: '#061517',
          padding: '48px 48px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Concentric rings */}
        <div style={{
          position: 'absolute',
          bottom: '-200px', left: '-200px',
          width: '700px', height: '700px',
          pointerEvents: 'none',
        }}>
          {[80, 160, 250, 360, 480].map((r, i) => (
            <div key={r} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: r * 2, height: r * 2,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '1px solid rgba(84,242,242,0.12)',
              animation: `ringPulse ${3.5 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.35}s`,
            }} />
          ))}
        </div>

        {/* Logo */}
        <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'auto' }}>
          <svg width="22" height="22" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8.5" stroke="#54F2F2" strokeWidth="1.4"/>
            <circle cx="10" cy="10" r="5.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.55"/>
            <circle cx="10" cy="10" r="2.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.25"/>
          </svg>
          <span style={{ fontSize: '20px', fontWeight: '700', fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.3px' }}>
            <span style={{ color: '#E4F5F5' }}>Verba</span>
            <span style={{ color: '#54F2F2' }}>ly</span>
          </span>
        </Link>

        {/* Brand statement */}
        <div style={{ position: 'relative', zIndex: 1, marginTop: 'auto' }}>
          <blockquote style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '28px',
            fontWeight: '400',
            color: '#E4F5F5',
            lineHeight: '1.3',
            letterSpacing: '-0.5px',
            marginBottom: '24px',
          }}>
            &ldquo;The best AI writing is the kind that doesn&apos;t sound like AI at all.&rdquo;
          </blockquote>
          <p style={{ color: '#5E8E90', fontSize: '14px' }}>
            — The Verbaly design principle
          </p>

          {/* Three mini feature pills */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '40px' }}>
            {[
              'Learns your vocabulary & rhythm',
              'Extracts 6 style dimensions',
              'Match score on every rewrite',
            ].map((item) => (
              <div key={item} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                backgroundColor: 'rgba(84,242,242,0.06)',
                border: '1px solid rgba(84,242,242,0.12)',
                borderRadius: '8px', padding: '10px 14px',
              }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#54F2F2', flexShrink: 0 }} />
                <span style={{ color: '#9ECFCF', fontSize: '13px' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right panel — form ──────────────────────────────── */}
      <div style={{
        flex: 1,
        backgroundColor: '#F9F8F5',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}>
        {/* Mobile logo */}
        <div className="flex lg:hidden mb-8">
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '9px' }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="8.5" stroke="#54F2F2" strokeWidth="1.4"/>
              <circle cx="10" cy="10" r="5.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.55"/>
              <circle cx="10" cy="10" r="2.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.25"/>
            </svg>
            <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ color: '#16150F' }}>Verba</span>
              <span style={{ color: '#54F2F2' }}>ly</span>
            </span>
          </Link>
        </div>

        {/* Form card */}
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E2D8',
            borderRadius: '20px',
            padding: '40px 36px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
          }}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
