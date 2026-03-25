'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const JET = "'JetBrains Mono', 'Courier New', monospace"
const CPR = "'Courier Prime', 'Courier New', monospace"

const CARD: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E0E0E0',
  borderRadius: '2px',
}

/* ── Ring score gauge ── */
function RingScore({ score }: { score: number }) {
  const r = 44
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - score / 100)

  return (
    <div style={{ position: 'relative', width: '110px', height: '110px', flexShrink: 0 }}>
      <svg width="110" height="110" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" stroke="#E0E0E0" strokeWidth="6"/>
        <circle
          cx="60" cy="60" r={r} fill="none"
          stroke="#6B1FFF" strokeWidth="6" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{ transform: 'rotate(-90deg)', transformOrigin: '60px 60px', transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontFamily: CPR, fontSize: '22px', fontWeight: '700', color: '#0E0E0E', lineHeight: 1 }}>
          {score}%
        </span>
        <span style={{ fontFamily: JET, fontSize: '9px', color: '#888880', letterSpacing: '.12em', textTransform: 'uppercase', marginTop: '2px' }}>
          match
        </span>
      </div>
    </div>
  )
}

/* ── Spinner ── */
function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', height: '100%', minHeight: '200px' }}>
      <div style={{ position: 'relative', width: '44px', height: '44px' }}>
        <svg width="44" height="44" viewBox="0 0 44 44">
          <circle cx="22" cy="22" r="17" fill="none" stroke="#E0E0E0" strokeWidth="3"/>
          <circle cx="22" cy="22" r="17" fill="none" stroke="#6B1FFF" strokeWidth="3"
            strokeLinecap="round" strokeDasharray="68 40"
            style={{ animation: 'spin 0.85s linear infinite', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
        Rewriting in your voice…
      </p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const INTENSITY_LABELS: Record<number, string> = {
  1: 'Subtle touch',   2: 'Light change',   3: 'Gentle reshape',
  4: 'Moderate shift', 5: 'Balanced rewrite', 6: 'Notable change',
  7: 'Strong rewrite', 8: 'Deep rewrite',   9: 'Heavy overhaul',
  10: 'Full rebuild',
}

export default function RewritePage() {
  const [originalText,  setOriginalText]  = useState('')
  const [rewrittenText, setRewrittenText] = useState('')
  const [intensity,     setIntensity]     = useState(5)
  const [matchScore,    setMatchScore]    = useState<number | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState<string | null>(null)
  const [warning,       setWarning]       = useState<string | null>(null)
  const [copied,        setCopied]        = useState(false)
  const [userId,        setUserId]        = useState<string | null>(null)
  const [styleProfileReady, setStyleProfileReady] = useState(false)
  const [showRewriteTooltip, setShowRewriteTooltip] = useState(false)
  const router   = useRouter()
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const [profileRes, traitsRes] = await Promise.all([
        supabase.from('profiles').select('onboarding_complete').eq('user_id', user.id).maybeSingle(),
        supabase.from('style_traits').select('trait_name').eq('user_id', user.id).limit(1),
      ])

      const onboardingOk = profileRes.data?.onboarding_complete === true
      setStyleProfileReady((traitsRes.data ?? []).length > 0)

      if (onboardingOk) {
        const key = 'vbTooltipSeen_rewrite'
        const alreadySeen = typeof window !== 'undefined' ? window.localStorage.getItem(key) : '1'
        if (!alreadySeen) setShowRewriteTooltip(true)
      }
    }
    getUser()
  }, [router, supabase])

  const handleRewrite = async () => {
    if (!originalText.trim()) { setError('Enter some text to rewrite first.'); return }
    if (!userId)               { setError('You need to be logged in.'); return }
    if (!styleProfileReady) {
      setError('Upload writing samples first — Verbaly needs them to learn your voice. Go to Style Profile →')
      return
    }
    setError(null); setWarning(null); setLoading(true); setRewrittenText(''); setMatchScore(null)

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
      if (data.warning) setWarning(data.warning)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!rewrittenText) return
    try {
      await navigator.clipboard.writeText(rewrittenText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed. Please copy the text manually.')
    }
  }

  const wordCount = originalText.trim() ? originalText.split(/\s+/).filter(Boolean).length : 0
  const canSubmit = !loading && !!originalText.trim()

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: CPR, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '700', color: '#0E0E0E', letterSpacing: '-0.02em', marginBottom: '4px', textTransform: 'uppercase' }}>
          Rewrite
        </h1>
        <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Any text is rewritten to sound like you.
        </p>
      </div>

      {/* Intensity control */}
      <div style={{ ...CARD, padding: '18px 22px', marginBottom: '24px' }}>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div style={{ minWidth: '200px' }}>
            <div style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '4px' }}>
              Rewrite intensity
            </div>
            <div style={{ fontFamily: JET, fontSize: '12px', fontWeight: '500', color: '#6B1FFF', letterSpacing: '.05em' }}>
              {intensity} — {INTENSITY_LABELS[intensity]}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="range" min={1} max={10} value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', accentColor: '#6B1FFF' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Subtle</span>
              <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em' }}>Full rebuild</span>
            </div>
          </div>
          {/* Intensity dots */}
          <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} style={{
                width: '6px', height: '6px', borderRadius: '50%',
                backgroundColor: i < intensity ? '#6B1FFF' : '#E0E0E0',
                transition: 'background-color 150ms',
              }} />
            ))}
          </div>
        </div>
      </div>

      {/* Split panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">

        {/* Input */}
        <div style={{ ...CARD, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #E0E0E0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em' }}>
              AI Generated
            </span>
            {wordCount > 0 && (
              <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', letterSpacing: '.08em' }}>{wordCount} words</span>
            )}
          </div>
          {showRewriteTooltip && (
            <div style={{
              margin: '14px 16px 0 16px',
              border: '1px solid #6B1FFF', borderRadius: '2px',
              padding: '10px 12px', fontFamily: JET, color: '#0E0E0E',
              fontSize: '11px', lineHeight: 1.5,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', gap: '12px',
            }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em', fontSize: '10px' }}>How rewrites work</div>
                Paste your AI text here. Verbaly reads it and rewrites it in your voice.
              </div>
              <button
                onClick={() => {
                  window.localStorage.setItem('vbTooltipSeen_rewrite', '1')
                  setShowRewriteTooltip(false)
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
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste your AI text here…"
            style={{
              flex: 1, border: 'none', outline: 'none',
              padding: '16px', resize: 'none',
              fontFamily: JET, color: '#0E0E0E', fontSize: '12px', lineHeight: '1.75',
              backgroundColor: 'transparent',
              minHeight: '260px',
            }}
          />
        </div>

        {/* Output */}
        <div style={{ ...CARD, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '12px 16px', borderBottom: '1px solid #E0E0E0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{ fontFamily: JET, color: rewrittenText ? '#6B1FFF' : '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em' }}>
              Your Voice
            </span>
            {rewrittenText && (
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #E0E0E0',
                  borderRadius: '2px', padding: '4px 10px',
                  fontFamily: JET, color: copied ? '#6B1FFF' : '#888880',
                  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em',
                  cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '260px' }}>
            {loading ? (
              <Spinner />
            ) : rewrittenText ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', height: '100%' }}>
                <div className="flex flex-col sm:flex-row gap-4 items-start">
                  {matchScore !== null && <RingScore score={matchScore} />}
                  <p style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '12px', lineHeight: '1.75', flex: 1 }}>
                    {rewrittenText}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
                <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center' }}>
                  Rewritten text will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          border: '1px solid #DC2626', borderRadius: '2px',
          padding: '10px 14px', fontFamily: JET,
          color: '#DC2626', fontSize: '11px', marginBottom: '14px',
        }}>
          {error}
        </div>
      )}

      {/* Warning */}
      {warning && (
        <div style={{
          border: '1px solid #6B1FFF', borderRadius: '2px',
          padding: '10px 14px', fontFamily: JET,
          color: '#6B1FFF', fontSize: '11px', marginBottom: '14px',
        }}>
          {warning}
        </div>
      )}

      {/* Submit */}
      <button
        onClick={handleRewrite}
        disabled={!canSubmit}
        style={{
          backgroundColor: canSubmit ? '#0E0E0E' : '#E0E0E0',
          color: canSubmit ? '#FFFFFF' : '#888880',
          border: 'none', borderRadius: '2px', padding: '14px 32px',
          fontFamily: JET, fontSize: '11px', fontWeight: '500',
          textTransform: 'uppercase', letterSpacing: '.15em',
          cursor: canSubmit ? 'pointer' : 'not-allowed',
          width: '100%',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'background-color 200ms',
        }}
      >
        {loading ? (
          <>
            <span style={{
              width: '12px', height: '12px',
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
