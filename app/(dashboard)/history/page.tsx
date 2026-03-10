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

  if (loading) {
    return (
      <div style={{ padding: '40px 48px', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', backgroundColor: '#F8FAFC' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '3px solid rgba(30,58,95,0.2)',
            borderTop: '3px solid #1E3A5F',
            borderRadius: '50%',
            margin: '0 auto 16px',
            animation: 'spin 1s linear infinite',
          }}></div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          <p style={{ color: '#64748B', fontSize: '14px' }}>Loading history...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Rewrite History
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          {rewrites.length} total rewrite{rewrites.length !== 1 ? 's' : ''}
        </p>
      </div>

      {rewrites.length === 0 ? (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          padding: '64px 24px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ fontSize: '40px', color: '#E2E8F0', marginBottom: '16px' }}>◷</div>
          <p style={{ color: '#64748B', fontSize: '15px' }}>No rewrites yet.</p>
          <p style={{ color: '#64748B', fontSize: '14px', marginTop: '8px', opacity: 0.7 }}>
            Your rewrite history will appear here.
          </p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                {['Date', 'Original (preview)', 'Match Score', 'Words', 'Intensity', ''].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: '13px 20px',
                      textAlign: 'left',
                      color: '#64748B',
                      fontSize: '12px',
                      fontWeight: '500',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
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
                      borderBottom: expandedId === rewrite.id ? 'none' : '1px solid rgba(226,232,240,0.7)',
                      cursor: 'pointer',
                      backgroundColor: '#FFFFFF',
                    }}
                    onClick={() => toggleExpand(rewrite.id)}
                  >
                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '13px', whiteSpace: 'nowrap' }}>
                      {new Date(rewrite.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#0F172A', fontSize: '13px', maxWidth: '300px' }}>
                      {rewrite.original_text?.substring(0, 80)}
                      {rewrite.original_text?.length > 80 ? '...' : ''}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
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
                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '13px' }}>
                      {rewrite.rewritten_text?.split(/\s+/).filter(Boolean).length ?? 0}
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '13px' }}>
                      {rewrite.intensity}/10
                    </td>
                    <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '18px', textAlign: 'center', opacity: 0.5 }}>
                      {expandedId === rewrite.id ? '▲' : '▼'}
                    </td>
                  </tr>
                  {expandedId === rewrite.id && (
                    <tr key={`${rewrite.id}-expanded`} style={{ borderBottom: '1px solid rgba(226,232,240,0.7)' }}>
                      <td colSpan={6} style={{ padding: '0 20px 20px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px' }}>
                          <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid #E2E8F0',
                            borderRadius: '10px',
                            padding: '16px',
                          }}>
                            <div style={{ color: '#64748B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                              Original
                            </div>
                            <p style={{ color: '#0F172A', fontSize: '13px', lineHeight: '1.7', margin: 0, opacity: 0.85 }}>
                              {rewrite.original_text}
                            </p>
                          </div>
                          <div style={{
                            backgroundColor: '#F8FAFC',
                            border: '1px solid rgba(30,58,95,0.25)',
                            borderRadius: '10px',
                            padding: '16px',
                          }}>
                            <div style={{ color: '#1E3A5F', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
                              Rewritten
                            </div>
                            <p style={{ color: '#0F172A', fontSize: '13px', lineHeight: '1.7', margin: 0 }}>
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
      )}
    </div>
  )
}
