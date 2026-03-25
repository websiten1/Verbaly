'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Rewrite } from '@/lib/types'

const JET = "'JetBrains Mono', 'Courier New', monospace"
const CPR = "'Courier Prime', 'Courier New', monospace"

const CARD: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E0E0E0',
  borderRadius: '2px',
}

function MatchBadge({ score }: { score: number }) {
  const color = score >= 80 ? '#6B1FFF' : '#888880'
  return (
    <span style={{
      fontFamily: JET, fontSize: '10px', fontWeight: '500',
      textTransform: 'uppercase', letterSpacing: '.15em',
      color, border: `1px solid ${color}`,
      borderRadius: '2px', padding: '2px 6px', whiteSpace: 'nowrap',
    }}>
      {score}%
    </span>
  )
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px' }}>
      <div style={{ position: 'relative', width: '40px', height: '40px' }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="15" fill="none" stroke="#E0E0E0" strokeWidth="3"/>
          <circle cx="20" cy="20" r="15" fill="none" stroke="#6B1FFF" strokeWidth="3"
            strokeLinecap="round" strokeDasharray="60 35"
            style={{ animation: 'spin 0.85s linear infinite', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
        Loading history…
      </p>
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
        <div style={{ border: '1px solid #DC2626', borderRadius: '2px', padding: '11px 16px', fontFamily: JET, color: '#DC2626', fontSize: '11px' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: CPR, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '700', color: '#0E0E0E', letterSpacing: '-0.02em', marginBottom: '4px', textTransform: 'uppercase' }}>
          Rewrite History
        </h1>
        <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          {rewrites.length} total rewrite{rewrites.length !== 1 ? 's' : ''}
        </p>

        {showHistoryTooltip && (
          <div style={{
            marginTop: '16px',
            border: '1px solid #6B1FFF', borderRadius: '2px',
            padding: '12px 14px', fontFamily: JET, color: '#0E0E0E',
            fontSize: '11px', lineHeight: 1.5,
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'flex-start', gap: '12px',
          }}>
            <div>
              <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em', fontSize: '10px' }}>Your history</div>
              Every rewrite you made is saved here. The match score is shown next to it.
            </div>
            <button
              onClick={() => {
                window.localStorage.setItem('vbTooltipSeen_history', '1')
                setShowHistoryTooltip(false)
              }}
              style={{
                backgroundColor: '#0E0E0E', color: '#FFFFFF', border: 'none',
                borderRadius: '2px', padding: '6px 12px', cursor: 'pointer',
                fontFamily: JET, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em',
              }}
            >
              Got it
            </button>
          </div>
        )}
      </div>

      {rewrites.length === 0 ? (
        <div style={{ ...CARD, padding: '80px 24px', textAlign: 'center' }}>
          <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>No rewrites yet</p>
          <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px' }}>Your rewrite history will appear here.</p>
        </div>
      ) : (
        <>
          {/* Mobile cards */}
          <div className="block md:hidden" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {rewrites.map((rw) => (
              <div
                key={rw.id}
                style={{ ...CARD, overflow: 'hidden', cursor: 'pointer' }}
                onClick={() => toggleExpand(rw.id)}
              >
                <div style={{ padding: '14px 16px' }}>
                  <div style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>
                    {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </div>
                  <p style={{
                    fontFamily: JET, color: '#888880', fontSize: '11px', lineHeight: '1.55', marginBottom: '10px',
                    overflow: 'hidden', display: '-webkit-box',
                    WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as const,
                  }}>
                    {rw.original_text}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <MatchBadge score={rw.match_score} />
                    <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      Intensity {rw.intensity}/10
                    </span>
                    <span style={{ marginLeft: 'auto', fontFamily: JET, color: '#888880', fontSize: '11px' }}>
                      {expandedId === rw.id ? '▲' : '▼'}
                    </span>
                  </div>
                </div>

                {expandedId === rw.id && (
                  <div style={{ borderTop: '1px solid #E0E0E0', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ border: '1px solid #E0E0E0', borderRadius: '2px', padding: '12px' }}>
                      <div style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '8px' }}>
                        Original
                      </div>
                      <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', lineHeight: '1.7' }}>{rw.original_text}</p>
                    </div>
                    <div style={{ border: '1px solid #E0E0E0', borderRadius: '2px', padding: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ fontFamily: JET, color: '#6B1FFF', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                          Rewritten
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); handleCopy(rw.rewritten_text, rw.id) }}
                          style={{ background: 'transparent', border: 'none', fontFamily: JET, color: copiedId === rw.id ? '#6B1FFF' : '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', cursor: 'pointer' }}>
                          {copiedId === rw.id ? '✓ Copied' : 'Copy'}
                        </button>
                      </div>
                      <p style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', lineHeight: '1.7' }}>{rw.rewritten_text}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Desktop table */}
          <div className="hidden md:block" style={{ ...CARD, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #0E0E0E' }}>
                  {['Date', 'Original text', 'Match', 'Words', 'Intensity', ''].map((col) => (
                    <th key={col} style={{
                      padding: '11px 18px', textAlign: 'left',
                      fontFamily: JET, color: '#888880', fontSize: '10px',
                      textTransform: 'uppercase', letterSpacing: '.15em',
                      fontWeight: '400', whiteSpace: 'nowrap',
                    }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rewrites.map((rw) => (
                  <React.Fragment key={rw.id}>
                    <tr
                      style={{
                        borderBottom: expandedId === rw.id ? 'none' : '1px solid #F0F0F0',
                        cursor: 'pointer',
                        backgroundColor: 'transparent',
                      }}
                      onClick={() => toggleExpand(rw.id)}
                    >
                      <td style={{ padding: '13px 18px', fontFamily: JET, color: '#888880', fontSize: '11px', whiteSpace: 'nowrap' }}>
                        {new Date(rw.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ padding: '13px 18px', fontFamily: JET, color: '#888880', fontSize: '11px', maxWidth: '300px' }}>
                        {rw.original_text?.substring(0, 80)}{rw.original_text?.length > 80 ? '…' : ''}
                      </td>
                      <td style={{ padding: '13px 18px' }}>
                        <MatchBadge score={rw.match_score} />
                      </td>
                      <td style={{ padding: '13px 18px', fontFamily: JET, color: '#888880', fontSize: '11px' }}>
                        {rw.rewritten_text?.split(/\s+/).filter(Boolean).length ?? 0}
                      </td>
                      <td style={{ padding: '13px 18px', fontFamily: JET, color: '#888880', fontSize: '11px' }}>
                        {rw.intensity}/10
                      </td>
                      <td style={{ padding: '13px 18px', textAlign: 'center', fontFamily: JET, color: '#888880', fontSize: '12px' }}>
                        {expandedId === rw.id ? '▲' : '▼'}
                      </td>
                    </tr>
                    {expandedId === rw.id && (
                      <tr key={`${rw.id}-expanded`} style={{ borderBottom: '1px solid #F0F0F0' }}>
                        <td colSpan={6} style={{ padding: '0 18px 18px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', paddingTop: '14px' }}>
                            <div style={{ border: '1px solid #E0E0E0', borderRadius: '2px', padding: '14px' }}>
                              <div style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '10px' }}>
                                Original
                              </div>
                              <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', lineHeight: '1.75' }}>{rw.original_text}</p>
                            </div>
                            <div style={{ border: '1px solid #E0E0E0', borderRadius: '2px', padding: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div style={{ fontFamily: JET, color: '#6B1FFF', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                                  Rewritten
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleCopy(rw.rewritten_text, rw.id) }}
                                  style={{
                                    backgroundColor: 'transparent',
                                    border: '1px solid #E0E0E0', borderRadius: '2px',
                                    padding: '3px 10px', fontFamily: JET,
                                    color: copiedId === rw.id ? '#6B1FFF' : '#888880',
                                    fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em',
                                    cursor: 'pointer',
                                  }}
                                >
                                  {copiedId === rw.id ? '✓ Copied' : 'Copy'}
                                </button>
                              </div>
                              <p style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', lineHeight: '1.75' }}>{rw.rewritten_text}</p>
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
