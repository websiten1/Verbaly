import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch stats
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

  // Fetch recent rewrites
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
    <div className="p-4 md:p-8 lg:p-12" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-xl md:text-3xl" style={{ color: '#0F172A', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ color: '#64748B', fontSize: '14px' }}>{user.email}</p>
        </div>
        <Link
          href="/rewrite"
          className="w-full sm:w-auto text-center"
          style={{
            backgroundColor: '#1E3A5F',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '700',
            display: 'inline-block',
          }}
        >
          + New Rewrite
        </Link>
      </div>

      {/* Stats cards — 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              padding: '24px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
              <span style={{ color: '#64748B', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{stat.label}</span>
              <span style={{
                backgroundColor: 'rgba(30,58,95,0.08)',
                color: '#1E3A5F',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
              }}>{stat.icon}</span>
            </div>
            <div style={{ color: '#1E3A5F', fontSize: '32px', fontWeight: '700', letterSpacing: '-1px' }}>
              {stat.value}{stat.suffix}
            </div>
          </div>
        ))}
      </div>

      {/* Recent rewrites */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600' }}>Recent Rewrites</h2>
          <Link href="/history" style={{ color: '#1E3A5F', textDecoration: 'none', fontSize: '13px' }}>
            View all →
          </Link>
        </div>

        {(!recentRewrites || recentRewrites.length === 0) ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px', color: '#E2E8F0' }}>✦</div>
            <p style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>
              No rewrites yet. Start by rewriting your first text.
            </p>
            <Link
              href="/rewrite"
              style={{
                backgroundColor: '#1E3A5F',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: '8px',
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
            <div className="block md:hidden divide-y divide-[#E2E8F0]">
              {recentRewrites.map((rewrite) => (
                <div key={rewrite.id} style={{ padding: '16px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ color: '#64748B', fontSize: '12px', marginBottom: '6px' }}>
                    {new Date(rewrite.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p style={{ color: '#0F172A', fontSize: '13px', lineHeight: '1.5', marginBottom: '10px', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const }}>
                    {rewrite.original_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      padding: '3px 8px',
                      borderRadius: '100px',
                      fontSize: '12px',
                      fontWeight: '600',
                    }}>
                      {rewrite.match_score}%
                    </span>
                    <span style={{ color: '#64748B', fontSize: '12px' }}>Intensity {rewrite.intensity}/10</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table view */}
            <div className="hidden md:block">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                    {['Date', 'Original Text', 'Match Score', 'Intensity'].map((col) => (
                      <th key={col} style={{
                        padding: '12px 24px',
                        textAlign: 'left',
                        color: '#64748B',
                        fontSize: '12px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentRewrites.map((rewrite) => (
                    <tr key={rewrite.id} style={{ borderBottom: '1px solid rgba(226,232,240,0.7)', backgroundColor: '#FFFFFF' }}>
                      <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(rewrite.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 24px', color: '#0F172A', fontSize: '13px', maxWidth: '300px' }}>
                        <span>
                          {rewrite.original_text?.substring(0, 80)}
                          {rewrite.original_text?.length > 80 ? '...' : ''}
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px' }}>
                        <span style={{
                          backgroundColor: '#10B981',
                          color: '#FFFFFF',
                          padding: '4px 10px',
                          borderRadius: '100px',
                          fontSize: '13px',
                          fontWeight: '600',
                        }}>
                          {rewrite.match_score}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 24px', color: '#64748B', fontSize: '13px' }}>
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
  )
}
