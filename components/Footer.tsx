import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#061517', borderTop: '1px solid #1E3B3F' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '64px 24px 32px' }}>

        {/* Top row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '40px', marginBottom: '56px' }}>

          {/* Brand */}
          <div style={{ gridColumn: 'span 1' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <circle cx="10" cy="10" r="8.5" stroke="#54F2F2" strokeWidth="1.4"/>
                <circle cx="10" cy="10" r="5.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.55"/>
                <circle cx="10" cy="10" r="2.5" stroke="#54F2F2" strokeWidth="1.4" opacity="0.25"/>
              </svg>
              <span style={{ fontSize: '18px', fontWeight: '700', fontFamily: 'DM Sans, sans-serif' }}>
                <span style={{ color: '#E4F5F5' }}>Verba</span>
                <span style={{ color: '#54F2F2' }}>ly</span>
              </span>
            </div>
            <p style={{ color: '#5E8E90', fontSize: '14px', lineHeight: '1.7', maxWidth: '220px' }}>
              Your writing voice, preserved. AI text that sounds unmistakably like you.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 style={{ color: '#9ECFCF', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Product
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { href: '/rewrite', label: 'Rewrite' },
                { href: '/generate', label: 'Generate' },
                { href: '/profile', label: 'Style Profile' },
                { href: '/history', label: 'History' },
              ].map(({ href, label }) => (
                <Link key={href} href={href} style={{ color: '#5E8E90', textDecoration: 'none', fontSize: '14px', transition: 'color 150ms' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Plans */}
          <div>
            <h4 style={{ color: '#9ECFCF', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Plans
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Free' },
                { label: 'Student — $7/mo' },
                { label: 'Academic Pro — $18/mo' },
              ].map(({ label }) => (
                <Link key={label} href="/pricing" style={{ color: '#5E8E90', textDecoration: 'none', fontSize: '14px' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 style={{ color: '#9ECFCF', fontSize: '12px', fontWeight: '600', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '16px' }}>
              Account
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link href="/login"  style={{ color: '#5E8E90', textDecoration: 'none', fontSize: '14px' }}>Log in</Link>
              <Link href="/signup" style={{ color: '#5E8E90', textDecoration: 'none', fontSize: '14px' }}>Sign up</Link>
            </div>
          </div>
        </div>

        {/* Bottom row */}
        <div style={{ borderTop: '1px solid #1E3B3F', paddingTop: '28px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <p style={{ color: '#5E8E90', fontSize: '13px' }}>
            © {new Date().getFullYear()} Verbaly. All rights reserved.
          </p>
          <p style={{ color: '#5E8E90', fontSize: '13px', fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
            Write like yourself, every single time.
          </p>
        </div>
      </div>
    </footer>
  )
}
