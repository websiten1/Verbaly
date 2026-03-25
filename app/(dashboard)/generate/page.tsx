'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type LengthOption = 'short' | 'medium' | 'long'

const JET = "'JetBrains Mono', 'Courier New', monospace"
const CPR = "'Courier Prime', 'Courier New', monospace"

const CARD: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E0E0E0',
  borderRadius: '2px',
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', backgroundColor: '#FFFFFF',
  border: '1px solid #E0E0E0', borderRadius: '2px',
  padding: '12px 14px', color: '#0E0E0E',
  fontFamily: JET, fontSize: '11px',
  letterSpacing: '.05em', outline: 'none',
  lineHeight: '1.65',
}

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '60px 0' }}>
      <div style={{ position: 'relative', width: '40px', height: '40px' }}>
        <svg width="40" height="40" viewBox="0 0 40 40">
          <circle cx="20" cy="20" r="15" fill="none" stroke="#E0E0E0" strokeWidth="3"/>
          <circle cx="20" cy="20" r="15" fill="none" stroke="#6B1FFF" strokeWidth="3"
            strokeLinecap="round" strokeDasharray="60 35"
            style={{ animation: 'spin 0.85s linear infinite', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>Writing in your voice…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

const LENGTHS: { label: string; value: LengthOption; desc: string }[] = [
  { label: 'Short',  value: 'short',  desc: '~150 words' },
  { label: 'Medium', value: 'medium', desc: '~350 words' },
  { label: 'Long',   value: 'long',   desc: '~600 words' },
]

export default function GeneratePage() {
  const [prompt,        setPrompt]        = useState('')
  const [length,        setLength]        = useState<LengthOption>('medium')
  const [tone,          setTone]          = useState(50)
  const [loading,       setLoading]       = useState(false)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [error,         setError]         = useState<string | null>(null)
  const [copied,        setCopied]        = useState(false)
  const [userId,        setUserId]        = useState<string | null>(null)
  const [showGenerateTooltip, setShowGenerateTooltip] = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const profileRes = await supabase
        .from('profiles')
        .select('onboarding_complete')
        .eq('user_id', user.id)
        .maybeSingle()

      const onboardingOk = profileRes.data?.onboarding_complete === true

      if (onboardingOk) {
        const key = 'vbTooltipSeen_generate'
        const alreadySeen = typeof window !== 'undefined' ? window.localStorage.getItem(key) : '1'
        if (!alreadySeen) setShowGenerateTooltip(true)
      }
    }
    getUser()
  }, [router, supabase])

  const toneLabel = tone < 33 ? 'Formal' : tone < 66 ? 'Balanced' : 'Casual'

  const handleGenerate = async () => {
    if (!prompt.trim() || !userId) { setError('Enter a prompt first.'); return }
    setError(null); setGeneratedText(null); setLoading(true)

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prompt: prompt.trim(), length, tone }),
      })
      const data: { generatedText?: string; error?: string } = await res.json()
      if (!res.ok) { setError(data.error ?? 'The generation failed.'); return }
      setGeneratedText(data.generatedText ?? '')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedText) return
    try {
      await navigator.clipboard.writeText(generatedText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Copy failed. Please copy the text manually.')
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: CPR, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '700', color: '#0E0E0E', letterSpacing: '-0.02em', marginBottom: '4px', textTransform: 'uppercase' }}>
          Generate
        </h1>
        <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          New content is written from scratch — in your voice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ── LEFT: Controls ── */}
        <div style={{ ...CARD, padding: '24px' }}>
          <h2 style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '20px' }}>
            What needs to be written?
          </h2>

          {showGenerateTooltip && (
            <div style={{
              marginBottom: '18px',
              border: '1px solid #6B1FFF',
              borderRadius: '2px', padding: '12px 14px',
              fontFamily: JET, fontSize: '11px', lineHeight: 1.6,
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'flex-start', gap: '12px', color: '#0E0E0E',
            }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4, textTransform: 'uppercase', letterSpacing: '.1em' }}>How this works</div>
                Describe what you need. Verbaly writes it from scratch in your style.
              </div>
              <button
                onClick={() => {
                  window.localStorage.setItem('vbTooltipSeen_generate', '1')
                  setShowGenerateTooltip(false)
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

          {/* Prompt */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '8px' }}>
              Topic / Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. An essay intro on why remote work is here to stay"
              rows={5}
              style={{ ...INPUT_STYLE, resize: 'vertical', minHeight: '110px' }}
            />
          </div>

          {/* Length */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '10px' }}>
              Length
            </label>
            <div style={{ display: 'flex', gap: '6px' }}>
              {LENGTHS.map((btn) => {
                const active = length === btn.value
                return (
                  <button
                    key={btn.value}
                    onClick={() => setLength(btn.value)}
                    style={{
                      flex: 1,
                      backgroundColor: active ? '#0E0E0E' : '#FFFFFF',
                      color: active ? '#FFFFFF' : '#888880',
                      border: '1px solid #E0E0E0',
                      borderRadius: '2px', padding: '10px 6px',
                      fontFamily: JET, fontSize: '10px', fontWeight: active ? '500' : '400',
                      textTransform: 'uppercase', letterSpacing: '.1em',
                      cursor: 'pointer', textAlign: 'center',
                      transition: 'all 150ms',
                    }}
                  >
                    <div>{btn.label}</div>
                    <div style={{ fontSize: '10px', fontWeight: '400', marginTop: '2px', opacity: 0.7 }}>
                      {btn.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em' }}>Tone</label>
              <span style={{
                fontFamily: JET, fontSize: '10px', fontWeight: '500',
                textTransform: 'uppercase', letterSpacing: '.1em',
                color: '#6B1FFF', border: '1px solid #6B1FFF',
                borderRadius: '2px', padding: '2px 8px',
              }}>
                {toneLabel}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>Formal</span>
              <input
                type="range" min={0} max={100} value={tone}
                onChange={(e) => setTone(Number(e.target.value))}
                style={{ flex: 1, accentColor: '#6B1FFF' }}
              />
              <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.08em', whiteSpace: 'nowrap' }}>Casual</span>
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

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              backgroundColor: loading || !prompt.trim() ? '#E0E0E0' : '#0E0E0E',
              color: loading || !prompt.trim() ? '#888880' : '#FFFFFF',
              border: 'none', borderRadius: '2px', padding: '12px 20px',
              fontFamily: JET, fontSize: '11px', fontWeight: '500',
              textTransform: 'uppercase', letterSpacing: '.12em',
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
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
                  borderTopColor: '#FFF', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Generating…
              </>
            ) : 'Generate in my voice'}
          </button>
        </div>

        {/* ── RIGHT: Output ── */}
        <div style={{ ...CARD, overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: '360px' }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid #E0E0E0',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h2 style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.15em' }}>
              Generated text
            </h2>
            {generatedText && (
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #E0E0E0',
                  borderRadius: '2px', padding: '4px 12px',
                  fontFamily: JET, color: copied ? '#6B1FFF' : '#888880',
                  fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em',
                  cursor: 'pointer', transition: 'all 150ms',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, padding: '20px' }}>
            {loading ? (
              <Spinner />
            ) : generatedText ? (
              <p style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '12px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {generatedText}
              </p>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', textAlign: 'center' }}>
                  Generated text will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
