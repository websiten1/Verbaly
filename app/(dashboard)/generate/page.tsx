'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type LengthOption = 'short' | 'medium' | 'long'

function Spinner() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '14px', padding: '60px 0' }}>
      <div style={{ position: 'relative', width: '48px', height: '48px' }}>
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="18" fill="none" stroke="rgba(84,242,242,0.1)" strokeWidth="4"/>
          <circle cx="24" cy="24" r="18" fill="none" stroke="#54F2F2" strokeWidth="4"
            strokeLinecap="round" strokeDasharray="72 41"
            style={{ animation: 'spin 0.85s linear infinite', transformOrigin: 'center' }}
          />
        </svg>
      </div>
      <p style={{ color: '#6B6960', fontSize: '14px' }}>The text is being written in your voice…</p>
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
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: '30px', fontWeight: '400',
          color: '#16150F', letterSpacing: '-0.5px', marginBottom: '4px',
        }}>
          Generate
        </h1>
        <p style={{ color: '#A09D95', fontSize: '14px' }}>
          New content is written from scratch — in your voice.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* ── LEFT: Controls ──────────────────────────────────── */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8ECF4',
          borderRadius: '12px',
          padding: '28px',
          boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
        }}>
          <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600', marginBottom: '22px' }}>
            What needs to be written?
          </h2>

          {showGenerateTooltip && (
            <div style={{
              marginBottom: '18px',
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
                <div style={{ fontWeight: 700, marginBottom: 4 }}>How this works</div>
                Describe what you need. Verbaly writes it from scratch in your style.
              </div>
              <button
                onClick={() => {
                  window.localStorage.setItem('vbTooltipSeen_generate', '1')
                  setShowGenerateTooltip(false)
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

          {/* Prompt */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', color: '#6B6960', fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}>
              Topic / Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. An essay intro on why remote work is here to stay"
              rows={5}
              style={{
                width: '100%', backgroundColor: '#F9F8F5',
                border: '1px solid #E5E2D8', borderRadius: '10px',
                padding: '16px', color: '#16150F',
                fontSize: '14px', lineHeight: '1.65',
                resize: 'vertical', outline: 'none',
                minHeight: '110px', fontFamily: 'DM Sans, sans-serif',
              }}
            />
          </div>

          {/* Length */}
          <div style={{ marginBottom: '22px' }}>
            <label style={{ display: 'block', color: '#6B6960', fontSize: '13px', fontWeight: '500', marginBottom: '10px' }}>
              Length
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {LENGTHS.map((btn) => {
                const active = length === btn.value
                return (
                  <button
                    key={btn.value}
                    onClick={() => setLength(btn.value)}
                    style={{
                      flex: 1,
                      backgroundColor: active ? '#042A2B' : '#F9F8F5',
                      color: active ? '#FFFFFF' : '#6B6960',
                      border: active ? 'none' : '1px solid #E5E2D8',
                      borderRadius: '9px', padding: '10px 6px',
                      fontSize: '13px', fontWeight: '600',
                      cursor: 'pointer', textAlign: 'center',
                      fontFamily: 'DM Sans, sans-serif',
                      transition: 'all 150ms',
                    }}
                  >
                    <div>{btn.label}</div>
                    <div style={{ fontSize: '11px', fontWeight: '400', marginTop: '2px', opacity: 0.7 }}>
                      {btn.desc}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tone */}
          <div style={{ marginBottom: '26px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <label style={{ color: '#6B6960', fontSize: '13px', fontWeight: '500' }}>Tone</label>
              <span style={{
                backgroundColor: 'rgba(84,242,242,0.1)',
                border: '1px solid rgba(84,242,242,0.2)',
                color: '#042A2B', fontSize: '12px', fontWeight: '600',
                padding: '2px 10px', borderRadius: '100px',
              }}>
                {toneLabel}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#A09D95', fontSize: '12px', whiteSpace: 'nowrap' }}>Formal</span>
              <input
                type="range" min={0} max={100} value={tone}
                onChange={(e) => setTone(Number(e.target.value))}
                style={{ flex: 1 }}
              />
              <span style={{ color: '#A09D95', fontSize: '12px', whiteSpace: 'nowrap' }}>Casual</span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{
              backgroundColor: 'rgba(220,38,38,0.05)',
              border: '1px solid rgba(220,38,38,0.18)',
              borderRadius: '10px', padding: '10px 14px',
              color: '#DC2626', fontSize: '13px', marginBottom: '14px',
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            style={{
              backgroundColor: loading || !prompt.trim() ? 'rgba(4,42,43,0.3)' : '#042A2B',
              color: '#FFFFFF', border: 'none',
              borderRadius: '10px', padding: '12px 20px',
              fontSize: '14px', fontWeight: '600',
              cursor: loading || !prompt.trim() ? 'not-allowed' : 'pointer',
              width: '100%', fontFamily: 'DM Sans, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              transition: 'background-color 200ms',
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: '14px', height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#FFF', borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }} />
                Generating…
              </>
            ) : (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
                Generate in my voice
              </>
            )}
          </button>
        </div>

        {/* ── RIGHT: Output ────────────────────────────────────── */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8ECF4',
          borderRadius: '12px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          minHeight: '360px',
          transition: 'border-color 400ms',
          boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
        }}>
          <div style={{
            padding: '16px 20px', borderBottom: '1px solid #E5E2D8',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600' }}>Generated text</h2>
            {generatedText && (
              <button
                onClick={handleCopy}
                style={{
                  backgroundColor: copied ? 'rgba(84,242,242,0.1)' : '#F9F8F5',
                  border: `1px solid ${copied ? 'rgba(84,242,242,0.25)' : '#E5E2D8'}`,
                  borderRadius: '7px', padding: '5px 12px',
                  color: copied ? '#042A2B' : '#6B6960',
                  fontSize: '13px', fontWeight: '500',
                  cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div style={{ flex: 1, padding: '24px' }}>
            {loading ? (
              <Spinner />
            ) : generatedText ? (
              <p style={{ color: '#16150F', fontSize: '15px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
                {generatedText}
              </p>
            ) : (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '200px' }}>
                <svg width="40" height="40" viewBox="0 0 20 20" fill="none" style={{ marginBottom: '12px', opacity: 0.3 }}>
                  <circle cx="10" cy="10" r="8.5" stroke="#042A2B" strokeWidth="1.4"/>
                  <circle cx="10" cy="10" r="5.5" stroke="#042A2B" strokeWidth="1.4"/>
                  <circle cx="10" cy="10" r="2.5" stroke="#042A2B" strokeWidth="1.4"/>
                </svg>
                <p style={{ color: '#A09D95', fontSize: '14px', textAlign: 'center' }}>
                  The generated text will appear here.
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
