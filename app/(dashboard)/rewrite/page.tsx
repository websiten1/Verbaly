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
    if (rewrittenText) {
      navigator.clipboard.writeText(rewrittenText)
    }
  }

  return (
    <div style={{ padding: '40px 48px', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Rewrite
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Transform any text to sound like you
        </p>
      </div>

      {/* Intensity slider */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ minWidth: '160px' }}>
          <div style={{ color: '#64748B', fontSize: '13px', fontWeight: '500', marginBottom: '4px' }}>
            Rewrite Intensity
          </div>
          <div style={{ color: '#1E3A5F', fontSize: '15px', fontWeight: '600' }}>
            {intensity} — {intensityLabels[intensity]}
          </div>
        </div>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            type="range"
            min={1}
            max={10}
            value={intensity}
            onChange={(e) => setIntensity(Number(e.target.value))}
            style={{
              width: '100%',
              accentColor: '#1E3A5F',
              cursor: 'pointer',
              height: '4px',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
            <span style={{ color: '#64748B', fontSize: '11px', opacity: 0.7 }}>Subtle</span>
            <span style={{ color: '#64748B', fontSize: '11px', opacity: 0.7 }}>Complete</span>
          </div>
        </div>
      </div>

      {/* Split panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left - Input */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E2E8F0',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ color: '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              AI Generated Text
            </span>
            {originalText && (
              <span style={{ color: '#64748B', fontSize: '12px', opacity: 0.6 }}>
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
              color: '#0F172A',
              fontSize: '14px',
              lineHeight: '1.7',
              resize: 'none',
              outline: 'none',
              minHeight: '400px',
            }}
          />
        </div>

        {/* Right - Output */}
        <div style={{
          backgroundColor: '#FFFFFF',
          border: `1px solid ${rewrittenText ? 'rgba(30,58,95,0.4)' : '#E2E8F0'}`,
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: rewrittenText ? '0 4px 16px rgba(30,58,95,0.1)' : '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: rewrittenText ? '#1E3A5F' : '#64748B', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Your Voice
              </span>
              {matchScore !== null && (
                <span style={{
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  padding: '2px 10px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: '600',
                }}>
                  {matchScore}% match
                </span>
              )}
            </div>
            {rewrittenText && (
              <button
                onClick={copyToClipboard}
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid #E2E8F0',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  color: '#64748B',
                  cursor: 'pointer',
                  fontSize: '12px',
                }}
              >
                Copy
              </button>
            )}
          </div>
          <div style={{
            flex: 1,
            padding: '20px',
            minHeight: '400px',
            position: 'relative',
          }}>
            {loading ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                gap: '16px',
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(30,58,95,0.2)',
                  borderTop: '3px solid #1E3A5F',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }}></div>
                <p style={{ color: '#64748B', fontSize: '14px' }}>Rewriting in your voice...</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              </div>
            ) : rewrittenText ? (
              <p style={{ color: '#0F172A', fontSize: '14px', lineHeight: '1.7', margin: 0 }}>
                {rewrittenText}
              </p>
            ) : (
              <p style={{ color: '#64748B', fontSize: '14px', lineHeight: '1.7', opacity: 0.5 }}>
                Your rewritten text will appear here...
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: '8px',
          padding: '12px 16px',
          color: '#DC2626',
          fontSize: '14px',
          marginBottom: '16px',
        }}>
          {error}
        </div>
      )}

      {/* Rewrite button */}
      <button
        onClick={handleRewrite}
        disabled={loading || !originalText.trim()}
        style={{
          backgroundColor: loading || !originalText.trim() ? 'rgba(30,58,95,0.4)' : '#1E3A5F',
          color: '#FFFFFF',
          border: 'none',
          borderRadius: '8px',
          padding: '14px 32px',
          fontSize: '16px',
          fontWeight: '700',
          cursor: loading || !originalText.trim() ? 'not-allowed' : 'pointer',
          width: '100%',
        }}
      >
        {loading ? 'Rewriting...' : 'Rewrite in My Voice'}
      </button>
    </div>
  )
}
