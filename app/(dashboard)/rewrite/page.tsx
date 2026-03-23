'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

/* ── SVG ring score gauge ──────────────────────────────────── */
function RingScore({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)

  return (
    <div style={{ position: 'relative', width: '120px', height: '120px', flexShrink: 0 }}>
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(84,242,242,0.1)" strokeWidth="7"/>
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#54F2F2" strokeWidth="7" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '24px', fontWeight: '700', color: '#16150F', lineHeight: 1 }}>
          {score}%
        </span>
        <span style={{ fontSize: '10px', color: '#A09D95', letterSpacing: '0.08em', marginTop: '2px' }}>
          MATCH
        </span>
      </div>
    </div>
  )
}

/* ── Loading ring spinner ──────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', height: '100%', minHeight: '200px' }}>
      <div style={{ position: 'relative', width: '52px', height: '52px' }}>
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle cx="26" cy="26" r="20" fill="none" stroke="rgba(84,242,242,0.1)" strokeWidth="4"/>
          <circle cx="26" cy="26" r="20" fill="none" stroke="#54F2F2" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="80 46"
            style={{ animation: 'spin 0.85s linear infinite', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <p style={{ color: '#6B6960', fontSize: '14px' }}>Rewriting in your voice…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const INTENSITY_LABELS: Record<number, string> = {
  1: 'Subtle touch',     2: 'Light adjustment', 3: 'Gentle reshape',
  4: 'Moderate shift',   5: 'Balanced transform', 6: 'Notable change',
  7: 'Strong rewrite',   8: 'Deep transformation', 9: 'Heavy overhaul',
  10: 'Complete rebirth',
}

export default function RewritePage() {
  const [originalText,  setOriginalText]  = useState('')
  const [rewrittenText, setRewrittenText] = useState('')
  const [intensity,     setIntensity]     = useState(5)
  const [matchScore,    setMatchScore]    = useState<number | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [copied,        setCopied]        = useState(false)
  const [userId,        setUserId]        = useState<string | null>(null)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
    }
    getUser()
  }, [])

  const handleRewrite = async () => {
    if (!originalText.trim()) { setError('Please enter some text to rewrite'); return }
    if (!userId)               { setError('You must be logged in'); return }
    setError(null); setLoading(true); setRewrittenText(''); setMatchScore(null)

    try {
      const res = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, originalText, intensity }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to rewrite text'); return }
      setRewrittenText(data.rewrittenText)
      setMatchScore(data.matchScore)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!rewrittenText) return
    await navigator.clipboard.writeText(rewrittenText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const wordCount = originalText.trim() ? originalText.split(/\s+/).filter(Boolean).length : 0
  const canSubmit = !loading && !!originalText.trim()

  return (
    <div className="p-5 md:p-8 lg:p-10" style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: '30px', fontWeight: '400',
          color: '#16150F', letterSpacing: '-0.5px', marginBottom: '4px',
        }}>
          Rewrite
        </h1>
        <p style={{ color: '#A09D95', fontSize: '14px' }}>
          Transform any text to sound like you
        </p>
      </div>

      {/* Intensity control */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E2D8',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '20px',
      }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div style={{ minWidth: '200px' }}>
            <div style={{ color: '#A09D95', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '4px' }}>
              Rewrite intensity
            </div>
            <div style={{ fontSize: '15px', fontWeight: '600', color: '#042A2B' }}>
              {intensity} — {INTENSITY_LABELS[intensity]}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="range" min={1} max={10} value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ color: '#A09D95', fontSize: '11px' }}>Subtle</span>
              <span style={{ color: '#A09D95', fontSize: '11px' }}>Complete rebirth</span>
            </div>
          </div>
          {/* Intensity dots */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: i < intensity ? '#54F2F2' : '#E5E2D8',
                transition: 'background-color 150ms',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">

        {/* Input */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E5E2D8',
          borderRadius: '12px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{
            padding: '13px 18px', borderBottom: '1px solid #E5E2D8',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: '#A09D95', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI Generated
            </span>
            {wordCount > 0 && (
              <span style={{ color: '#A09D95', fontSize: '12px' }}>{wordCount} words</span>
            )}
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste your AI-generated text here…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: '20px', resize: 'none',
              color: '#16150F', fontSize: '14px', lineHeight: '1.75',
              backgroundColor: 'transparent', fontFamily: 'DM Sans, sans-serif',
              minHeight: '260px',
            }}
          />
        </div>

        {/* Output */}
        <div style={{
          backgroundColor: rewrittenText ? 'rgba(84,242,242,0.03)' : '#FFFFFF',
          border: rewrittenText ? '1px solid rgba(84,242,242,0.2)' : '1px solid #E5E2D8',
          borderRadius: '12px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          transition: 'border-color 400ms ease, background-color 400ms ease',
        }}>
          <div style={{
            padding: '13px 18px', borderBottom: '1px solid rgba(84,242,242,0.12)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ color: rewrittenText ? '#042A2B' : '#A09D95', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Your Voice
            </span>
            {rewrittenText && (
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: copied ? 'rgba(84,242,242,0.12)' : '#F9F8F5',
                  border: `1px solid ${copied ? 'rgba(84,242,242,0.3)' : '#E5E2D8'}`,
                  borderRadius: '7px', padding: '4px 12px',
                  color: copied ? '#042A2B' : '#6B6960',
                  cursor: 'pointer', fontSize: '12px', fontWeight: '500',
                  fontFamily: 'DM Sans, sans-serif', transition: 'all 150ms',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>

          {/* Match score + output */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            {loading ? (
              <Spinner />
            ) : rewrittenText ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px', height: '100%' }}>
                {/* Score + text layout */}
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {matchScore !== null && <RingScore score={matchScore} />}
                  <p style={{ color: '#16150F', fontSize: '14px', lineHeight: '1.75', flex: 1 }}>
                    {rewrittenText}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <div style={{ textAlign: 'center' }}>
                  <svg width="36" height="36" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto 12px' }}>
                    <circle cx="10" cy="10" r="8.5" stroke="#E5E2D8" strokeWidth="1.4"/>
                    <circle cx="10" cy="10" r="5.5" stroke="#E5E2D8" strokeWidth="1.4"/>
                    <circle cx="10" cy="10" r="2.5" stroke="#E5E2D8" strokeWidth="1.4"/>
                  </svg>
                  <p style={{ color: '#A09D95', fontSize: '14px' }}>
                    Your rewritten text will appear here…
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(220,38,38,0.05)',
          border: '1px solid rgba(220,38,38,0.18)',
          borderRadius: '10px', padding: '11px 16px',
          color: '#DC2626', fontSize: '14px', marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleRewrite}
        disabled={!canSubmit}
        style={{
          backgroundColor: canSubmit ? '#042A2B' : 'rgba(4,42,43,0.3)',
          color: '#FFFFFF', border: 'none',
          borderRadius: '10px', padding: '14px 32px',
          fontSize: '16px', fontWeight: '600',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          width: '100%', fontFamily: 'DM Sans, sans-serif',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'background-color 200ms',
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: '16px', height: '16px',
              border: '2px solid rgba(255,255,255,0.3)',
              borderTopColor: '#FFFFFF', borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            Rewriting…
          </>
        ) : 'Rewrite in my voice'}
      </button>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
