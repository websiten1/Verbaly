export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#042A2B',
      backgroundImage: `
        linear-gradient(rgba(94,177,191,0.06) 1px, transparent 1px),
        linear-gradient(90deg, rgba(94,177,191,0.06) 1px, transparent 1px)
      `,
      backgroundSize: '80px 80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '32px', fontFamily: 'DM Sans, sans-serif' }}>
              <span style={{ fontWeight: 700, color: '#FCFCFC' }}>Verbal</span>
              <span style={{ fontWeight: 700, color: '#54F2F2' }}>y</span>
            </span>
          </a>
        </div>
        <div style={{
          backgroundColor: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '20px',
          padding: '36px 32px',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
