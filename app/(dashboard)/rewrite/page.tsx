'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function RewritePage() {
  const [originalText, setOriginalText] = useState('')
  const [rewrittenText, setRewrittenText] = useState('')
  const [intensity, setIntensity] = useState(5)
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
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
  }, [])

  const intensityLabels: Record<number, string> = {
    1: 'Subtle touch',
    2: 'Light adjustment',
    3: 'Gentle reshape',
    4: 'Moderate shift',
    5: 'Balanced transform',
    6: 'Notable change',
    7: 'Strong rewrite',
    8: 'Deep transformation',
    9: 'Heavy overhaul',
    10: 'Complete rebirth',
  }

  const handleRewrite = async () => {
    if (!originalText.trim()) {
      setError('Please enter some text to rewrite')
      return
    }
    if (!userId) {
      setError('You must be logged in to rewrite')
      return
    }

    setError(null)
    setLoading(true)
    setRewrittenText('')
    setMatchScore(null)

    try {
      const response = await fetch('/api/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, originalText, intensity }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Failed to rewrite text')
        return
      }

      setRewrittenText(data.rewrittenText)
      setMatchScore(data.matchScore)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (rewrittenText) navigator.clipboard.writeText(rewrittenText)
  }

  const card: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E8ECF4',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
    overflow: 'hidden',
  }

  return (
    <div className="p-4 md:p-8 lg:p-12" style={{ minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#1A2340', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px', fontFamily: 'Instrument Serif, serif' }}>
          Rewrite
        </h1>
        <p style={{ color: '#8A94A6', fontSize: '14px' }}>
          Transform any text to sound like you
        </p>
      </div>

      {/* Intensity slider */}
      <div style={{ ...card, padding: '20px 24px', marginBottom: '24px' }}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div style={{ minWidth: '180px' }}>
            <div style={{ color: '#8A94A6', fontSize: '12px', fontWeight: '500', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Rewrite Intensity
            </div>
            <div style={{ color: '#1A6EFF', fontSize: '15px', fontWeight: '600' }}>
              {intensity} — {intensityLabels[intensity]}
            </div>
          </div>
          <div style={{ flex: 1 }}>
            <input
              type="range"
              min={1}
              max={10}
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              style={{ width: '100%', cursor: 'pointer', height: '4px' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
              <span style={{ color: '#8A94A6', fontSize: '11px' }}>Subtle</span>
              <span style={{ color: '#8A94A6', fontSize: '11px' }}>Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Split panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Input */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E8ECF4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#8A94A6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI Generated Text
            </span>
            {originalText && (
              <span style={{ color: '#8A94A6', fontSize: '12px' }}>
                {originalText.split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>
          <textarea
            value={originalText}
            onChange={(e) => setOriginalText(e.target.value)}
            placeholder="Paste your AI-generated text here..."
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              padding: '20px',
              color: '#1A2340',
              fontSize: '14px',
              lineHeight: '1.7',
              resize: 'none',
              outline: 'none',
              minHeight: '220px',
              width: '100%',
              boxSizing: 'border-box',
              fontFamily: 'DM Sans, sans-serif',
            }}
          />
        </div>

        {/* Output */}
        <div style={{
          backgroundColor: rewrittenText ? 'rgba(26,110,255,0.02)' : '#FFFFFF',
          border: rewrittenText ? '1px solid rgba(26,110,255,0.2)' : '1px solid #E8ECF4',
          borderRadius: '12px',
          boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E8ECF4',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: rewrittenText ? '#1A2340' : '#8A94A6', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your Voice
              </span>
              {matchScore !== null && (
                <span style={{ backgroundColor: 'rgba(0,229,204,0.12)', color: '#00A890', padding: '2px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '600' }}>
                  {matchScore}% match
                </span>
              )}
            </div>
            {rewrittenText && (
              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: '#F8F9FC',
                  border: '1px solid #E8ECF4',
                  borderRadius: '8px',
                  padding: '4px 14px',
                  color: '#4A5568',
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                Copy
              </button>
            )}
          </div>
          <div style={{ flex: 1, padding: '20px', minHeight: '220px', position: 'relative' }}>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  border: '2px solid rgba(26,110,255,0.15)',
                  borderTop: '2px solid #1A6EFF',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
                <p style={{ color: '#8A94A6', fontSize: '14px' }}>Rewriting in your voice...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : rewrittenText ? (
              <p style={{ color: '#1A2340', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                {rewrittenText}
              </p>
            ) : (
              <p style={{ color: '#8A94A6', fontSize: '14px', lineHeight: '1.7' }}>
                Your rewritten text will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.06)',
          border: '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '10px',
          padding: '12px 16px',
          color: '#DC2626',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={handleRewrite}
        disabled={loading || !originalText.trim()}
        style={{
          backgroundColor: loading || !originalText.trim() ? 'rgba(26,110,255,0.35)' : '#1A6EFF',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '14px 32px',
          fontSize: '16px',
          fontWeight: '600',
          cursor: loading || !originalText.trim() ? 'not-allowed' : 'pointer',
          width: '100%',
          fontFamily: 'DM Sans, sans-serif',
          transition: 'all 150ms ease',
        }}
      >
        {loading ? 'Rewriting...' : 'Rewrite in My Voice'}
      </button>
    </div>
  )
}
