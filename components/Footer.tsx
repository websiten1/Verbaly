export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#0E0E0E', borderTop: '1px solid #222222' }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '40px 32px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          <span style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '16px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '-0.02em',
            color: '#FFFFFF',
          }}>
            VERBALY
          </span>

          <span style={{
            fontFamily: 'var(--font-jet)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.15em',
            color: '#444444',
          }}>
            YOUR WRITING VOICE, PRESERVED.
          </span>

          <span style={{
            fontFamily: 'var(--font-jet)',
            fontSize: '10px',
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            color: '#444444',
          }}>
            © 2026 VERBALY. ALL RIGHTS RESERVED.
          </span>
        </div>
      </div>
    </footer>
  )
}
