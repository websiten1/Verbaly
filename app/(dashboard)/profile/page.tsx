'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { WritingSample, StyleTrait } from '@/lib/types'

interface PresetProfile { name: string; description: string; icon: string }

const PRESET_PROFILES: PresetProfile[] = [
  { name: 'The Academic',       icon: '🎓', description: 'Formal, citation-heavy, complex sentences, passive voice, hedging language, and discipline-specific vocabulary.' },
  { name: 'The Casual Student', icon: '😊', description: 'Relaxed and conversational. Contractions everywhere, occasional slang, short sentences, and filler words like "honestly".' },
  { name: 'The Creative Writer', icon: '✍️', description: 'Expressive and bold. Rich metaphors, varied sentence rhythm, em-dashes, sensory language, and unconventional punctuation.' },
  { name: 'The Professional',   icon: '💼', description: 'Clear, concise, business-like. Active voice, bullet-point thinking, no fluff, direct statements.' },
]

const TRAIT_CONFIG = [
  { key: 'vocabulary',  label: 'Vocabulary Fingerprint', desc: 'Your most distinctive words',      accent: '#54F2F2', bg: 'rgba(84,242,242,0.08)',  border: 'rgba(84,242,242,0.2)' },
  { key: 'phrases',     label: 'Favorite Phrases',       desc: 'Recurring expressions & starters', accent: '#059669', bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.2)'  },
  { key: 'punctuation', label: 'Punctuation Patterns',   desc: 'How you use commas, dashes & more',accent: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)' },
  { key: 'structure',   label: 'Sentence Structure',     desc: 'Your sentence length & rhythm',    accent: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)'  },
  { key: 'voice',       label: 'Voice Markers',          desc: 'Formality, tone & perspective',    accent: '#DB2777', bg: 'rgba(219,39,119,0.08)',  border: 'rgba(219,39,119,0.2)' },
  { key: 'never_does',  label: 'Never Does',             desc: 'Patterns absent from your writing',accent: '#042A2B', bg: 'rgba(4,42,43,0.06)',     border: 'rgba(4,42,43,0.15)'   },
]

function Spinner({ text = 'Working…' }: { text?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <span style={{
        width: '14px', height: '14px',
        border: '2px solid rgba(255,255,255,0.3)',
        borderTopColor: '#FFF', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite', display: 'inline-block',
      }} />
      {text}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function ProfilePage() {
  const [content,       setContent]       = useState('')
  const [filename,      setFilename]      = useState('')
  const [samples,       setSamples]       = useState<WritingSample[]>([])
  const [traitMap,      setTraitMap]      = useState<Record<string, string[]>>({})
  const [uploading,     setUploading]     = useState(false)
  const [analyzing,     setAnalyzing]     = useState(false)
  const [userId,        setUserId]        = useState<string | null>(null)
  const [error,         setError]         = useState<string | null>(null)
  const [notice,        setNotice]        = useState<string | null>(null)
  const [activePreset,  setActivePreset]  = useState<string | null>(null)
  const [presetSaving,  setPresetSaving]  = useState(false)
  const router   = useRouter()
  const supabase = createClient()

  const flash = (msg: string) => { setNotice(msg); setTimeout(() => setNotice(null), 3500) }

  const parseTraits = (traitsData: StyleTrait[]) => {
    const map: Record<string, string[]> = {}
    for (const t of traitsData) {
      try { map[t.trait_name] = JSON.parse(t.trait_value) } catch { map[t.trait_name] = [] }
    }
    setTraitMap(map)
  }

  const loadData = useCallback(async (uid: string) => {
    const [samplesRes, traitsRes, profileRes] = await Promise.all([
      supabase.from('writing_samples').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('style_traits').select('*').eq('user_id', uid).order('score', { ascending: false }),
      supabase.from('profiles').select('preset_type').eq('user_id', uid).maybeSingle(),
    ])
    setSamples(samplesRes.data ?? [])
    parseTraits(traitsRes.data ?? [])
    setActivePreset(profileRes.data?.preset_type ?? null)
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

  const handleSelectPreset = async (name: string) => {
    if (!userId) return
    setPresetSaving(true)
    await supabase.from('profiles').upsert({ user_id: userId, preset_type: name }, { onConflict: 'user_id' })
    setActivePreset(name)
    setPresetSaving(false)
    flash(`Now using "${name}" profile.`)
  }

  const handleClearPreset = async () => {
    if (!userId) return
    setPresetSaving(true)
    await supabase.from('profiles').upsert({ user_id: userId, preset_type: null }, { onConflict: 'user_id' })
    setActivePreset(null)
    setPresetSaving(false)
    flash('Switched to personal profile.')
  }

  const handleUpload = async () => {
    if (!content.trim() || !filename.trim() || !userId) { setError('Please enter both a filename and content'); return }
    setError(null); setUploading(true)
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    const { error: e } = await supabase.from('writing_samples').insert({
      user_id: userId, content: content.slice(0, 50000),
      filename: filename.slice(0, 200), word_count: wordCount,
    })
    if (e) { setError(e.message); setUploading(false); return }
    setContent(''); setFilename('')
    flash('Sample uploaded!')
    await loadData(userId)
    setUploading(false)
  }

  const handleDeleteSample = async (id: string) => {
    if (!userId) return
    await supabase.from('writing_samples').delete().eq('id', id).eq('user_id', userId)
    await loadData(userId)
  }

  const handleAnalyze = async () => {
    if (!userId || samples.length === 0) { setError('Upload at least one writing sample first'); return }
    setError(null); setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-style', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, samples: samples.map((s) => s.content) }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Analysis failed'); return }
      parseTraits(data.traits ?? [])
      flash('Style analysis complete!')
    } catch { setError('Something went wrong.') }
    finally { setAnalyzing(false) }
  }

  const STYLE_DIMENSIONS = ['vocabulary', 'phrases', 'punctuation', 'structure', 'voice', 'never_does']
  const populatedDimensions = STYLE_DIMENSIONS.filter(k => (traitMap[k] ?? []).length > 0).length
  const hasStyleData = populatedDimensions > 0
  const profileStrength = populatedDimensions > 0
    ? Math.round((populatedDimensions / 6) * 100)
    : samples.length > 0 ? 12 : 0

  const INPUT: React.CSSProperties = {
    width: '100%', backgroundColor: '#F9F8F5', border: '1px solid #E5E2D8',
    borderRadius: '10px', padding: '10px 14px', color: '#16150F',
    fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div className="p-5 md:p-8 lg:p-10" style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '30px', fontWeight: '400', color: '#16150F', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Style Profile
        </h1>
        <p style={{ color: '#A09D95', fontSize: '14px' }}>
          Upload your writing so Verbaly can learn your voice.
        </p>
      </div>

      {/* Notice */}
      {notice && (
        <div style={{
          backgroundColor: 'rgba(84,242,242,0.08)', border: '1px solid rgba(84,242,242,0.2)',
          borderRadius: '10px', padding: '11px 16px', color: '#042A2B',
          fontSize: '13px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          <span style={{ color: '#54F2F2' }}>✓</span> {notice}
        </div>
      )}

      {/* Profile strength */}
      <div style={{
        backgroundColor: '#FFFFFF', border: '1px solid #E5E2D8',
        borderRadius: '14px', padding: '20px 24px', marginBottom: '20px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ color: '#16150F', fontSize: '14px', fontWeight: '600' }}>Profile strength</span>
          <span style={{ color: '#042A2B', fontSize: '14px', fontWeight: '700' }}>{profileStrength}%</span>
        </div>
        <div style={{ backgroundColor: '#F0EDE4', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            backgroundColor: '#54F2F2', height: '100%',
            width: `${profileStrength}%`, borderRadius: '100px',
            transition: 'width 0.8s ease',
          }} />
        </div>
        <p style={{ color: '#A09D95', fontSize: '12px', marginTop: '8px' }}>
          {populatedDimensions === 0 && samples.length === 0
            ? 'Upload writing samples to train your profile'
            : populatedDimensions === 0
            ? 'Click "Analyze style" to extract your writing fingerprint'
            : populatedDimensions < 6
            ? `${populatedDimensions}/6 dimensions analyzed — click Analyze Style to complete your profile`
            : 'All 6 style dimensions analyzed — your profile is complete'}
        </p>
      </div>

      {/* Preset profiles */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2D8', borderRadius: '14px', padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>Preset Profiles</h2>
            <p style={{ color: '#A09D95', fontSize: '13px' }}>
              {activePreset ? `Using "${activePreset}"` : 'Using your personal style profile.'}
            </p>
          </div>
          {activePreset && (
            <button onClick={handleClearPreset} disabled={presetSaving}
              style={{
                background: 'transparent', border: '1px solid #E5E2D8',
                borderRadius: '8px', padding: '6px 14px',
                color: '#6B6960', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'DM Sans, sans-serif',
              }}>
              Use personal profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRESET_PROFILES.map((p) => {
            const active = activePreset === p.name
            return (
              <div key={p.name} style={{
                border: active ? '1px solid rgba(84,242,242,0.35)' : '1px solid #E5E2D8',
                borderRadius: '12px', padding: '18px',
                backgroundColor: active ? 'rgba(84,242,242,0.04)' : '#F9F8F5',
                position: 'relative',
              }}>
                {active && (
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    backgroundColor: 'rgba(84,242,242,0.15)', color: '#042A2B',
                    fontSize: '11px', fontWeight: '700', padding: '2px 8px',
                    borderRadius: '100px', border: '1px solid rgba(84,242,242,0.3)',
                  }}>Active</span>
                )}
                <div style={{ fontSize: '22px', marginBottom: '8px' }}>{p.icon}</div>
                <div style={{ color: '#16150F', fontSize: '14px', fontWeight: '600', marginBottom: '6px' }}>
                  {p.name}
                </div>
                <p style={{ color: '#6B6960', fontSize: '13px', lineHeight: '1.55', marginBottom: '14px' }}>
                  {p.description}
                </p>
                <button
                  onClick={() => handleSelectPreset(p.name)}
                  disabled={presetSaving || active}
                  style={{
                    backgroundColor: active ? 'rgba(84,242,242,0.12)' : '#042A2B',
                    color: active ? '#042A2B' : '#FFFFFF',
                    border: active ? '1px solid rgba(84,242,242,0.3)' : 'none',
                    borderRadius: '8px', padding: '7px 16px',
                    fontSize: '13px', fontWeight: '600',
                    cursor: active ? 'default' : 'pointer',
                    fontFamily: 'DM Sans, sans-serif',
                  }}>
                  {active ? 'Active' : 'Use this profile'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload + Traits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Upload */}
        <div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2D8', borderRadius: '14px', padding: '24px', marginBottom: '16px' }}>
            <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>
              Upload writing sample
            </h2>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#6B6960', fontSize: '13px', fontWeight: '500', marginBottom: '7px' }}>
                Filename / Title
              </label>
              <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. My Blog Post" style={INPUT} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', color: '#6B6960', fontSize: '13px', fontWeight: '500', marginBottom: '7px' }}>
                Content
              </label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your writing here — emails, essays, blog posts. The more authentic the better."
                rows={8} style={{ ...INPUT, lineHeight: '1.6', resize: 'vertical', minHeight: '120px', padding: '12px 14px' }}
              />
              {content && (
                <div style={{ color: '#A09D95', fontSize: '12px', textAlign: 'right', marginTop: '4px' }}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </div>
              )}
            </div>

            {error && (
              <div style={{ backgroundColor: 'rgba(220,38,38,0.05)', border: '1px solid rgba(220,38,38,0.18)', borderRadius: '10px', padding: '10px 14px', color: '#DC2626', fontSize: '13px', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <button onClick={handleUpload} disabled={uploading}
              style={{
                backgroundColor: uploading ? 'rgba(4,42,43,0.3)' : '#042A2B',
                color: '#FFFFFF', border: 'none', borderRadius: '9px',
                padding: '11px 20px', fontSize: '14px', fontWeight: '600',
                cursor: uploading ? 'not-allowed' : 'pointer', width: '100%',
                fontFamily: 'DM Sans, sans-serif', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
              {uploading ? <Spinner text="Uploading…" /> : 'Upload sample'}
            </button>
          </div>

          {/* Samples list */}
          {samples.length > 0 && (
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2D8', borderRadius: '14px', overflow: 'hidden' }}>
              <div style={{ padding: '14px 20px', borderBottom: '1px solid #E5E2D8' }}>
                <span style={{ color: '#16150F', fontSize: '14px', fontWeight: '600' }}>
                  Samples ({samples.length})
                </span>
              </div>
              {samples.map((s) => (
                <div key={s.id} style={{
                  padding: '12px 20px', borderBottom: '1px solid #F0EDE4',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ color: '#16150F', fontSize: '14px', fontWeight: '500' }}>{s.filename}</div>
                    <div style={{ color: '#A09D95', fontSize: '12px', marginTop: '2px' }}>{s.word_count} words</div>
                  </div>
                  <button onClick={() => handleDeleteSample(s.id)} style={{
                    background: 'transparent', border: 'none', color: '#A09D95',
                    cursor: 'pointer', fontSize: '18px', padding: '4px 8px', lineHeight: 1,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Style traits */}
        <div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E2D8', borderRadius: '14px', overflow: 'hidden' }}>
            <div style={{
              padding: '16px 20px', borderBottom: '1px solid #E5E2D8',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600' }}>Style traits</h2>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || samples.length === 0}
                style={{
                  backgroundColor: analyzing || samples.length === 0 ? 'rgba(4,42,43,0.15)' : '#042A2B',
                  color: analyzing || samples.length === 0 ? 'rgba(4,42,43,0.4)' : '#FFFFFF',
                  border: 'none', borderRadius: '8px', padding: '7px 16px',
                  fontSize: '13px', fontWeight: '600',
                  cursor: analyzing || samples.length === 0 ? 'not-allowed' : 'pointer',
                  fontFamily: 'DM Sans, sans-serif', display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                {analyzing ? <Spinner text="Analyzing…" /> : 'Analyze style'}
              </button>
            </div>

            {!hasStyleData ? (
              <div style={{ padding: '56px 24px', textAlign: 'center' }}>
                <svg width="40" height="40" viewBox="0 0 20 20" fill="none" style={{ margin: '0 auto 16px', opacity: 0.2 }}>
                  <circle cx="10" cy="10" r="8.5" stroke="#042A2B" strokeWidth="1.4"/>
                  <circle cx="10" cy="10" r="5.5" stroke="#042A2B" strokeWidth="1.4"/>
                  <circle cx="10" cy="10" r="2.5" stroke="#042A2B" strokeWidth="1.4"/>
                </svg>
                <p style={{ color: '#6B6960', fontSize: '15px', fontWeight: '500', marginBottom: '6px' }}>
                  No style data yet
                </p>
                <p style={{ color: '#A09D95', fontSize: '13px' }}>
                  Upload samples and click Analyze Style to see your writing fingerprint.
                </p>
              </div>
            ) : (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {TRAIT_CONFIG.map(({ key, label, desc, accent, bg, border }) => {
                  const items = traitMap[key] ?? []
                  if (items.length === 0) return null
                  return (
                    <div key={key} style={{ backgroundColor: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: '700', letterSpacing: '0.06em', color: accent, textTransform: 'uppercase', marginBottom: '2px' }}>
                            {label}
                          </div>
                          <div style={{ fontSize: '11px', color: '#A09D95' }}>{desc}</div>
                        </div>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.6)', border: `1px solid ${border}`, borderRadius: '100px', padding: '2px 8px', fontSize: '11px', color: accent, fontWeight: '600' }}>
                          {items.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {items.map((item, i) => (
                          <span key={i} style={{
                            backgroundColor: 'rgba(255,255,255,0.7)',
                            border: `1px solid ${border}`,
                            borderRadius: key === 'vocabulary' || key === 'phrases' || key === 'never_does' ? '100px' : '7px',
                            padding: key === 'punctuation' || key === 'structure' || key === 'voice' ? '5px 10px' : '4px 10px',
                            fontSize: '12px', color: '#16150F',
                          }}>
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
