'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Rewrite } from '@/lib/types'

function MatchBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#042A2B' : score >= 60 ? '#6B6960' : '#A09D95'
  const bg    = score >= 80 ? 'rgba(84,242,242,0.12)' : 'rgba(4,42,43,0.06)'
  const bdCol = score >= 80 ? 'rgba(84,242,242,0.3)' : 'rgba(4,42,43,0.12)'
  return (
    <span style={{
      backgroundColor: bg, border: `1px solid ${bdCol}`,
      color, padding: '4px 10px', borderRadius: '100px',
      fontSize: '13px', fontWeight: '700', whiteSpace: 'nowrap',
    }}>
      {score}%
    </span>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(84,242,242,0.1)" strokeWidth="4"/>
          <circle cx="24" cy="24" r="18" fill="none" stroke="#54F2F2" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="72 41"
            style={{ animation: 'spin 0.85s linear infinite', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <p style={{ color: '#A09D95', fontSize: '14px' }}>Your history is being loaded…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function HistoryPage() {
  const [rewrites,    setRewrites]    = useState<Rewrite[]>([])
  const [loading,     setLoading]     = useState(true)
  const [expandedId,  setExpandedId]  = useState<string | null>(null)
  const [copiedId,    setCopiedId]    = useState<string | null>(null)
  const [error,       setError]       = useState<string | null>(null)
  const [showHistoryTooltip, setShowHistoryTooltip] = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  const loadHistory = useCallback(async (uid: string) => {
    const { data, error: loadError } = await supabase
      .from('rewrites').select('*').eq('user_id', uid)
      .order('created_at', { ascending: false })
    if (loadError) {
      setError('Your rewrite history could not be loaded.')
      setRewrites([])
      setLoading(false)
      return
    }
    setError(null)
    setRewrites(data ?? [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      await loadHistory(user.id)

      const profileRes = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('user_id', user.id)
        .maybeSingle()

      const onboardingOk = profileRes.data?.onboarding_complete === true

      if (onboardingOk) {
        const key = 'vbTooltipSeen_history'
        const alreadySeen = typeof window !== 'undefined' ? window.localStorage.getItem(key) : '1'
        if (!alreadySeen) setShowHistoryTooltip(true)
      }
    }
    getUser()
  }, [loadHistory, router, supabase])

  const toggleExpand = (id: string) => setExpandedId(expandedId === id ? null : id)

  const handleCopy = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      setError('Copy failed. Please copy the text manually.')
    }
  }

  if (loading) return <LoadingState />

  if (error) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <div style={{
          backgroundColor: 'rgba(220,38,38,0.05)',
          border: '1px solid rgba(220,38,38,0.18)',
          borderRadius: '10px',
          padding: '11px 16px',
          color: '#DC2626',
          fontSize: '14px',
        }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '30px', fontWeight: '400', color: '#16150F', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Rewrite History
        </h1>
        <p style={{ color: '#A09D95', fontSize: '14px' }}>
          {rewrites.length} total rewrite{rewrites.length !== 1 ? 's' : ''}
        </p>

        {showHistoryTooltip && (
          <div style={{
            marginTop: '16px',
            backgroundColor: 'rgba(84,242,242,0.08)',
            border: '1px solid rgba(84,242,242,0.25)',
            borderRadius: '12px',
            padding: '12px 14px',
            color: '#042A2B',
            fontSize: '13px',
            lineHeight: 1.5,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>Your history</div>
              Every rewrite you made is saved here. The match score is shown next to it.
            </div>
            <button
              onClick={() => {
                window.localStorage.setItem('vbTooltipSeen_history', '1')
                setShowHistoryTooltip(false)
              }}
              style={{
                backgroundColor: '#042A2B',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '6px 12px',
                cursor: 'pointer',
                fontWeight: 700,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Got it
            </button>
          </div>
        )}
      </div>

      {rewrites.length === 0 ? (
        <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8ECF4', borderRadius: '12px', padding: '80px 24px', textAlign: 'center', boxShadow: '0 2px 12px rgba(26,110,255,0.08)' }}>
          <svg width="48" height="48" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto 16px', opacity: 0.2 }}>
            <circle cx="10" cy="10" r="8.5" stroke="#042A2B" strokeWidth="1.4"/>
            <circle cx="10" cy="10" r="5.5" stroke="#042A2B" strokeWidth="1.4"/>
            <circle cx="10" cy="10" r="2.5" stroke="#042A2B" strokeWidth="1.4"/>
          </svg>
          <p style={{ color: '#6B6960', fontSize: '16px', fontWeight: '500', marginBottom: '6px' }}>No rewrites yet</p>
          <p style={{ color: '#A09D95', fontSize: '14px' }}>Your rewrite history will appear here.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {rewrites.map((rw) => (
              <div
                key={rw.id}
                style={{
                  backgroundColor: '#FFFFFF', border: '1px solid #E8ECF4',
                  borderRadius: '12px', overflow: 'hidden',
                  cursor: 'pointer',
                  boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
                }}
                onClick={() => toggleExpand(rw.id)}
              >
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ color: '#A09D95', fontSize: '12px', marginBottom: '6px' }}>
                    {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p style={{
                    color: '#6B6960', fontSize: '13px', lineHeight: '1.55', marginBottom: '10px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {rw.original_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <MatchBadge score={rw.match_score} />
                    <span style={{ color: '#A09D95', fontSize: '12px' }}>Intensity {rw.intensity}/10</span>
                    <span style={{ marginLeft: 'auto', color: '#A09D95', fontSize: '12px' }}>
                      {expandedId === rw.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {expandedId === rw.id && (
                  <div style={{ borderTop: '1px solid #E5E2D8', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ backgroundColor: '#F9F8F5', border: '1px solid #E5E2D8', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ color: '#A09D95', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', fontWeight: '600' }}>
                        Original
                      </div>
                      <p style={{ color: '#6B6960', fontSize: '13px', lineHeight: '1.7' }}>{rw.original_text}</p>
                    </div>
                    <div style={{ backgroundColor: 'rgba(84,242,242,0.04)', border: '1px solid rgba(84,242,242,0.2)', borderRadius: '10px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ color: '#042A2B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                          Rewritten
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(rw.rewritten_text, rw.id) }}
                          style={{ background: 'transparent', border: 'none', color: '#54F2F2', fontSize: '12px', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif' }}>
                          {copiedId === rw.id ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p style={{ color: '#16150F', fontSize: '13px', lineHeight: '1.7' }}>{rw.rewritten_text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8ECF4', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,110,255,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E2D8' }}>
                  {['Date', 'Original text', 'Match', 'Words', 'Intensity', ''].map((col) => (
                    <th key={col} style={{
                      padding: '12px 20px', textAlign: 'left',
                      color: '#A09D95', fontSize: '11px', fontWeight: '600',
                      textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rewrites.map((rw) => (
                  <React.Fragment key={rw.id}>
                    <tr
                      style={{
                        borderBottom: expandedId === rw.id ? 'none' : '1px solid #F0EDE4',
                        cursor: 'pointer',
                        backgroundColor: expandedId === rw.id ? 'rgba(84,242,242,0.02)' : 'transparent',
                        transition: 'background-color 150ms',
                      }}
                      onClick={() => toggleExpand(rw.id)}
                    >
                      <td style={{ padding: '15px 20px', color: '#A09D95', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#6B6960', fontSize: '13px', maxWidth: '300px' }}>
                        {rw.original_text?.substring(0, 80)}{rw.original_text?.length > 80 ? '…' : ''}
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <MatchBadge score={rw.match_score} />
                      </td>
                      <td style={{ padding: '15px 20px', color: '#A09D95', fontSize: '13px' }}>
                        {rw.rewritten_text?.split(/\s+/).filter(Boolean).length ?? 0}
                      </td>
                      <td style={{ padding: '15px 20px', color: '#A09D95', fontSize: '13px' }}>
                        {rw.intensity}/10
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'center', color: '#A09D95', fontSize: '14px' }}>
                        {expandedId === rw.id ? '▲' : '▼'}
                      </td>
                    </tr>
                    {expandedId === rw.id && (
                      <tr key={`${rw.id}-expanded`} style={{ borderBottom: '1px solid #F0EDE4' }}>
                        <td colSpan={6} style={{ padding: '0 20px 20px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', paddingTop: '16px' }}>
                            <div style={{ backgroundColor: '#F9F8F5', border: '1px solid #E5E2D8', borderRadius: '10px', padding: '16px' }}>
                              <div style={{ color: '#A09D95', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px', fontWeight: '600' }}>
                                Original
                              </div>
                              <p style={{ color: '#6B6960', fontSize: '13px', lineHeight: '1.75' }}>{rw.original_text}</p>
                            </div>
                            <div style={{ backgroundColor: 'rgba(84,242,242,0.04)', border: '1px solid rgba(84,242,242,0.2)', borderRadius: '10px', padding: '16px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ color: '#042A2B', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: '600' }}>
                                  Rewritten
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopy(rw.rewritten_text, rw.id) }}
                                  style={{
                                    backgroundColor: copiedId === rw.id ? 'rgba(84,242,242,0.12)' : 'transparent',
                                    border: '1px solid rgba(84,242,242,0.25)', borderRadius: '6px',
                                    padding: '3px 10px', color: '#042A2B', fontSize: '12px',
                                    cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                                  }}
                                >
                                  {copiedId === rw.id ? '✓ Copied' : 'Copy'}
                                </button>
                              </div>
                              <p style={{ color: '#16150F', fontSize: '13px', lineHeight: '1.75' }}>{rw.rewritten_text}</p>
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
