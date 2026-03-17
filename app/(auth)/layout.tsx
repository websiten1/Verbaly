export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8F9FC',
      backgroundImage: `
        linear-gradient(#E8ECF4 1px, transparent 1px),
        linear-gradient(90deg, #E8ECF4 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <svg width="22" height="22" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="10" cy="10" r="8.5" stroke="#1A6EFF" strokeWidth="1.5"/>
              <circle cx="10" cy="10" r="5.5" stroke="#1A6EFF" strokeWidth="1.5" opacity="0.55"/>
              <circle cx="10" cy="10" r="2.5" stroke="#1A6EFF" strokeWidth="1.5" opacity="0.25"/>
            </svg>
            <div style={{ position: 'relative' }}>
              <span style={{ fontSize: '28px', fontWeight: '700', color: '#1A2340', fontFamily: 'DM Sans, sans-serif' }}>
                Verbaly
              </span>
              <div style={{ position: 'absolute', bottom: '-1px', left: 0, right: 0, height: '2px', backgroundColor: '#1A6EFF', borderRadius: '1px' }} />
            </div>
          </a>
        </div>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8ECF4',
          borderRadius: '20px',
          padding: '36px 32px',
          boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
