export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#061517', borderTop: '1px solid #1E3B3F' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 24px 32px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', textAlign: 'center' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
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

          {/* Tagline */}
          <p style={{ color: '#5E8E90', fontSize: '14px', fontStyle: 'italic', fontFamily: 'Instrument Serif, serif' }}>
            Your writing voice, preserved.
          </p>

          {/* Copyright */}
          <p style={{ color: '#5E8E90', fontSize: '13px', marginTop: '8px' }}>
            © 2026 Verbaly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
