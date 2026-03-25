import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

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

      {/* ── Header ──────────────────────────────────────────── */}
      <div style={{ marginBottom: '48px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
        <div>
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: '30px', fontWeight: '400',
            color: '#16150F', letterSpacing: '-0.5px',
            marginBottom: '4px',
          }}>
            Welcome back, <em style={{ fontStyle: 'italic' }}>{firstNameOrEmail}</em>
          </h1>
          <p style={{ color: '#A09D95', fontSize: '14px' }}>{user.email}</p>
        </div>
        <Link
          href="/rewrite"
          style={{
            backgroundColor: '#042A2B',
            color: '#FFFFFF',
            padding: '11px 22px',
            borderRadius: '9px',
            textDecoration: 'none',
            fontSize: '14px', fontWeight: '600',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Start a rewrite
        </Link>
      </div>

      {/* ── Stats ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
        {[
          {
            label: 'Total Rewrites',
            value: totalRewrites,
            suffix: '',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
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
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
            ),
          },
          {
            label: 'Writing Samples',
            value: writingSamples,
            suffix: '',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
              </svg>
            ),
          },
          {
            label: 'Style Strength',
            value: styleStrength,
            suffix: '%',
            icon: (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
              </svg>
            ),
          },
        ].map((stat) => (
          <div key={stat.label} style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E8ECF4',
            borderRadius: '12px',
            padding: '20px 22px',
            boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <span style={{ color: '#A09D95', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                {stat.label}
              </span>
              <div style={{
                width: '32px', height: '32px',
                backgroundColor: 'rgba(84,242,242,0.1)',
                border: '1px solid rgba(84,242,242,0.2)',
                borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {stat.icon}
              </div>
            </div>
            <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '32px', fontWeight: '700', color: '#16150F', letterSpacing: '-1.5px', lineHeight: 1 }}>
              {stat.value}{stat.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick actions ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {[
          { href: '/rewrite',  label: 'Rewrite text',    desc: 'Paste AI text — your voice is put back in.', emoji: '↺' },
          { href: '/generate', label: 'Generate content', desc: 'New text is written from scratch, in your style.', emoji: '✦' },
          { href: '/profile',  label: 'My style profile', desc: 'Your writing is uploaded — your profile is built from it.', emoji: '◈' },
        ].map((action) => (
          <Link
            key={action.href}
            href={action.href}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E8ECF4',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
              textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: '14px',
              transition: 'border-color 150ms, box-shadow 150ms',
            }}
          >
            <div style={{
              width: '40px', height: '40px',
              backgroundColor: 'rgba(84,242,242,0.08)',
              border: '1px solid rgba(84,242,242,0.18)',
              borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px', color: '#042A2B', flexShrink: 0,
            }}>
              {action.emoji}
            </div>
            <div>
              <div style={{ color: '#16150F', fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>
                {action.label}
              </div>
              <div style={{ color: '#A09D95', fontSize: '12px' }}>
                {action.desc}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent rewrites ───────────────────────────────────── */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E8ECF4',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
      }}>
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid #E5E2D8',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600' }}>Recent rewrites</h2>
          <Link href="/history" style={{ color: '#54F2F2', textDecoration: 'none', fontSize: '13px', fontWeight: '500' }}>
            View all →
          </Link>
        </div>

        {(!recentRewrites || recentRewrites.length === 0) ? (
          <div style={{ padding: '60px 24px', textAlign: 'center' }}>
            <div style={{
              width: '52px', height: '52px',
              backgroundColor: 'rgba(84,242,242,0.08)',
              border: '1px solid rgba(84,242,242,0.18)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px', fontSize: '22px', color: '#54F2F2',
            }}>↺</div>
            <p style={{ color: '#6B6960', fontSize: '15px', marginBottom: '6px', fontWeight: '500' }}>
              No rewrites yet
            </p>
            <p style={{ color: '#A09D95', fontSize: '13px', marginBottom: '20px' }}>
              Paste any AI text here. It gets rewritten in your voice.
            </p>
            <Link
              href="/rewrite"
              style={{
                backgroundColor: '#042A2B', color: '#FFFFFF',
                padding: '10px 24px', borderRadius: '8px',
                textDecoration: 'none', fontSize: '14px', fontWeight: '600',
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
                <div key={rw.id} style={{ padding: '16px 24px', borderBottom: '1px solid #F0EDE4' }}>
                  <div style={{ color: '#A09D95', fontSize: '12px', marginBottom: '6px' }}>
                    {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p style={{
                    color: '#6B6960', fontSize: '13px', lineHeight: '1.5', marginBottom: '10px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {rw.original_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: 'rgba(84,242,242,0.1)',
                      color: '#042A2B', padding: '3px 9px', borderRadius: '100px',
                      fontSize: '12px', fontWeight: '700',
                      border: '1px solid rgba(84,242,242,0.25)',
                    }}>
                      {rw.match_score}%
                    </span>
                    <span style={{ color: '#A09D95', fontSize: '12px' }}>
                      Intensity {rw.intensity}/10
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E5E2D8' }}>
                    {['Date', 'Original text', 'Match', 'Intensity'].map((col) => (
                      <th key={col} style={{
                        padding: '11px 24px',
                        textAlign: 'left',
                        color: '#A09D95', fontSize: '11px', fontWeight: '600',
                        textTransform: 'uppercase', letterSpacing: '0.08em',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRewrites.map((rw) => (
                    <tr key={rw.id} style={{ borderBottom: '1px solid #F0EDE4' }}>
                      <td style={{ padding: '14px 24px', color: '#A09D95', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '14px 24px', color: '#6B6960', fontSize: '13px', maxWidth: '320px' }}>
                        {rw.original_text?.substring(0, 90)}{rw.original_text?.length > 90 ? '…' : ''}
                      </td>
                      <td style={{ padding: '14px 24px' }}>
                        <span style={{
                          backgroundColor: 'rgba(84,242,242,0.1)',
                          color: '#042A2B', padding: '4px 10px', borderRadius: '100px',
                          fontSize: '13px', fontWeight: '700',
                          border: '1px solid rgba(84,242,242,0.25)',
                        }}>
                          {rw.match_score}%
                        </span>
                      </td>
                      <td style={{ padding: '14px 24px', color: '#A09D95', fontSize: '13px' }}>
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
