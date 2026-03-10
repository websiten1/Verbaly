import Link from 'next/link'

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E8F0', padding: '48px 24px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '40px', marginBottom: '40px' }}>
          <div>
            <span style={{ fontSize: '22px', fontWeight: '700', color: '#1E3A5F', display: 'block', marginBottom: '12px' }}>
              Verbaly
            </span>
            <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.6' }}>
              AI-powered writing that sounds like you.
            </p>
          </div>
          <div>
            <h4 style={{ color: '#0F172A', fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Product</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/rewrite" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>Rewrite</Link>
              <Link href="/profile" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>Style Profile</Link>
              <Link href="/history" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>History</Link>
            </div>
          </div>
          <div>
            <h4 style={{ color: '#0F172A', fontWeight: '600', marginBottom: '16px', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Account</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link href="/login" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>Log In</Link>
              <Link href="/signup" style={{ color: '#64748B', textDecoration: 'none', fontSize: '14px' }}>Sign Up</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#64748B', fontSize: '13px', opacity: 0.7 }}>
            © {new Date().getFullYear()} Verbaly. All rights reserved.
          </p>
          <p style={{ color: '#64748B', fontSize: '13px', opacity: 0.7 }}>
            Write like yourself. Every single time.
          </p>
        </div>
      </div>
    </footer>
  )
}
