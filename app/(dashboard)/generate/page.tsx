'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type LengthOption = 'short' | 'medium' | 'long'

export default function GeneratePage() {
  const [prompt, setPrompt] = useState('')
  const [length, setLength] = useState<LengthOption>('medium')
  const [tone, setTone] = useState(50)
  const [loading, setLoading] = useState(false)
  const [generatedText, setGeneratedText] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
    }
    getUser()
  }, [router, supabase])

  const toneLabel =
    tone < 33 ? 'Formal' : tone < 66 ? 'Balanced' : 'Casual'

  const handleGenerate = async () => {
    if (!prompt.trim() || !userId) {
      setError('Please enter a prompt before generating.')
      return
    }
    setError(null)
    setGeneratedText(null)
    setLoading(true)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, prompt: prompt.trim(), length, tone }),
      })

      const data: { generatedText?: string; error?: string } = await response.json()

      if (!response.ok) {
        setError(data.error ?? 'Generation failed. Please try again.')
        return
      }

      setGeneratedText(data.generatedText ?? '')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!generatedText) return
    await navigator.clipboard.writeText(generatedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const lengthButtons: { label: string; value: LengthOption; desc: string }[] = [
    { label: 'Short', value: 'short', desc: '~150 words' },
    { label: 'Medium', value: 'medium', desc: '~350 words' },
    { label: 'Long', value: 'long', desc: '~600 words' },
  ]

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
            <path d="M5 3v4"/>
            <path d="M3 5h4"/>
            <path d="M19 17v4"/>
            <path d="M17 19h4"/>
          </svg>
          Generate
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Write original content in your voice from a prompt.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Left: inputs */}
        <div>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              What do you want to write?
            </h2>

            {/* Prompt */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#0F172A', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                Topic / Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Write a 300 word essay intro about climate change"
                rows={5}
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  color: '#0F172A',
                  fontSize: '14px',
                  lineHeight: '1.6',
                  resize: 'vertical',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Length selector */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', color: '#0F172A', fontSize: '13px', marginBottom: '10px', fontWeight: '500' }}>
                Length
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                {lengthButtons.map((btn) => {
                  const isActive = length === btn.value
                  return (
                    <button
                      key={btn.value}
                      onClick={() => setLength(btn.value)}
                      style={{
                        flex: 1,
                        backgroundColor: isActive ? '#1E3A5F' : '#FFFFFF',
                        color: isActive ? '#FFFFFF' : '#0F172A',
                        border: isActive ? 'none' : '1px solid #E2E8F0',
                        borderRadius: '8px',
                        padding: '10px 8px',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      <div>{btn.label}</div>
                      <div style={{ fontSize: '11px', fontWeight: '400', marginTop: '2px', opacity: 0.75 }}>{btn.desc}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tone slider */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ color: '#0F172A', fontSize: '13px', fontWeight: '500' }}>
                  Tone
                </label>
                <span style={{
                  backgroundColor: 'rgba(30,58,95,0.08)',
                  color: '#1E3A5F',
                  fontSize: '12px',
                  fontWeight: '600',
                  padding: '2px 10px',
                  borderRadius: '100px',
                }}>
                  {toneLabel}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>Formal</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={tone}
                  onChange={(e) => setTone(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#1E3A5F' }}
                />
                <span style={{ color: '#64748B', fontSize: '12px', whiteSpace: 'nowrap' }}>Casual</span>
              </div>
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '12px',
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{
                backgroundColor: loading ? 'rgba(16,185,129,0.5)' : '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '12px 20px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    display: 'inline-block',
                    width: '14px',
                    height: '14px',
                    border: '2px solid rgba(255,255,255,0.4)',
                    borderTopColor: '#FFFFFF',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                  }} />
                  Generating...
                </>
              ) : (
                <>
                  <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                    <path d="M5 3v4"/>
                    <path d="M3 5h4"/>
                    <path d="M19 17v4"/>
                    <path d="M17 19h4"/>
                  </svg>
                  Generate in My Voice
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: output */}
        <div>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            minHeight: '360px',
            display: 'flex',
            flexDirection: 'column',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600' }}>
                Generated Text
              </h2>
              {generatedText && (
                <button
                  onClick={handleCopy}
                  style={{
                    backgroundColor: copied ? 'rgba(16,185,129,0.1)' : 'rgba(30,58,95,0.08)',
                    border: `1px solid ${copied ? 'rgba(16,185,129,0.3)' : 'rgba(30,58,95,0.2)'}`,
                    borderRadius: '7px',
                    padding: '6px 14px',
                    color: copied ? '#10B981' : '#1E3A5F',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              )}
            </div>

            <div style={{ flex: 1, padding: '24px' }}>
              {!generatedText && !loading && (
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                  <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
                    <svg width={40} height={40} viewBox="0 0 24 24" fill="none" stroke="#E2E8F0" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                      <path d="M5 3v4"/>
                      <path d="M3 5h4"/>
                      <path d="M19 17v4"/>
                      <path d="M17 19h4"/>
                    </svg>
                  </div>
                  <p style={{ color: '#64748B', fontSize: '14px' }}>
                    Your generated content will appear here.
                  </p>
                </div>
              )}

              {loading && (
                <div style={{ textAlign: 'center', paddingTop: '60px' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    border: '3px solid #E2E8F0',
                    borderTopColor: '#1E3A5F',
                    borderRadius: '50%',
                    animation: 'spin 0.7s linear infinite',
                    marginBottom: '16px',
                  }} />
                  <p style={{ color: '#64748B', fontSize: '14px' }}>Writing in your voice...</p>
                </div>
              )}

              {generatedText && !loading && (
                <p style={{
                  color: '#0F172A',
                  fontSize: '15px',
                  lineHeight: '1.75',
                  whiteSpace: 'pre-wrap',
                }}>
                  {generatedText}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
