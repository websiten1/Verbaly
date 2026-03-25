'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { WritingSample, StyleTrait } from '@/lib/types'

interface PresetProfile { name: string; description: string; icon: string }

const PRESET_PROFILES: PresetProfile[] = [
  { name: 'The Academic',       icon: '🎓', description: 'Formal sentences with citations, passive voice, and hedging — used in academic disciplines.' },
  { name: 'The Casual Student', icon: '😊', description: 'Relaxed and conversational. Contractions are used throughout, and short sentences are the default.' },
  { name: 'The Creative Writer', icon: '✍️', description: 'Expressive and bold. Metaphors, em-dashes, and sensory language are used — and the rhythm varies.' },
  { name: 'The Professional',   icon: '💼', description: 'Clear and direct. Active voice is used, and statements are made without filler.' },
]

const TRAIT_CONFIG = [
  { key: 'vocabulary',  label: 'Vocabulary Fingerprint', desc: 'Your most-used words, mapped',               accent: '#54F2F2', bg: 'rgba(84,242,242,0.08)',  border: 'rgba(84,242,242,0.2)' },
  { key: 'phrases',     label: 'Favorite Phrases',       desc: 'Expressions that appear again and again',     accent: '#059669', bg: 'rgba(5,150,105,0.08)',   border: 'rgba(5,150,105,0.2)'  },
  { key: 'punctuation', label: 'Punctuation Patterns',   desc: 'The way commas, dashes, and stops are used',  accent: '#7C3AED', bg: 'rgba(124,58,237,0.08)',  border: 'rgba(124,58,237,0.2)' },
  { key: 'structure',   label: 'Sentence Structure',     desc: 'Sentence length and the rhythm behind it',    accent: '#D97706', bg: 'rgba(217,119,6,0.08)',   border: 'rgba(217,119,6,0.2)'  },
  { key: 'voice',       label: 'Voice Markers',          desc: 'Tone, formality, and the voice behind the text', accent: '#DB2777', bg: 'rgba(219,39,119,0.08)',  border: 'rgba(219,39,119,0.2)' },
  { key: 'never_does',  label: 'Never Does',             desc: 'Patterns that never appeared in your writing', accent: '#042A2B', bg: 'rgba(4,42,43,0.06)',     border: 'rgba(4,42,43,0.15)'   },
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
        `Overall punctuation style: ${overall ?? '—'}`,
        usesEm !== null ? `Em-dashes: ${usesEm ? 'yes' : 'no'}` : '—',
        usesEll !== null ? `Ellipses: ${usesEll ? 'yes' : 'no'}` : '—',
        usesSemi !== null ? `Semicolons: ${usesSemi ? 'yes' : 'no'}` : '—',
        `Omission patterns: ${omissions.slice(0, 3).join(', ') || '—'}`,
        `Addition patterns: ${additions.slice(0, 3).join(', ') || '—'}`,
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
    if (samplesRes.error) {
      console.error('loadData: writing_samples failed', samplesRes.error)
      setError('Your writing samples could not be loaded. Please try again.')
      return
    }
    if (traitsRes.error) {
      console.error('loadData: style_traits failed', traitsRes.error)
      setError('Your style traits could not be loaded. Please try again.')
      return
    }
    if (profileRes.error) {
      // Keep the page usable even if preset_type is missing/misconfigured.
      console.error('loadData: profiles(preset_type) failed', profileRes.error)
    }
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

  // Mark onboarding complete once the user uploads enough words.
  useEffect(() => {
    const shouldComplete = onboardingComplete === false && totalWords >= 500 && userId
    if (!shouldComplete) return

    const run = async () => {
      try {
        const { error: e } = await supabase.from('profiles').upsert(
          { user_id: userId as string, onboarding_complete: true },
          { onConflict: 'user_id' },
        )
        if (e) {
          console.error('onboarding_complete upsert failed', e)
          return
        }
        setOnboardingComplete(true)
        setShowOnboardingSuccess(true)
        setTimeout(() => setShowOnboardingSuccess(false), 6000)
      } catch (err) {
        console.error('onboarding_complete update failed', err)
      }
    }

    run()
  }, [onboardingComplete, totalWords, userId, supabase])

  const handleSelectPreset = async (name: string) => {
    if (!userId) return
    setPresetSaving(true)
    try {
      const { error: e } = await supabase.from('profiles').upsert(
        { user_id: userId, preset_type: name },
        { onConflict: 'user_id' },
      )
      if (e) throw e
      setActivePreset(name)
      flash(`The "${name}" profile is now active.`)
    } catch {
      setError('Failed to save preset. Please try again.')
    } finally {
      setPresetSaving(false)
    }
  }

  const handleClearPreset = async () => {
    if (!userId) return
    setPresetSaving(true)
    try {
      const { error: e } = await supabase.from('profiles').upsert(
        { user_id: userId, preset_type: null },
        { onConflict: 'user_id' },
      )
      if (e) throw e
      setActivePreset(null)
      flash('Your personal profile is now active.')
    } catch {
      setError('Failed to switch back to personal profile. Please try again.')
    } finally {
      setPresetSaving(false)
    }
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
    } catch {
      setError('Failed to delete sample. Please try again.')
    }
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
      if (!res.ok) {
        console.error('handleAnalyze: analyze-style failed', { status: res.status, data })
        setError(data.error || 'The style analysis failed. Please try again.')
        return
      }
      parseTraits(data.traits ?? [])
      flash('Style analysis done.')
    } catch (e) {
      console.error('handleAnalyze: fetch error', e)
      setError('Something went wrong. Please try again.')
    }
    finally { setAnalyzing(false) }
  }

  const STYLE_DIMENSIONS = ['vocabulary', 'phrases', 'punctuation', 'structure', 'voice', 'never_does']
  const hasStyleData = STYLE_DIMENSIONS.some((k) => traitToDisplayItems(k, traitMap[k]).length > 0)

  const styleStrengthPct = Math.min(100, Math.round((totalWords / 3000) * 100))
  const milestoneLabel =
    totalWords < 500
      ? 'Starter — basic patterns were found'
      : totalWords < 1500
        ? 'Developing — your voice is getting clearer'
        : totalWords < 2500
          ? 'Strong — most patterns were captured'
          : 'Complete — your full profile is active'

  const shouldShowOnboarding = onboardingComplete === false && totalWords < 500
  const showUploadTour = shouldShowOnboarding && onboardingStage === 1

  const INPUT: React.CSSProperties = {
    width: '100%', backgroundColor: '#F9F8F5', border: '1px solid #E5E2D8',
    borderRadius: '10px', padding: '16px', color: '#16150F',
    fontSize: '14px', outline: 'none', fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <style>{`
        @keyframes vbPulse {
          0% { box-shadow: 0 0 0 0 rgba(84,242,242,0.28), 0 2px 12px rgba(26,110,255,0.08); }
          50% { box-shadow: 0 0 0 6px rgba(84,242,242,0.22), 0 0 40px rgba(84,242,242,0.18); }
          100% { box-shadow: 0 0 0 0 rgba(84,242,242,0.28), 0 2px 12px rgba(26,110,255,0.08); }
        }
      `}</style>

      {/* Onboarding overlay (first login) */}
      {shouldShowOnboarding && onboardingStage === 0 && (
        <div style={{
          position: 'fixed', inset: 0, background: '#042A2B', color: '#FFFFFF',
          zIndex: 50, display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '40px 20px'
        }}>
          <div style={{ maxWidth: '720px', margin: '0 auto', textAlign: 'left' }}>
            <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '46px', fontWeight: 400, marginBottom: '14px', letterSpacing: '-0.6px' }}>
              Your writing is read — and your voice is mapped from it.
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '16px', lineHeight: 1.7, marginBottom: '28px' }}>
              Verbaly reads your writing before it can sound like you. Upload at least 3 samples to get started.
            </p>
            <button
              onClick={() => {
                setOnboardingStage(1)
                document.getElementById('vb-upload-card')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
              style={{
                backgroundColor: '#54F2F2', color: '#042A2B', border: 'none',
                borderRadius: '12px', padding: '14px 22px', fontSize: '16px',
                fontWeight: 800, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '10px',
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
          backgroundColor: 'rgba(84,242,242,0.08)', border: '1px solid rgba(84,242,242,0.2)',
          borderRadius: '10px', padding: '14px 16px', color: '#042A2B', fontSize: '14px',
          marginBottom: '20px', marginTop: '20px',
          fontWeight: 700,
        }}>
          Your style profile is active — Verbaly writes like you now.
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: '48px' }}>
        <h1 style={{ fontFamily: 'Instrument Serif, serif', fontSize: '30px', fontWeight: '400', color: '#16150F', letterSpacing: '-0.5px', marginBottom: '4px' }}>
          Style Profile
        </h1>
        <p style={{ color: '#A09D95', fontSize: '14px' }}>
          Upload your writing. Verbaly reads it, and your voice is learned from it.
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
        backgroundColor: '#FFFFFF', border: '1px solid #E8ECF4',
        borderRadius: '12px', padding: '20px 24px', marginBottom: '48px',
        boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
          <span style={{ color: '#16150F', fontSize: '14px', fontWeight: '600' }}>Profile strength</span>
          <span style={{ color: '#042A2B', fontSize: '14px', fontWeight: '700' }}>{styleStrengthPct}%</span>
        </div>
        <div style={{ backgroundColor: '#F0EDE4', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
          <div style={{
            backgroundColor: '#54F2F2', height: '100%',
            width: `${styleStrengthPct}%`, borderRadius: '100px',
            transition: 'width 0.8s ease',
          }} />
        </div>
        <p style={{ color: '#A09D95', fontSize: '12px', marginTop: '8px' }}>
          {totalWords} words were read — upload more writing to strengthen your profile
          <br />
          {milestoneLabel}
        </p>
      </div>

      {/* Preset profiles */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8ECF4', borderRadius: '12px', padding: '24px', marginBottom: '48px', boxShadow: '0 2px 12px rgba(26,110,255,0.08)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>Preset Profiles</h2>
            <p style={{ color: '#A09D95', fontSize: '13px' }}>
              {activePreset ? `The "${activePreset}" profile is active.` : 'Your personal style profile is active.'}
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
              Switch to my profile
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
        <div
          id="vb-upload-card"
          style={{
            backgroundColor: '#FFFFFF',
            border: showUploadTour ? '2px solid rgba(84,242,242,0.9)' : '1px solid #E8ECF4',
            borderRadius: '12px',
            padding: '24px',
            marginBottom: '16px',
            boxShadow: showUploadTour ? '0 0 0 6px rgba(84,242,242,0.15), 0 2px 12px rgba(26,110,255,0.08)' : '0 2px 12px rgba(26,110,255,0.08)',
            animation: showUploadTour ? 'vbPulse 1.8s ease-in-out infinite' : undefined,
            position: 'relative',
          }}
        >
            <h2 style={{ color: '#16150F', fontSize: '15px', fontWeight: '600', marginBottom: '20px' }}>
              Upload a writing sample
            </h2>

          {showUploadTour && (
            <div style={{
              position: 'absolute',
              top: '14px',
              right: '14px',
              background: 'rgba(84,242,242,0.10)',
              border: '1px solid rgba(84,242,242,0.35)',
              borderRadius: '10px',
              padding: '10px 12px',
              color: '#042A2B',
              fontSize: '13px',
              lineHeight: 1.45,
              maxWidth: '320px',
              fontWeight: 600,
            }}>
              Upload essays, assignments, emails — anything you wrote. The more that is uploaded, the better Verbaly sounds like you.
            </div>
          )}

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
                placeholder="Paste your writing here — emails, essays, blog posts. The more real it is, the better."
                rows={8} style={{ ...INPUT, lineHeight: '1.6', resize: 'vertical', minHeight: '120px', padding: '16px' }}
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
            <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8ECF4', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,110,255,0.08)' }}>
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
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8ECF4', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 12px rgba(26,110,255,0.08)' }}>
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
                  Upload samples, then click Analyze Style. Your writing fingerprint will be shown.
                </p>
              </div>
            ) : (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {TRAIT_CONFIG.map(({ key, label, desc, accent, bg, border }) => {
                  const items = traitMap[key] ?? []
                  const displayItems = traitToDisplayItems(key, items)
                  if (displayItems.length === 0) return null
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
                          {displayItems.length}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {displayItems.map((item, i) => (
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
