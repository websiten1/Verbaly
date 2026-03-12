import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const card: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [rewritesResult, samplesResult, traitsResult] = await Promise.all([
    supabase.from('rewrites').select('match_score').eq('user_id', user.id),
    supabase.from('writing_samples').select('id').eq('user_id', user.id),
    supabase.from('style_traits').select('score').eq('user_id', user.id),
  ])

  const rewrites = rewritesResult.data ?? []
  const samples = samplesResult.data ?? []
  const traits = traitsResult.data ?? []

  const totalRewrites = rewrites.length
  const avgMatchScore = rewrites.length > 0
    ? Math.round(rewrites.reduce((sum, r) => sum + (r.match_score ?? 0), 0) / rewrites.length)
    : 0
  const writingSamples = samples.length
  const styleStrength = traits.length > 0
    ? Math.round(traits.reduce((sum, t) => sum + (t.score ?? 0), 0) / traits.length)
    : 0

  const { data: recentRewrites } = await supabase
    .from('rewrites')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    { label: 'Total Rewrites', value: totalRewrites, icon: '✦', suffix: '' },
    { label: 'Avg Match Score', value: avgMatchScore, icon: '◈', suffix: '%' },
    { label: 'Writing Samples', value: writingSamples, icon: '↑', suffix: '' },
    { label: 'Style Strength', value: styleStrength, icon: '▦', suffix: '%' },
  ]

  return (
    <div className="p-4 md:p-8 lg:p-12" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Radial glow */}
      <div style={{
        position: 'fixed',
        top: 0,
        right: 0,
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(84,242,242,0.07) 0%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div>
            <h1 className="text-xl md:text-3xl" style={{ color: '#FCFCFC', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px', fontFamily: 'Instrument Serif, serif' }}>
              Welcome back
            </h1>
            <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '14px' }}>{user.email}</p>
          </div>
          <Link
            href="/rewrite"
            className="w-full sm:w-auto text-center"
            style={{
              backgroundColor: '#54F2F2',
              color: '#042A2B',
              padding: '11px 24px',
              borderRadius: '100px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '600',
              display: 'inline-block',
              transition: 'all 150ms ease',
            }}
          >
            + New Rewrite
          </Link>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div key={stat.label} style={card}>
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <span style={{ color: 'rgba(252,252,252,0.45)', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</span>
                  <span style={{
                    backgroundColor: 'rgba(84,242,242,0.08)',
                    color: '#54F2F2',
                    width: '32px',
                    height: '32px',
                    borderRadius: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '14px',
                  }}>{stat.icon}</span>
                </div>
                <div style={{ color: '#FCFCFC', fontSize: '32px', fontWeight: '700', letterSpacing: '-1px', fontFamily: 'DM Sans, sans-serif' }}>
                  {stat.value}{stat.suffix}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent rewrites */}
        <div style={card}>
          <div style={{
            padding: '20px 24px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <h2 style={{ color: '#FCFCFC', fontSize: '16px', fontWeight: '600' }}>Recent Rewrites</h2>
            <Link href="/history" style={{ color: '#54F2F2', textDecoration: 'none', fontSize: '13px' }}>
              View all →
            </Link>
          </div>

          {(!recentRewrites || recentRewrites.length === 0) ? (
            <div style={{ padding: '48px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '16px', color: 'rgba(255,255,255,0.1)' }}>✦</div>
              <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '14px', marginBottom: '20px' }}>
                No rewrites yet. Start by rewriting your first text.
              </p>
              <Link
                href="/rewrite"
                style={{
                  backgroundColor: '#54F2F2',
                  color: '#042A2B',
                  padding: '10px 24px',
                  borderRadius: '100px',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: '600',
                }}
              >
                Create your first rewrite
              </Link>
            </div>
          ) : (
            <>
              {/* Mobile cards view */}
              <div className="block md:hidden">
                {recentRewrites.map((rewrite) => (
                  <div key={rewrite.id} style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ color: 'rgba(252,252,252,0.35)', fontSize: '12px', marginBottom: '6px' }}>
                      {new Date(rewrite.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </div>
                    <p style={{ color: 'rgba(252,252,252,0.8)', fontSize: '13px', lineHeight: '1.5', marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                      {rewrite.original_text}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ backgroundColor: '#54F2F2', color: '#042A2B', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                        {rewrite.match_score}%
                      </span>
                      <span style={{ color: 'rgba(252,252,252,0.35)', fontSize: '12px' }}>Intensity {rewrite.intensity}/10</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop table view */}
              <div className="hidden md:block">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      {['Date', 'Original Text', 'Match Score', 'Intensity'].map((col) => (
                        <th key={col} style={{
                          padding: '12px 24px',
                          textAlign: 'left',
                          color: 'rgba(252,252,252,0.35)',
                          fontSize: '11px',
                          fontWeight: '500',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                        }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recentRewrites.map((rewrite) => (
                      <tr key={rewrite.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td style={{ padding: '16px 24px', color: 'rgba(252,252,252,0.35)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {new Date(rewrite.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '16px 24px', color: 'rgba(252,252,252,0.8)', fontSize: '13px', maxWidth: '300px' }}>
                          {rewrite.original_text?.substring(0, 80)}{rewrite.original_text?.length > 80 ? '...' : ''}
                        </td>
                        <td style={{ padding: '16px 24px' }}>
                          <span style={{ backgroundColor: '#54F2F2', color: '#042A2B', padding: '4px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '600' }}>
                            {rewrite.match_score}%
                          </span>
                        </td>
                        <td style={{ padding: '16px 24px', color: 'rgba(252,252,252,0.45)', fontSize: '13px' }}>
                          {rewrite.intensity}/10
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
    </div>
  )
}
