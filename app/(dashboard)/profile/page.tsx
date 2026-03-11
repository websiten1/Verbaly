'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { WritingSample, StyleTrait } from '@/lib/types'

interface PresetProfile {
  name: string
  description: string
}

const PRESET_PROFILES: PresetProfile[] = [
  {
    name: 'The Academic',
    description: 'Formal, structured, citation-heavy. Complex sentences, passive voice, hedging language, and discipline-specific vocabulary.',
  },
  {
    name: 'The Casual Student',
    description: 'Relaxed and conversational. Contractions everywhere, occasional slang, short sentences, filler words like "honestly" and "pretty much".',
  },
  {
    name: 'The Creative Writer',
    description: 'Expressive and bold. Rich metaphors, varied sentence rhythm, em-dashes, sensory language, and unconventional punctuation.',
  },
  {
    name: 'The Professional',
    description: 'Clear, concise, business-like. Active voice, bullet-point thinking, no fluff, direct statements.',
  },
]

export default function ProfilePage() {
  const [content, setContent] = useState('')
  const [filename, setFilename] = useState('')
  const [samples, setSamples] = useState<WritingSample[]>([])
  const [traits, setTraits] = useState<StyleTrait[]>([])
  const [uploading, setUploading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [presetSaving, setPresetSaving] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const loadData = useCallback(async (uid: string) => {
    const [samplesResult, traitsResult, profileResult] = await Promise.all([
      supabase.from('writing_samples').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('style_traits').select('*').eq('user_id', uid).order('score', { ascending: false }),
      supabase.from('profiles').select('preset_type').eq('user_id', uid).maybeSingle(),
    ])
    setSamples(samplesResult.data ?? [])
    setTraits(traitsResult.data ?? [])
    setActivePreset(profileResult.data?.preset_type ?? null)
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      setUserId(user.id)
      await loadData(user.id)
    }
    getUser()
  }, [loadData, router, supabase])

  const handleSelectPreset = async (presetName: string) => {
    if (!userId) return
    setPresetSaving(true)
    await supabase.from('profiles').upsert({ user_id: userId, preset_type: presetName }, { onConflict: 'user_id' })
    setActivePreset(presetName)
    setPresetSaving(false)
    setSuccess(`Now using "${presetName}" profile!`)
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleClearPreset = async () => {
    if (!userId) return
    setPresetSaving(true)
    await supabase.from('profiles').upsert({ user_id: userId, preset_type: null }, { onConflict: 'user_id' })
    setActivePreset(null)
    setPresetSaving(false)
    setSuccess('Switched back to your personal profile.')
    setTimeout(() => setSuccess(null), 3000)
  }

  const handleUpload = async () => {
    if (!content.trim() || !filename.trim() || !userId) {
      setError('Please enter both a filename and content')
      return
    }

    setError(null)
    setUploading(true)

    const wordCount = content.trim().split(/\s+/).filter(Boolean).length

    const safeName = filename?.slice(0, 200) || 'Untitled'
    const { error: insertError } = await supabase.from('writing_samples').insert({
      user_id: userId,
      content: content.trim(),
      filename: safeName,
      word_count: wordCount,
    })

    if (insertError) {
      setError(insertError.message)
      setUploading(false)
      return
    }

    setContent('')
    setFilename('')
    setSuccess('Sample uploaded successfully!')
    setTimeout(() => setSuccess(null), 3000)
    await loadData(userId)
    setUploading(false)
  }

  const handleAnalyze = async () => {
    if (!userId || samples.length === 0) {
      setError('Upload at least one writing sample first')
      return
    }

    setError(null)
    setAnalyzing(true)

    try {
      const response = await fetch('/api/analyze-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          samples: samples.map((s) => s.content),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Analysis failed')
        return
      }

      setTraits(data.traits)
      setSuccess('Style analysis complete!')
      setTimeout(() => setSuccess(null), 3000)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setAnalyzing(false)
    }
  }

  const handleDeleteSample = async (id: string) => {
    if (!userId) return
    await supabase.from('writing_samples').delete().eq('id', id).eq('user_id', userId)
    await loadData(userId)
  }

  const profileStrength = traits.length > 0
    ? Math.min(100, Math.round((traits.length / 6) * 100))
    : samples.length > 0 ? 10 : 0

  return (
    <div className="p-4 md:p-8 lg:p-12" style={{ minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#0F172A', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px' }}>
          Style Profile
        </h1>
        <p style={{ color: '#64748B', fontSize: '14px' }}>
          Upload your writing so Verbaly can learn your voice
        </p>
      </div>

      {/* Preset Profiles */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div>
            <h2 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Choose a Preset Profile
            </h2>
            <p style={{ color: '#64748B', fontSize: '13px' }}>
              Use a preset writing persona instead of your personal style profile.
            </p>
          </div>
          {activePreset && (
            <button
              onClick={handleClearPreset}
              disabled={presetSaving}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '7px 14px',
                color: '#64748B',
                fontSize: '13px',
                cursor: presetSaving ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              Clear preset
            </button>
          )}
        </div>

        {!activePreset && (
          <div style={{
            backgroundColor: 'rgba(16,185,129,0.07)',
            border: '1px solid rgba(16,185,129,0.25)',
            borderRadius: '8px',
            padding: '10px 14px',
            color: '#10B981',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            Using personal profile — your uploaded samples drive the style.
          </div>
        )}

        {/* Preset cards grid — 1 col on mobile, 2 cols on sm+ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESET_PROFILES.map((preset) => {
            const isActive = activePreset === preset.name
            return (
              <div
                key={preset.name}
                style={{
                  border: isActive ? '2px solid #1E3A5F' : '1px solid #E2E8F0',
                  borderRadius: '10px',
                  padding: '16px',
                  backgroundColor: isActive ? 'rgba(30,58,95,0.04)' : '#FFFFFF',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: '#1E3A5F',
                    color: '#FFFFFF',
                    fontSize: '11px',
                    fontWeight: '700',
                    padding: '2px 8px',
                    borderRadius: '100px',
                  }}>
                    Active
                  </span>
                )}
                <div style={{ color: '#0F172A', fontSize: '14px', fontWeight: '600', marginBottom: '6px', paddingRight: isActive ? '52px' : '0' }}>
                  {preset.name}
                </div>
                <p style={{ color: '#64748B', fontSize: '13px', lineHeight: '1.5', marginBottom: '14px' }}>
                  {preset.description}
                </p>
                <button
                  onClick={() => handleSelectPreset(preset.name)}
                  disabled={presetSaving || isActive}
                  style={{
                    backgroundColor: isActive ? 'rgba(30,58,95,0.08)' : '#1E3A5F',
                    color: isActive ? '#1E3A5F' : '#FFFFFF',
                    border: isActive ? '1px solid rgba(30,58,95,0.2)' : 'none',
                    borderRadius: '7px',
                    padding: '7px 14px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: presetSaving || isActive ? 'not-allowed' : 'pointer',
                    opacity: presetSaving ? 0.6 : 1,
                    minHeight: '44px',
                  }}
                >
                  {isActive ? 'Active' : 'Use This Profile'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile strength — full width */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E2E8F0',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '24px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>Profile Strength</span>
          <span style={{ color: '#10B981', fontSize: '14px', fontWeight: '700' }}>{profileStrength}%</span>
        </div>
        <div style={{ backgroundColor: '#E2E8F0', borderRadius: '100px', height: '8px', overflow: 'hidden', width: '100%' }}>
          <div style={{
            backgroundColor: '#10B981',
            height: '100%',
            width: `${profileStrength}%`,
            borderRadius: '100px',
            transition: 'width 0.5s ease',
          }}></div>
        </div>
        <p style={{ color: '#64748B', fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
          {profileStrength < 30
            ? 'Upload more samples to improve your style profile'
            : profileStrength < 70
            ? 'Getting there! Add more samples for better results'
            : 'Your style profile is well-established'}
        </p>
      </div>

      {/* Upload + Style traits — stacked on mobile, side-by-side on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '20px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <h2 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Upload Writing Sample
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#0F172A', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                Filename / Title
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. My Blog Post, Email to Client"
                style={{
                  width: '100%',
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E2E8F0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#0F172A',
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  minHeight: '44px',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: '#0F172A', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your writing here. The more authentic the better — emails, essays, blog posts, anything that reflects your real voice."
                rows={8}
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
                  minHeight: '120px',
                }}
              />
              {content && (
                <div style={{ color: '#64748B', fontSize: '12px', marginTop: '6px', textAlign: 'right', opacity: 0.7 }}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </div>
              )}
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.25)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#DC2626',
                fontSize: '13px',
                marginBottom: '12px',
              }}>{error}</div>
            )}

            {success && (
              <div style={{
                backgroundColor: 'rgba(16,185,129,0.1)',
                border: '1px solid rgba(16,185,129,0.3)',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#10B981',
                fontSize: '13px',
                marginBottom: '12px',
              }}>{success}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                backgroundColor: uploading ? 'rgba(16,185,129,0.5)' : '#10B981',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                padding: '11px 20px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: uploading ? 'not-allowed' : 'pointer',
                width: '100%',
                minHeight: '44px',
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Sample'}
            </button>
          </div>

          {/* Uploaded samples list */}
          {samples.length > 0 && (
            <div style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '12px',
              overflow: 'hidden',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0' }}>
                <h3 style={{ color: '#0F172A', fontSize: '14px', fontWeight: '600' }}>
                  Uploaded Samples ({samples.length})
                </h3>
              </div>
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(226,232,240,0.7)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <div>
                    <div style={{ color: '#0F172A', fontSize: '14px', fontWeight: '500' }}>{sample.filename}</div>
                    <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px', opacity: 0.7 }}>
                      {sample.word_count} words
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSample(sample.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#64748B',
                      opacity: 0.5,
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '4px 8px',
                      minHeight: '44px',
                      minWidth: '44px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Style traits */}
        <div>
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
          }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: '#0F172A', fontSize: '16px', fontWeight: '600' }}>
                Detected Style Traits
              </h2>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || samples.length === 0}
                style={{
                  backgroundColor: analyzing || samples.length === 0 ? 'rgba(16,185,129,0.3)' : '#10B981',
                  border: 'none',
                  color: '#FFFFFF',
                  opacity: analyzing || samples.length === 0 ? 0.6 : 1,
                  padding: '7px 14px',
                  borderRadius: '8px',
                  cursor: analyzing || samples.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  minHeight: '44px',
                }}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Style'}
              </button>
            </div>

            {traits.length === 0 ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', color: '#E2E8F0', marginBottom: '16px' }}>◈</div>
                <p style={{ color: '#64748B', fontSize: '14px' }}>
                  {samples.length === 0
                    ? 'Upload writing samples, then click "Analyze Style"'
                    : 'Click "Analyze Style" to discover your writing traits'}
                </p>
              </div>
            ) : (
              <div style={{ padding: '16px' }}>
                {traits.map((trait) => (
                  <div
                    key={trait.id}
                    style={{
                      padding: '14px 16px',
                      marginBottom: '8px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div>
                        <div style={{ color: '#0F172A', fontSize: '13px', fontWeight: '600', textTransform: 'capitalize' }}>
                          {trait.trait_name.replace(/_/g, ' ')}
                        </div>
                        <div style={{ color: '#64748B', fontSize: '12px', marginTop: '2px' }}>
                          {trait.trait_value}
                        </div>
                      </div>
                      <span style={{ color: '#1E3A5F', fontSize: '15px', fontWeight: '700' }}>{trait.score}</span>
                    </div>
                    <div style={{ backgroundColor: '#E2E8F0', borderRadius: '100px', height: '4px' }}>
                      <div style={{
                        backgroundColor: '#10B981',
                        height: '100%',
                        width: `${trait.score}%`,
                        borderRadius: '100px',
                      }}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
