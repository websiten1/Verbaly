'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { WritingSample, StyleTrait } from '@/lib/types'

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
}

interface PresetProfile { name: string; description: string; sym: string }

const PRESET_PROFILES: PresetProfile[] = [
  { name: 'The Academic',        sym: '◆', description: 'Formal sentences with citations, passive voice, and hedging — used in academic disciplines.' },
  { name: 'The Casual Student',  sym: '◇', description: 'Relaxed and conversational. Contractions are used throughout, and short sentences are the default.' },
  { name: 'The Creative Writer', sym: '◈', description: 'Expressive and bold. Metaphors, em-dashes, and sensory language are used — and the rhythm varies.' },
  { name: 'The Professional',    sym: '◉', description: 'Clear and direct. Active voice is used, and statements are made without filler.' },
]

const TRAIT_LABELS: Record<string, { label: string; desc: string }> = {
  vocabulary:  { label: 'Vocabulary Fingerprint', desc: 'Your most-used words, mapped' },
  phrases:     { label: 'Favorite Phrases',       desc: 'Expressions that appear again and again' },
  punctuation: { label: 'Punctuation Patterns',   desc: 'The way commas, dashes, and stops are used' },
  structure:   { label: 'Sentence Structure',     desc: 'Sentence length and the rhythm behind it' },
  voice:       { label: 'Voice Markers',          desc: 'Tone, formality, and the voice behind the text' },
  never_does:  { label: 'Never Does',             desc: 'Patterns that never appeared in your writing' },
}

function Spinner({ text = 'Working…' }: { text?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontFamily: JET, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
      <span style={{
        width: '12px', height: '12px',
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
  const [traitMap,      setTraitMap]      = useState<Record<string, unknown>>({})
  const [totalWords,   setTotalWords]    = useState(0)
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null)
  const [onboardingStage, setOnboardingStage] = useState<0 | 1>(0)
  const [showOnboardingSuccess, setShowOnboardingSuccess] = useState(false)
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
    const map: Record<string, unknown> = {}
    for (const t of traitsData) {
      try { map[t.trait_name] = JSON.parse(t.trait_value) } catch { map[t.trait_name] = null }
    }
    setTraitMap(map)
  }

  const traitToDisplayItems = (key: string, raw: unknown): string[] => {
    if (!raw) return []
    if (Array.isArray(raw)) return raw.filter((x) => typeof x === 'string')

    if (typeof raw !== 'object') return []
    const r = raw as Record<string, unknown>

    if (key === 'vocabulary') {
      const frequent = Array.isArray(r.frequent_words) ? r.frequent_words.filter((x) => typeof x === 'string') : []
      const neverUsed = Array.isArray(r.never_used_words) ? r.never_used_words.filter((x) => typeof x === 'string') : []
      const formality = typeof r.formality_level === 'string' ? r.formality_level : null
      const contractions = typeof r.contractions_used === 'boolean' ? r.contractions_used : null
      const slang = typeof r.slang_used === 'boolean' ? r.slang_used : null
      const academic = typeof r.academic_language_used === 'boolean' ? r.academic_language_used : null

      const items: string[] = []
      items.push(`Frequent: ${frequent.slice(0, 6).join(', ') || '—'}`)
      items.push(`Never used: ${neverUsed.slice(0, 6).join(', ') || '—'}`)
      if (formality) items.push(`Formality: ${formality}`)
      if (contractions !== null) items.push(`Contractions: ${contractions ? 'yes' : 'no'}`)
      if (slang !== null) items.push(`Slang: ${slang ? 'yes' : 'no'}`)
      if (academic !== null) items.push(`Academic: ${academic ? 'yes' : 'no'}`)
      return items
    }

    if (key === 'phrases') {
      const openers = Array.isArray(r.sentence_openers) ? r.sentence_openers.filter((x) => typeof x === 'string') : []
      const transitions = Array.isArray(r.transition_phrases) ? r.transition_phrases.filter((x) => typeof x === 'string') : []
      const intros = Array.isArray(r.argument_introductions) ? r.argument_introductions.filter((x) => typeof x === 'string') : []
      const endings = Array.isArray(r.paragraph_endings) ? r.paragraph_endings.filter((x) => typeof x === 'string') : []
      return [
        `Openers: ${openers.slice(0, 5).join(', ') || '—'}`,
        `Transitions: ${transitions.slice(0, 5).join(', ') || '—'}`,
        `Introductions: ${intros.slice(0, 5).join(', ') || '—'}`,
        `Endings: ${endings.slice(0, 5).join(', ') || '—'}`,
      ]
    }

    if (key === 'punctuation') {
      const omissions = Array.isArray(r.omission_patterns) ? r.omission_patterns.filter((x) => typeof x === 'string') : []
      const additions = Array.isArray(r.addition_patterns) ? r.addition_patterns.filter((x) => typeof x === 'string') : []
      const deviations = Array.isArray(r.specific_deviations) ? r.specific_deviations.filter((x) => typeof x === 'string') : []
      const overall = typeof r.overall_style === 'string' ? r.overall_style : null
      const usesEm = typeof r.uses_em_dashes === 'boolean' ? r.uses_em_dashes : null
      const usesEll = typeof r.uses_ellipses === 'boolean' ? r.uses_ellipses : null
      const usesSemi = typeof r.uses_semicolons === 'boolean' ? r.uses_semicolons : null

      return [
        `Overall: ${overall ?? '—'}`,
        usesEm !== null ? `Em-dashes: ${usesEm ? 'yes' : 'no'}` : '—',
        usesEll !== null ? `Ellipses: ${usesEll ? 'yes' : 'no'}` : '—',
        usesSemi !== null ? `Semicolons: ${usesSemi ? 'yes' : 'no'}` : '—',
        `Omissions: ${omissions.slice(0, 3).join(', ') || '—'}`,
        `Additions: ${additions.slice(0, 3).join(', ') || '—'}`,
        `Deviations: ${deviations.slice(0, 3).join(', ') || '—'}`,
      ].filter((x) => x !== '—')
    }

    if (key === 'structure') {
      const avg = typeof r.avg_paragraph_length_sentences === 'number' ? r.avg_paragraph_length_sentences : null
      const ratio = typeof r.one_sentence_paragraph_ratio === 'number' ? r.one_sentence_paragraph_ratio : null
      const order = Array.isArray(r.argument_order_patterns) ? r.argument_order_patterns.filter((x) => typeof x === 'string') : []
      return [
        `Avg sentences/paragraph: ${avg !== null ? avg.toFixed(1) : '—'}`,
        ratio !== null ? `One-sentence paragraph ratio: ${(ratio * 100).toFixed(0)}%` : '—',
        `Argument order: ${order.slice(0, 5).join(', ') || '—'}`,
      ].filter((x) => x !== '—')
    }

    if (key === 'voice') {
      const first = typeof r.first_person_pct === 'number' ? r.first_person_pct : null
      const active = typeof r.active_voice_pct === 'number' ? r.active_voice_pct : null
      const hedging = typeof r.hedging_frequency === 'string' ? r.hedging_frequency : null
      const formality = typeof r.formality_score === 'number' ? r.formality_score : null
      const express = typeof r.expressiveness_score === 'number' ? r.expressiveness_score : null
      const emo = typeof r.emotional_vs_clinical === 'string' ? r.emotional_vs_clinical : null
      return [
        `First-person: ${first !== null ? `${first.toFixed(0)}%` : '—'}`,
        active !== null ? `Active voice: ${active.toFixed(0)}%` : '—',
        hedging ? `Hedging: ${hedging}` : '—',
        formality !== null ? `Formality score: ${formality.toFixed(0)}` : '—',
        express !== null ? `Expressiveness: ${express.toFixed(0)}` : '—',
        emo ? `Tone: ${emo}` : '—',
      ].filter((x) => x !== '—')
    }

    if (key === 'never_does') {
      const words = Array.isArray(r.banned_words) ? r.banned_words.filter((x) => typeof x === 'string') : []
      const phrases = Array.isArray(r.banned_phrases) ? r.banned_phrases.filter((x) => typeof x === 'string') : []
      const starts = Array.isArray(r.banned_sentence_starts) ? r.banned_sentence_starts.filter((x) => typeof x === 'string') : []
      return [
        `Never use words: ${words.slice(0, 8).join(', ') || '—'}`,
        `Never use phrases: ${phrases.slice(0, 6).join(', ') || '—'}`,
        `Never start sentences with: ${starts.slice(0, 6).join(', ') || '—'}`,
      ].filter((x) => x !== '—')
    }

    return []
  }

  const loadData = useCallback(async (uid: string) => {
    const [samplesRes, traitsRes, profileRes] = await Promise.all([
      supabase.from('writing_samples').select('*').eq('user_id', uid).order('created_at', { ascending: false }),
      supabase.from('style_traits').select('*').eq('user_id', uid).order('score', { ascending: false }),
      supabase.from('profiles').select('preset_type,onboarding_complete').eq('user_id', uid).maybeSingle(),
    ])
    if (samplesRes.error) { setError('Your writing samples could not be loaded. Please try again.'); return }
    if (traitsRes.error)  { setError('Your style traits could not be loaded. Please try again.'); return }
    if (profileRes.error) { console.error('loadData: profiles(preset_type) failed', profileRes.error) }
    setError(null)
    const nextSamples = samplesRes.data ?? []
    setSamples(nextSamples)
    const nextTotalWords = nextSamples.reduce((sum, s) => sum + (s.word_count ?? 0), 0)
    setTotalWords(nextTotalWords)
    parseTraits(traitsRes.data ?? [])
    setActivePreset(profileRes.data?.preset_type ?? null)
    setOnboardingComplete(profileRes.data?.onboarding_complete ?? false)
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

  useEffect(() => {
    const shouldComplete = onboardingComplete === false && totalWords >= 500 && userId
    if (!shouldComplete) return
    const run = async () => {
      try {
        const { error: e } = await supabase.from('profiles').upsert(
          { user_id: userId as string, onboarding_complete: true },
          { onConflict: 'user_id' },
        )
        if (e) { console.error('onboarding_complete upsert failed', e); return }
        setOnboardingComplete(true)
        setShowOnboardingSuccess(true)
        setTimeout(() => setShowOnboardingSuccess(false), 6000)
      } catch (err) { console.error('onboarding_complete update failed', err) }
    }
    run()
  }, [onboardingComplete, totalWords, userId, supabase])

  const handleSelectPreset = async (name: string) => {
    if (!userId) return
    setPresetSaving(true)
    try {
      const { error: e } = await supabase.from('profiles').upsert(
        { user_id: userId, preset_type: name }, { onConflict: 'user_id' })
      if (e) throw e
      setActivePreset(name)
      flash(`The "${name}" profile is now active.`)
    } catch { setError('Failed to save preset. Please try again.') }
    finally { setPresetSaving(false) }
  }

  const handleClearPreset = async () => {
    if (!userId) return
    setPresetSaving(true)
    try {
      const { error: e } = await supabase.from('profiles').upsert(
        { user_id: userId, preset_type: null }, { onConflict: 'user_id' })
      if (e) throw e
      setActivePreset(null)
      flash('Your personal profile is now active.')
    } catch { setError('Failed to switch back to personal profile. Please try again.') }
    finally { setPresetSaving(false) }
  }

  const handleUpload = async () => {
    if (!content.trim() || !filename.trim() || !userId) { setError('A filename and content are both needed.'); return }
    setError(null); setUploading(true)
    const wordCount = content.trim().split(/\s+/).filter(Boolean).length
    const { error: e } = await supabase.from('writing_samples').insert({
      user_id: userId, content: content.slice(0, 50000),
      filename: filename.slice(0, 200), word_count: wordCount,
    })
    if (e) { setError(e.message); setUploading(false); return }
    setContent(''); setFilename('')
    flash('Sample uploaded.')
    await loadData(userId)
    setUploading(false)
  }

  const handleDeleteSample = async (id: string) => {
    if (!userId) return
    try {
      const { error: e } = await supabase.from('writing_samples').delete().eq('id', id).eq('user_id', userId)
      if (e) throw e
      await loadData(userId)
    } catch { setError('Failed to delete sample. Please try again.') }
  }

  const handleAnalyze = async () => {
    if (!userId || samples.length === 0) { setError('Upload at least one writing sample first.'); return }
    setError(null); setAnalyzing(true)
    try {
      const res = await fetch('/api/analyze-style', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, samples: samples.map((s) => s.content) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) { setError(data.error || 'The style analysis failed. Please try again.'); return }
      parseTraits(data.traits ?? [])
      flash('Style analysis done.')
    } catch (e) {
      console.error('handleAnalyze: fetch error', e)
      setError('Something went wrong. Please try again.')
    } finally { setAnalyzing(false) }
  }

  const STYLE_DIMENSIONS = ['vocabulary', 'phrases', 'punctuation', 'structure', 'voice', 'never_does']
  const hasStyleData = STYLE_DIMENSIONS.some((k) => traitToDisplayItems(k, traitMap[k]).length > 0)

  const styleStrengthPct = Math.min(100, Math.round((totalWords / 3000) * 100))
  const milestoneLabel =
    totalWords < 500  ? 'Starter — basic patterns were found' :
    totalWords < 1500 ? 'Developing — your voice is getting clearer' :
    totalWords < 2500 ? 'Strong — most patterns were captured' :
                        'Complete — your full profile is active'

  const shouldShowOnboarding = onboardingComplete === false && totalWords < 500
  const showUploadTour = shouldShowOnboarding && onboardingStage === 1

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Onboarding overlay */}
      {shouldShowOnboarding && onboardingStage === 0 && (
        <div style={{
          position: 'fixed', inset: 0, background: '#FFFFFF', color: '#0E0E0E',
          zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '40px clamp(20px, 5vw, 80px)',
          borderLeft: '4px solid #6B1FFF',
        }}>
          <div style={{ maxWidth: '640px' }}>
            <p style={{ fontFamily: JET, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.25em', color: '#888880', marginBottom: '20px' }}>
              Getting started
            </p>
            <h1 style={{ fontFamily: CPR, fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 700, marginBottom: '16px', letterSpacing: '-0.02em', textTransform: 'uppercase' }}>
              Your writing is read — and your voice is mapped from it.
            </h1>
            <p style={{ fontFamily: JET, color: '#888880', fontSize: '12px', lineHeight: 1.7, marginBottom: '28px' }}>
              Verbaly reads your writing before it can sound like you. Upload at least 3 samples to get started.
            </p>
            <button
              onClick={() => {
                setOnboardingStage(1)
                document.getElementById('vb-upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                backgroundColor: '#0E0E0E', color: '#FFFFFF', border: 'none',
                borderRadius: '2px', padding: '12px 24px',
                fontFamily: JET, fontSize: '11px', fontWeight: 500,
                textTransform: 'uppercase', letterSpacing: '.14em',
                cursor: 'pointer',
              }}
            >
              Upload my writing →
            </button>
          </div>
        </div>
      )}

      {/* Completion banner */}
      {showOnboardingSuccess && (
        <div style={{
          border: '1px solid #6B1FFF', borderRadius: '2px',
          padding: '12px 16px', fontFamily: JET,
          color: '#6B1FFF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em',
          marginBottom: '20px', marginTop: '20px',
        }}>
          Your style profile is active — Verbaly writes like you now.
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontFamily: CPR, fontSize: 'clamp(22px, 3vw, 30px)', fontWeight: '700', color: '#0E0E0E', letterSpacing: '-0.02em', marginBottom: '4px', textTransform: 'uppercase' }}>
          Style Profile
        </h1>
        <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
          Upload your writing. Verbaly reads it, and your voice is learned from it.
        </p>
      </div>

      {/* Notice */}
      {notice && (
        <div style={{
          border: '1px solid #6B1FFF', borderRadius: '2px',
          padding: '10px 14px', fontFamily: JET,
          color: '#6B1FFF', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em',
          marginBottom: '20px',
        }}>
          ✓ {notice}
        </div>
      )}

      {/* Profile strength */}
      <div style={{ ...CARD, padding: '18px 22px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em' }}>
            Profile strength
          </span>
          <span style={{ fontFamily: JET, color: '#6B1FFF', fontSize: '11px', fontWeight: '500', letterSpacing: '.1em' }}>
            {styleStrengthPct}%
          </span>
        </div>
        <div style={{ backgroundColor: '#F0F0F0', height: '4px', overflow: 'hidden' }}>
          <div style={{
            backgroundColor: '#6B1FFF', height: '100%',
            width: `${styleStrengthPct}%`,
            transition: 'width 0.8s ease',
          }} />
        </div>
        <p style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', marginTop: '8px', lineHeight: 1.6 }}>
          {totalWords} words uploaded · {milestoneLabel}
        </p>
      </div>

      {/* Preset profiles */}
      <div style={{ ...CARD, padding: '20px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '4px' }}>
              Preset Profiles
            </h2>
            <p style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
              {activePreset ? `"${activePreset}" is active.` : 'Your personal style profile is active.'}
            </p>
          </div>
          {activePreset && (
            <button onClick={handleClearPreset} disabled={presetSaving}
              style={{
                background: 'transparent', border: '1px solid #E0E0E0',
                borderRadius: '2px', padding: '6px 14px',
                fontFamily: JET, color: '#888880', fontSize: '10px',
                textTransform: 'uppercase', letterSpacing: '.1em',
                cursor: 'pointer',
              }}>
              Use my profile
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_PROFILES.map((p) => {
            const active = activePreset === p.name
            return (
              <div key={p.name} style={{
                border: active ? '1px solid #6B1FFF' : '1px solid #E0E0E0',
                borderLeft: active ? '3px solid #6B1FFF' : '1px solid #E0E0E0',
                borderRadius: '2px', padding: '16px',
                backgroundColor: '#FFFFFF', position: 'relative',
              }}>
                {active && (
                  <span style={{
                    position: 'absolute', top: '12px', right: '12px',
                    fontFamily: JET, fontSize: '10px', fontWeight: '500',
                    textTransform: 'uppercase', letterSpacing: '.15em',
                    color: '#6B1FFF', border: '1px solid #6B1FFF',
                    borderRadius: '2px', padding: '2px 6px',
                  }}>Active</span>
                )}
                <div style={{ fontFamily: JET, fontSize: '16px', color: '#6B1FFF', marginBottom: '8px' }}>{p.sym}</div>
                <div style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '6px' }}>
                  {p.name}
                </div>
                <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', lineHeight: '1.6', marginBottom: '14px' }}>
                  {p.description}
                </p>
                <button
                  onClick={() => handleSelectPreset(p.name)}
                  disabled={presetSaving || active}
                  style={{
                    backgroundColor: active ? 'transparent' : '#0E0E0E',
                    color: active ? '#6B1FFF' : '#FFFFFF',
                    border: active ? '1px solid #6B1FFF' : 'none',
                    borderRadius: '2px', padding: '7px 16px',
                    fontFamily: JET, fontSize: '10px', fontWeight: '500',
                    textTransform: 'uppercase', letterSpacing: '.1em',
                    cursor: active ? 'default' : 'pointer',
                  }}>
                  {active ? 'Active' : 'Use this profile'}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Upload + Traits grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Upload */}
        <div>
          <div
            id="vb-upload-card"
            style={{
              ...CARD,
              padding: '20px',
              marginBottom: '12px',
              borderLeft: showUploadTour ? '3px solid #6B1FFF' : '1px solid #E0E0E0',
              position: 'relative',
            }}
          >
            <h2 style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '18px' }}>
              Upload a writing sample
            </h2>

            {showUploadTour && (
              <div style={{
                position: 'absolute', top: '14px', right: '14px',
                border: '1px solid #6B1FFF', borderRadius: '2px',
                padding: '10px 12px', fontFamily: JET,
                color: '#0E0E0E', fontSize: '11px', lineHeight: 1.5,
                maxWidth: '280px', backgroundColor: '#FFFFFF',
              }}>
                Upload essays, assignments, emails — anything you wrote. The more that is uploaded, the better Verbaly sounds like you.
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '7px' }}>
                Filename / Title
              </label>
              <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)}
                placeholder="e.g. My Blog Post" style={INPUT_STYLE} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontFamily: JET, color: '#888880', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.15em', marginBottom: '7px' }}>
                Content
              </label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="Paste your writing here — emails, essays, blog posts."
                rows={8} style={{ ...INPUT_STYLE, lineHeight: '1.65', resize: 'vertical', minHeight: '120px' }}
              />
              {content && (
                <div style={{ fontFamily: JET, color: '#888880', fontSize: '10px', textAlign: 'right', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '.1em' }}>
                  {content.split(/\s+/).filter(Boolean).length} words
                </div>
              )}
            </div>

            {error && (
              <div style={{ border: '1px solid #DC2626', borderRadius: '2px', padding: '10px 14px', fontFamily: JET, color: '#DC2626', fontSize: '11px', marginBottom: '12px' }}>
                {error}
              </div>
            )}

            <button onClick={handleUpload} disabled={uploading}
              style={{
                backgroundColor: uploading ? '#E0E0E0' : '#0E0E0E',
                color: uploading ? '#888880' : '#FFFFFF',
                border: 'none', borderRadius: '2px',
                padding: '11px 20px', fontFamily: JET, fontSize: '11px', fontWeight: '500',
                textTransform: 'uppercase', letterSpacing: '.12em',
                cursor: uploading ? 'not-allowed' : 'pointer', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
              {uploading ? <Spinner text="Uploading…" /> : 'Upload sample'}
            </button>
          </div>

          {/* Samples list */}
          {samples.length > 0 && (
            <div style={{ ...CARD, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #E0E0E0' }}>
                <span style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.12em' }}>
                  Samples ({samples.length})
                </span>
              </div>
              {samples.map((s) => (
                <div key={s.id} style={{
                  padding: '11px 16px', borderBottom: '1px solid #F0F0F0',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px' }}>{s.filename}</div>
                    <div style={{ fontFamily: JET, color: '#888880', fontSize: '10px', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '.08em' }}>
                      {s.word_count} words
                    </div>
                  </div>
                  <button onClick={() => handleDeleteSample(s.id)} style={{
                    background: 'transparent', border: 'none', fontFamily: JET,
                    color: '#888880', cursor: 'pointer', fontSize: '16px', padding: '4px 8px', lineHeight: 1,
                  }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Style traits */}
        <div>
          <div style={{ ...CARD, overflow: 'hidden' }}>
            <div style={{
              padding: '14px 16px', borderBottom: '1px solid #E0E0E0',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h2 style={{ fontFamily: JET, color: '#0E0E0E', fontSize: '11px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '.15em' }}>
                Style traits
              </h2>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || samples.length === 0}
                style={{
                  backgroundColor: analyzing || samples.length === 0 ? '#E0E0E0' : '#0E0E0E',
                  color: analyzing || samples.length === 0 ? '#888880' : '#FFFFFF',
                  border: 'none', borderRadius: '2px', padding: '7px 14px',
                  fontFamily: JET, fontSize: '10px', fontWeight: '500',
                  textTransform: 'uppercase', letterSpacing: '.1em',
                  cursor: analyzing || samples.length === 0 ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px',
                }}>
                {analyzing ? <Spinner text="Analyzing…" /> : 'Analyze style'}
              </button>
            </div>

            {!hasStyleData ? (
              <div style={{ padding: '48px 20px', textAlign: 'center' }}>
                <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '4px' }}>
                  No style data yet
                </p>
                <p style={{ fontFamily: JET, color: '#888880', fontSize: '11px' }}>
                  Upload samples, then click Analyze Style.
                </p>
              </div>
            ) : (
              <div style={{ padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {STYLE_DIMENSIONS.map((key) => {
                  const displayItems = traitToDisplayItems(key, traitMap[key])
                  if (displayItems.length === 0) return null
                  const cfg = TRAIT_LABELS[key]
                  return (
                    <div key={key} style={{ border: '1px solid #E0E0E0', borderRadius: '2px', padding: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div>
                          <div style={{ fontFamily: JET, fontSize: '10px', fontWeight: '500', letterSpacing: '.15em', color: '#6B1FFF', textTransform: 'uppercase', marginBottom: '2px' }}>
                            {cfg.label}
                          </div>
                          <div style={{ fontFamily: JET, fontSize: '10px', color: '#888880', letterSpacing: '.05em' }}>{cfg.desc}</div>
                        </div>
                        <span style={{
                          fontFamily: JET, fontSize: '10px', fontWeight: '500',
                          textTransform: 'uppercase', letterSpacing: '.15em',
                          color: '#6B1FFF', border: '1px solid #6B1FFF',
                          borderRadius: '2px', padding: '2px 6px',
                        }}>
                          {displayItems.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                        {displayItems.map((item, i) => (
                          <span key={i} style={{
                            border: '1px solid #E0E0E0',
                            borderRadius: '2px',
                            padding: '4px 9px',
                            fontFamily: JET, fontSize: '10px', color: '#888880',
                            textTransform: 'uppercase', letterSpacing: '.08em',
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
