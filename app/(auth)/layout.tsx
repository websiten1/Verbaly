export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#F8FAFC',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <a href="/" style={{ textDecoration: 'none' }}>
            <span style={{ fontSize: '32px', color: '#1E3A5F' }}>
              <span style={{ fontWeight: 700 }}>Verba</span><em style={{ fontStyle: 'italic', fontWeight: 'bold', color: '#10B981', fontSize: '110%' }}>ly</em>
            </span>
          </a>
        </div>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '16px',
          padding: '32px 28px',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          {children}
        </div>
      </div>
    </div>
  )
}
