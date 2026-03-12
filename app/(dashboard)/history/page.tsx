'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Rewrite } from '@/lib/types'

export default function HistoryPage() {
  const [rewrites, setRewrites] = useState<Rewrite[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const loadHistory = useCallback(async (uid: string) => {
    const { data } = await supabase
      .from('rewrites')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false })

    setRewrites(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      await loadHistory(user.id)
    }
    getUser()
  }, [loadHistory, router, supabase])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  const card: React.CSSProperties = {
    backgroundColor: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '20px',
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '2px solid rgba(84,242,242,0.15)',
            borderTop: '2px solid #54F2F2',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '14px' }}>Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 lg:p-12" style={{ minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#FCFCFC', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px', fontFamily: 'Instrument Serif, serif' }}>
          Rewrite History
        </h1>
        <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '14px' }}>
          {rewrites.length} total rewrite{rewrites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {rewrites.length === 0 ? (
        <div style={{ ...card, padding: '64px 24px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', color: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}>◷</div>
          <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '15px' }}>No rewrites yet.</p>
          <p style={{ color: 'rgba(252,252,252,0.25)', fontSize: '14px', marginTop: '8px' }}>
            Your rewrite history will appear here.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile cards view */}
          <div className="block md:hidden space-y-3">
            {rewrites.map((rewrite) => (
              <div
                key={rewrite.id}
                style={{ ...card, padding: '16px', cursor: 'pointer' }}
                onClick={() => toggleExpand(rewrite.id)}
              >
                <div style={{ color: 'rgba(252,252,252,0.35)', fontSize: '12px', marginBottom: '8px' }}>
                  {new Date(rewrite.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <p style={{
                  color: 'rgba(252,252,252,0.8)',
                  fontSize: '13px',
                  lineHeight: '1.5',
                  marginBottom: '10px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                }}>
                  {rewrite.original_text}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ backgroundColor: '#54F2F2', color: '#042A2B', padding: '3px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                    {rewrite.match_score}%
                  </span>
                  <span style={{ color: 'rgba(252,252,252,0.35)', fontSize: '12px' }}>
                    {rewrite.rewritten_text?.split(/\s+/).filter(Boolean).length ?? 0} words
                  </span>
                  <span style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'rgba(252,252,252,0.6)', padding: '3px 8px', borderRadius: '100px', fontSize: '12px', fontWeight: '500' }}>
                    Intensity {rewrite.intensity}/10
                  </span>
                  <span style={{ marginLeft: 'auto', color: 'rgba(252,252,252,0.3)', fontSize: '14px' }}>
                    {expandedId === rewrite.id ? '▲' : '▼'}
                  </span>
                </div>
                {expandedId === rewrite.id && (
                  <div className="grid grid-cols-1 gap-3 mt-4">
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ color: 'rgba(252,252,252,0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                        Original
                      </div>
                      <p style={{ color: 'rgba(252,252,252,0.7)', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                        {rewrite.original_text}
                      </p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(84,242,242,0.03)', border: '1px solid rgba(84,242,242,0.15)', borderRadius: '12px', padding: '16px' }}>
                      <div style={{ color: '#54F2F2', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', opacity: 0.7 }}>
                        Rewritten
                      </div>
                      <p style={{ color: '#FCFCFC', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                        {rewrite.rewritten_text}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table view */}
          <div className="hidden md:block" style={{ ...card, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Date', 'Original (preview)', 'Match Score', 'Words', 'Intensity', ''].map((col) => (
                    <th
                      key={col}
                      style={{
                        padding: '13px 20px',
                        textAlign: 'left',
                        color: 'rgba(252,252,252,0.35)',
                        fontSize: '11px',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.08em',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rewrites.map((rewrite) => (
                  <React.Fragment key={rewrite.id}>
                    <tr
                      style={{
                        borderBottom: expandedId === rewrite.id ? 'none' : '1px solid rgba(255,255,255,0.04)',
                        cursor: 'pointer',
                      }}
                      onClick={() => toggleExpand(rewrite.id)}
                    >
                      <td style={{ padding: '16px 20px', color: 'rgba(252,252,252,0.35)', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(rewrite.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'rgba(252,252,252,0.8)', fontSize: '13px', maxWidth: '300px' }}>
                        {rewrite.original_text?.substring(0, 80)}{rewrite.original_text?.length > 80 ? '...' : ''}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ backgroundColor: '#54F2F2', color: '#042A2B', padding: '4px 10px', borderRadius: '100px', fontSize: '13px', fontWeight: '600' }}>
                          {rewrite.match_score}%
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: 'rgba(252,252,252,0.45)', fontSize: '13px' }}>
                        {rewrite.rewritten_text?.split(/\s+/).filter(Boolean).length ?? 0}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'rgba(252,252,252,0.45)', fontSize: '13px' }}>
                        {rewrite.intensity}/10
                      </td>
                      <td style={{ padding: '16px 20px', color: 'rgba(252,252,252,0.25)', fontSize: '18px', textAlign: 'center' }}>
                        {expandedId === rewrite.id ? '▲' : '▼'}
                      </td>
                    </tr>
                    {expandedId === rewrite.id && (
                      <tr key={`${rewrite.id}-expanded`} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <td colSpan={6} style={{ padding: '0 20px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px' }}>
                            <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '16px' }}>
                              <div style={{ color: 'rgba(252,252,252,0.35)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                                Original
                              </div>
                              <p style={{ color: 'rgba(252,252,252,0.7)', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                                {rewrite.original_text}
                              </p>
                            </div>
                            <div style={{ backgroundColor: 'rgba(84,242,242,0.03)', border: '1px solid rgba(84,242,242,0.15)', borderRadius: '12px', padding: '16px' }}>
                              <div style={{ color: '#54F2F2', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', opacity: 0.7 }}>
                                Rewritten
                              </div>
                              <p style={{ color: '#FCFCFC', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
                                {rewrite.rewritten_text}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
