import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const JET = "'JetBrains Mono', 'Courier New', monospace"
const CPR = "'Courier Prime', 'Courier New', monospace"

const CARD: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E0E0E0',
  borderRadius: '2px',
  padding: '20px 22px',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [rewritesResult, samplesResult] = await Promise.all([
    supabase.from('rewrites').select('match_score').eq('user_id', user.id),
    supabase.from('writing_samples').select('word_count').eq('user_id', user.id),
  ])

  const rewrites  = rewritesResult.data  ?? []
  const samples   = samplesResult.data   ?? []
  const totalRewrites  = rewrites.length
  const avgMatchScore  = rewrites.length > 0
    ? Math.round(rewrites.reduce((s, r) => s + (r.match_score ?? 0), 0) / rewrites.length) : 0
  const writingSamples = samples.length

  const totalWords = samples.reduce((sum, s) => sum + (s.word_count ?? 0), 0)
  const styleStrength = Math.min(100, Math.round((totalWords / 3000) * 100))

  const { data: recentRewrites } = await supabase
    .from('rewrites').select('*').eq('user_id', user.id)
    .order('created_at', { ascending: false }).limit(5)

  const firstNameOrEmail = user.email?.split('@')[0] ?? 'there'

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: '40px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 style={{
            fontFamily: CPR,
            fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '700',
            color: '#0E0E0E', letterSpacing: '-0.02em',
            marginBottom: '4px', textTransform: 'uppercase',
          }}>
            Welcome back, {firstNameOrEmail}
          </h1>
          <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            {user.email}
          </p>
        </div>
        <Link
          href="/rewrite"
          style={{
            fontFamily: JET,
            backgroundColor: '#0E0E0E',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '2px',
            textDecoration: 'none',
            fontSize: '11px', fontWeight: '500',
            textTransform: 'uppercase', letterSpacing: '.12em',
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            transition: 'background 150ms',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          New rewrite
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        {[
          {
            label: 'Total Rewrites',
            value: totalRewrites,
            suffix: '',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B1FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>
              </svg>
            ),
          },
          {
            label: 'Avg Match Score',
            value: avgMatchScore,
            suffix: '%',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B1FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            ),
          },
          {
            label: 'Writing Samples',
            value: writingSamples,
            suffix: '',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B1FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
              </svg>
            ),
          },
          {
            label: 'Style Strength',
            value: styleStrength,
            suffix: '%',
            icon: (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B1FFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            ),
          },
        ].map((stat) => (
          <div key={stat.label} style={CARD}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span style={{
                fontFamily: JET,
                color: '#888880', fontSize: '10px',
                textTransform: 'uppercase', letterSpacing: '.15em',
              }}>
                {stat.label}
              </span>
              {stat.icon}
            </div>
            <div style={{ fontFamily: CPR, fontSize: '32px', fontWeight: '700', color: '#0E0E0E', letterSpacing: '-1.5px', lineHeight: 1 }}>
              {stat.value}{stat.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
        {[
          { href: '/rewrite',  label: 'Rewrite text',     desc: 'Paste AI text — your voice is put back in.',             sym: '↺' },
          { href: '/generate', label: 'Generate content', desc: 'New text is written from scratch, in your style.',        sym: '✦' },
          { href: '/profile',  label: 'Style profile',    desc: 'Your writing is uploaded — your profile is built from it.', sym: '◈' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            style={{
              ...CARD,
              textDecoration: 'none',
              display: 'flex', alignItems: 'flex-start', gap: '14px',
              transition: 'border-color 150ms',
            }}
          >
            <div style={{
              width: '32px', height: '32px', flexShrink: 0,
              border: '1px solid #E0E0E0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: JET, fontSize: '16px', color: '#6B1FFF',
            }}>
              {action.sym}
            </div>
            <div>
              <div style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '4px' }}>
                {action.label}
              </div>
              <div style={{ fontFamily: JET, color: '#888880', fontSize: '11px', lineHeight: 1.5 }}>
                {action.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent rewrites ── */}
      <div style={{ ...CARD, padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #E0E0E0',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.15em' }}>
            Recent rewrites
          </h2>
          <Link href="/history" style={{ fontFamily: JET, color: '#6B1FFF', textDecoration: 'none', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
            View all →
          </Link>
        </div>

        {(!recentRewrites || recentRewrites.length === 0) ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '16px' }}>
              No rewrites yet
            </p>
            <Link
              href="/rewrite"
              style={{
                fontFamily: JET,
                backgroundColor: '#0E0E0E', color: '#FFFFFF',
                padding: '10px 20px', borderRadius: '2px',
                textDecoration: 'none', fontSize: '11px',
                textTransform: 'uppercase', letterSpacing: '.12em',
              }}
            >
              Start your first rewrite
            </Link>
          </div>
        ) : (
          <>
            {/* Mobile cards */}
            <div className="block md:hidden">
              {recentRewrites.map((rw) => (
                <div key={rw.id} style={{ padding: '14px 20px', borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>
                    {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p style={{
                    fontFamily: JET, color: '#888880', fontSize: '11px', lineHeight: '1.5', marginBottom: '10px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {rw.original_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontFamily: JET, fontSize: '10px', fontWeight: '500',
                      textTransform: 'uppercase', letterSpacing: '.15em',
                      color: '#6B1FFF', border: '1px solid #6B1FFF',
                      borderRadius: '2px', padding: '2px 6px',
                    }}>
                      {rw.match_score}%
                    </span>
                    <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      {rw.intensity}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #0E0E0E' }}>
                    {['Date', 'Original text', 'Match', 'Intensity'].map((col) => (
                      <th key={col} style={{
                        padding: '10px 20px',
                        textAlign: 'left',
                        fontFamily: JET,
                        color: '#888880', fontSize: '10px',
                        textTransform: 'uppercase', letterSpacing: '.15em',
                        fontWeight: '400',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRewrites.map((rw) => (
                    <tr key={rw.id} style={{ borderBottom: '1px solid #F0F0F0' }}>
                      <td style={{ padding: '13px 20px', fontFamily: JET, color: '#888880', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '13px 20px', fontFamily: JET, color: '#888880', fontSize: '11px', maxWidth: '320px' }}>
                        {rw.original_text?.substring(0, 90)}{rw.original_text?.length > 90 ? '…' : ''}
                      </td>
                      <td style={{ padding: '13px 20px' }}>
                        <span style={{
                          fontFamily: JET, fontSize: '10px', fontWeight: '500',
                          textTransform: 'uppercase', letterSpacing: '.15em',
                          color: '#6B1FFF', border: '1px solid #6B1FFF',
                          borderRadius: '2px', padding: '2px 6px',
                        }}>
                          {rw.match_score}%
                        </span>
                      </td>
                      <td style={{ padding: '13px 20px', fontFamily: JET, color: '#888880', fontSize: '11px' }}>
                        {rw.intensity}/10
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
