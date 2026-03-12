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

const card: React.CSSProperties = {
  backgroundColor: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '20px',
}

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
  const [vocabItems, setVocabItems] = useState<string[]>([])
  const [phraseItems, setPhraseItems] = useState<string[]>([])
  const [punctItems, setPunctItems] = useState<string[]>([])
  const [structItems, setStructItems] = useState<string[]>([])
  const [voiceItems, setVoiceItems] = useState<string[]>([])
  const [neverItems, setNeverItems] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  const loadData = useCallback(async (uid: string) => {
    const [samplesResult, traitsResult, profileResult] = await Promise.all([
      supabase.from('writing_samples').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('style_traits').select('*').eq('user_id', uid).order('score', { ascending: false }),
      supabase.from('profiles').select('preset_type').eq('user_id', uid).maybeSingle(),
    ])
    setSamples(samplesResult.data ?? [])
    const traitsData = traitsResult.data ?? []
    setTraits(traitsData)
    setActivePreset(profileResult.data?.preset_type ?? null)

    const vocab = traitsData.find((t: StyleTrait) => t.trait_name === 'vocabulary')
    if (vocab) { try { setVocabItems(JSON.parse(vocab.trait_value)) } catch { setVocabItems([]) } }
    const phrases = traitsData.find((t: StyleTrait) => t.trait_name === 'phrases')
    if (phrases) { try { setPhraseItems(JSON.parse(phrases.trait_value)) } catch { setPhraseItems([]) } }
    const punct = traitsData.find((t: StyleTrait) => t.trait_name === 'punctuation')
    if (punct) { try { setPunctItems(JSON.parse(punct.trait_value)) } catch { setPunctItems([]) } }
    const struct = traitsData.find((t: StyleTrait) => t.trait_name === 'structure')
    if (struct) { try { setStructItems(JSON.parse(struct.trait_value)) } catch { setStructItems([]) } }
    const voice = traitsData.find((t: StyleTrait) => t.trait_name === 'voice')
    if (voice) { try { setVoiceItems(JSON.parse(voice.trait_value)) } catch { setVoiceItems([]) } }
    const never = traitsData.find((t: StyleTrait) => t.trait_name === 'never_does')
    if (never) { try { setNeverItems(JSON.parse(never.trait_value)) } catch { setNeverItems([]) } }
  }, [supabase])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
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
    const { error: insertError } = await supabase.from('writing_samples').insert({
      user_id: userId,
      content: content?.slice(0, 50000) || '',
      filename: filename?.slice(0, 200) || 'Untitled',
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
        body: JSON.stringify({ userId, samples: samples.map((s) => s.content) }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Analysis failed')
        return
      }

      const returnedTraits: StyleTrait[] = data.traits ?? []
      setTraits(returnedTraits)

      const vocab = returnedTraits.find((t) => t.trait_name === 'vocabulary')
      if (vocab) { try { setVocabItems(JSON.parse(vocab.trait_value)) } catch { setVocabItems([]) } }
      const phrases = returnedTraits.find((t) => t.trait_name === 'phrases')
      if (phrases) { try { setPhraseItems(JSON.parse(phrases.trait_value)) } catch { setPhraseItems([]) } }
      const punct = returnedTraits.find((t) => t.trait_name === 'punctuation')
      if (punct) { try { setPunctItems(JSON.parse(punct.trait_value)) } catch { setPunctItems([]) } }
      const struct = returnedTraits.find((t) => t.trait_name === 'structure')
      if (struct) { try { setStructItems(JSON.parse(struct.trait_value)) } catch { setStructItems([]) } }
      const voice = returnedTraits.find((t) => t.trait_name === 'voice')
      if (voice) { try { setVoiceItems(JSON.parse(voice.trait_value)) } catch { setVoiceItems([]) } }
      const never = returnedTraits.find((t) => t.trait_name === 'never_does')
      if (never) { try { setNeverItems(JSON.parse(never.trait_value)) } catch { setNeverItems([]) } }

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

  const hasStyleData = vocabItems.length > 0 || phraseItems.length > 0 || punctItems.length > 0 || structItems.length > 0 || voiceItems.length > 0 || neverItems.length > 0
  const profileStrength = hasStyleData ? 75 : samples.length > 0 ? 10 : 0

  const inputStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '10px 14px',
    color: '#FCFCFC',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    minHeight: '44px',
    fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div className="p-4 md:p-8 lg:p-12" style={{ minHeight: '100vh' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ color: '#FCFCFC', fontSize: '28px', fontWeight: '700', letterSpacing: '-0.5px', marginBottom: '6px', fontFamily: 'Instrument Serif, serif' }}>
          Style Profile
        </h1>
        <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '14px' }}>
          Upload your writing so Verbaly can learn your voice
        </p>
      </div>

      {/* Preset Profiles */}
      <div style={{ ...card, padding: '24px', marginBottom: '24px' }}>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-5">
          <div>
            <h2 style={{ color: '#FCFCFC', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>
              Choose a Preset Profile
            </h2>
            <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '13px' }}>
              Use a preset writing persona instead of your personal style profile.
            </p>
          </div>
          {activePreset && (
            <button
              onClick={handleClearPreset}
              disabled={presetSaving}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '100px',
                padding: '7px 16px',
                color: 'rgba(252,252,252,0.5)',
                fontSize: '13px',
                cursor: presetSaving ? 'not-allowed' : 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                fontFamily: 'DM Sans, sans-serif',
              }}
            >
              Clear preset
            </button>
          )}
        </div>

        {!activePreset && (
          <div style={{
            backgroundColor: 'rgba(84,242,242,0.05)',
            border: '1px solid rgba(84,242,242,0.15)',
            borderRadius: '12px',
            padding: '10px 14px',
            color: 'rgba(84,242,242,0.8)',
            fontSize: '13px',
            marginBottom: '16px',
          }}>
            Using personal profile — your uploaded samples drive the style.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESET_PROFILES.map((preset) => {
            const isActive = activePreset === preset.name
            return (
              <div
                key={preset.name}
                style={{
                  border: isActive ? '1px solid rgba(84,242,242,0.3)' : '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '16px',
                  padding: '16px',
                  backgroundColor: isActive ? 'rgba(84,242,242,0.05)' : 'rgba(255,255,255,0.03)',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    backgroundColor: '#54F2F2', color: '#042A2B',
                    fontSize: '11px', fontWeight: '700', padding: '2px 8px', borderRadius: '100px',
                  }}>
                    Active
                  </span>
                )}
                <div style={{ color: '#FCFCFC', fontSize: '14px', fontWeight: '600', marginBottom: '6px', paddingRight: isActive ? '52px' : '0' }}>
                  {preset.name}
                </div>
                <p style={{ color: 'rgba(252,252,252,0.45)', fontSize: '13px', lineHeight: '1.5', marginBottom: '14px' }}>
                  {preset.description}
                </p>
                <button
                  onClick={() => handleSelectPreset(preset.name)}
                  disabled={presetSaving || isActive}
                  style={{
                    backgroundColor: isActive ? 'rgba(84,242,242,0.08)' : '#54F2F2',
                    color: isActive ? '#54F2F2' : '#042A2B',
                    border: isActive ? '1px solid rgba(84,242,242,0.2)' : 'none',
                    borderRadius: '100px',
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: presetSaving || isActive ? 'not-allowed' : 'pointer',
                    opacity: presetSaving ? 0.6 : 1,
                    minHeight: '36px',
                    fontFamily: 'DM Sans, sans-serif',
                    transition: 'all 150ms ease',
                  }}
                >
                  {isActive ? 'Active' : 'Use This Profile'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Profile strength */}
      <div style={{ ...card, padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <span style={{ color: 'rgba(252,252,252,0.7)', fontSize: '14px', fontWeight: '500' }}>Profile Strength</span>
          <span style={{ color: '#54F2F2', fontSize: '14px', fontWeight: '700' }}>{profileStrength}%</span>
        </div>
        <div style={{ backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '100px', height: '6px', overflow: 'hidden', width: '100%' }}>
          <div style={{
            backgroundColor: '#54F2F2',
            height: '100%',
            width: `${profileStrength}%`,
            borderRadius: '100px',
            transition: 'width 0.5s ease',
            boxShadow: '0 0 8px rgba(84,242,242,0.4)',
          }} />
        </div>
        <p style={{ color: 'rgba(252,252,252,0.3)', fontSize: '12px', marginTop: '8px' }}>
          {profileStrength < 30
            ? 'Upload more samples to improve your style profile'
            : profileStrength < 70
            ? 'Getting there! Add more samples for better results'
            : 'Your style profile is well-established'}
        </p>
      </div>

      {/* Upload + Style traits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Upload */}
        <div>
          <div style={{ ...card, padding: '24px', marginBottom: '20px' }}>
            <h2 style={{ color: '#FCFCFC', fontSize: '16px', fontWeight: '600', marginBottom: '20px' }}>
              Upload Writing Sample
            </h2>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(252,252,252,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                Filename / Title
              </label>
              <input
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. My Blog Post, Email to Client"
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', color: 'rgba(252,252,252,0.7)', fontSize: '13px', marginBottom: '8px', fontWeight: '500' }}>
                Content
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your writing here. The more authentic the better — emails, essays, blog posts, anything that reflects your real voice."
                rows={8}
                style={{
                  ...inputStyle,
                  lineHeight: '1.6',
                  resize: 'vertical',
                  minHeight: '120px',
                  padding: '12px 14px',
                }}
              />
              {content && (
                <div style={{ color: 'rgba(252,252,252,0.3)', fontSize: '12px', marginTop: '6px', textAlign: 'right' }}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </div>
              )}
            </div>

            {error && (
              <div style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: '#FCA5A5',
                fontSize: '13px',
                marginBottom: '12px',
              }}>{error}</div>
            )}

            {success && (
              <div style={{
                backgroundColor: 'rgba(84,242,242,0.06)',
                border: '1px solid rgba(84,242,242,0.15)',
                borderRadius: '10px',
                padding: '10px 14px',
                color: 'rgba(84,242,242,0.8)',
                fontSize: '13px',
                marginBottom: '12px',
              }}>{success}</div>
            )}

            <button
              onClick={handleUpload}
              disabled={uploading}
              style={{
                backgroundColor: uploading ? 'rgba(84,242,242,0.3)' : '#54F2F2',
                color: '#042A2B',
                border: 'none',
                borderRadius: '100px',
                padding: '11px 20px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer',
                width: '100%',
                minHeight: '44px',
                fontFamily: 'DM Sans, sans-serif',
                transition: 'all 150ms ease',
              }}
            >
              {uploading ? 'Uploading...' : 'Upload Sample'}
            </button>
          </div>

          {/* Uploaded samples list */}
          {samples.length > 0 && (
            <div style={{ ...card, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ color: '#FCFCFC', fontSize: '14px', fontWeight: '600' }}>
                  Uploaded Samples ({samples.length})
                </h3>
              </div>
              {samples.map((sample) => (
                <div
                  key={sample.id}
                  style={{
                    padding: '14px 20px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ color: '#FCFCFC', fontSize: '14px', fontWeight: '500' }}>{sample.filename}</div>
                    <div style={{ color: 'rgba(252,252,252,0.35)', fontSize: '12px', marginTop: '2px' }}>
                      {sample.word_count} words
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteSample(sample.id)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'rgba(252,252,252,0.3)',
                      cursor: 'pointer',
                      fontSize: '18px',
                      padding: '4px 8px',
                      minHeight: '44px',
                      minWidth: '44px',
                      transition: 'color 150ms ease',
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
          <div style={{ ...card, overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <h2 style={{ color: '#FCFCFC', fontSize: '16px', fontWeight: '600' }}>
                Detected Style Traits
              </h2>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || samples.length === 0}
                style={{
                  backgroundColor: analyzing || samples.length === 0 ? 'rgba(84,242,242,0.15)' : '#54F2F2',
                  border: 'none',
                  color: analyzing || samples.length === 0 ? 'rgba(84,242,242,0.5)' : '#042A2B',
                  padding: '7px 16px',
                  borderRadius: '100px',
                  cursor: analyzing || samples.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  minHeight: '36px',
                  fontFamily: 'DM Sans, sans-serif',
                  transition: 'all 150ms ease',
                }}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Style'}
              </button>
            </div>

            {!hasStyleData ? (
              <div style={{ padding: '48px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: '32px', color: 'rgba(255,255,255,0.1)', marginBottom: '16px' }}>◈</div>
                <p style={{ color: 'rgba(252,252,252,0.35)', fontSize: '14px' }}>
                  Upload writing samples and click Analyze Style to see your writing fingerprint.
                </p>
              </div>
            ) : (
              <div style={{ padding: '16px' }}>
                {/* Vocab + Phrases */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
                  {vocabItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(84,242,242,0.7)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Vocabulary Fingerprint
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {vocabItems.map((item, i) => (
                          <span key={i} style={{
                            backgroundColor: 'rgba(84,242,242,0.08)',
                            border: '1px solid rgba(84,242,242,0.2)',
                            borderRadius: '100px',
                            padding: '4px 12px',
                            fontSize: '13px',
                            color: 'rgba(84,242,242,0.9)',
                            fontWeight: '500',
                          }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {phraseItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(84,242,242,0.7)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Favorite Phrases
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {phraseItems.map((item, i) => (
                          <span key={i} style={{
                            backgroundColor: 'rgba(84,242,242,0.08)',
                            border: '1px solid rgba(84,242,242,0.2)',
                            borderRadius: '100px',
                            padding: '4px 12px',
                            fontSize: '13px',
                            color: 'rgba(84,242,242,0.9)',
                            fontWeight: '500',
                          }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Punctuation + Structure */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: '16px' }}>
                  {punctItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(252,252,252,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Punctuation Patterns
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {punctItems.map((item, i) => (
                          <span key={i} style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            color: 'rgba(252,252,252,0.7)',
                            lineHeight: '1.5',
                          }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {structItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(252,252,252,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Sentence Structure
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {structItems.map((item, i) => (
                          <span key={i} style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            color: 'rgba(252,252,252,0.7)',
                            lineHeight: '1.5',
                          }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Voice + Never Does */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {voiceItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(252,252,252,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Voice Markers
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {voiceItems.map((item, i) => (
                          <span key={i} style={{
                            backgroundColor: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            borderRadius: '8px',
                            padding: '6px 12px',
                            fontSize: '13px',
                            color: 'rgba(252,252,252,0.7)',
                            lineHeight: '1.5',
                          }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {neverItems.length > 0 && (
                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', letterSpacing: '0.1em', color: 'rgba(252,252,252,0.4)', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Things They Never Do
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {neverItems.map((item, i) => (
                          <span key={i} style={{
                            backgroundColor: 'rgba(94,177,191,0.08)',
                            border: '1px solid rgba(94,177,191,0.2)',
                            borderRadius: '100px',
                            padding: '4px 12px',
                            fontSize: '13px',
                            color: '#5EB1BF',
                            fontWeight: '500',
                          }}>{item}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
