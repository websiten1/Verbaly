import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

type HedgingFrequency = 'low' | 'medium' | 'high'
type OverallStyle = 'sparse' | 'standard' | 'heavy'
type EmotionalVsClinical = 'emotional' | 'balanced' | 'clinical'
type FormalityLevel = 'low' | 'medium' | 'high'

interface VocabularyAnalysis {
  frequent_words: string[]
  never_used_words: string[]
  formality_level: FormalityLevel
  contractions_used: boolean
  slang_used: boolean
  academic_language_used: boolean
}

interface PhrasesAnalysis {
  sentence_openers: string[]
  transition_phrases: string[]
  argument_introductions: string[]
  paragraph_endings: string[]
}

interface PunctuationAnalysis {
  uses_em_dashes: boolean
  uses_ellipses: boolean
  uses_semicolons: boolean
  avg_sentence_length_words: number
  sentence_rhythm: 'short_punchy' | 'balanced' | 'long_complex'
  omission_patterns: string[]
  addition_patterns: string[]
  overall_style: OverallStyle
  specific_deviations: string[]
}

interface StructureAnalysis {
  avg_paragraph_length_sentences: number
  one_sentence_paragraph_ratio: number
  argument_order_patterns: string[]
}

interface VoiceAnalysis {
  first_person_pct: number
  second_person_pct: number
  third_person_pct: number
  active_voice_pct: number
  formality_score: number
  hedging_frequency: HedgingFrequency
  expressiveness_score: number
  emotional_vs_clinical: EmotionalVsClinical
}

interface NeverDoesAnalysis {
  banned_words: string[]
  banned_phrases: string[]
  banned_sentence_starts: string[]
}

interface StyleAnalysis {
  vocabulary: VocabularyAnalysis
  phrases: PhrasesAnalysis
  punctuation: PunctuationAnalysis
  structure: StructureAnalysis
  voice: VoiceAnalysis
  never_does: NeverDoesAnalysis
  unique_fingerprints: string[]
  sentence_rhythm_ratio: {
    short_sentence_pct: number
    long_sentence_pct: number
  }
}

function extractClaudeFirstText(content: unknown): string {
  if (!Array.isArray(content)) return ''
  for (const part of content) {
    if (!part || typeof part !== 'object') continue
    const maybePart = part as { type?: unknown; text?: unknown }
    if (maybePart.type === 'text' && typeof maybePart.text === 'string') return maybePart.text
  }
  return ''
}

export async function POST(request: NextRequest) {
  try {
    const { userId, samples } = await request.json()

    if (!userId || !samples || !Array.isArray(samples) || samples.length === 0) {
      return NextResponse.json({ error: 'userId and samples array are required' }, { status: 400 })
    }

    const combinedSamples = samples.join('\n\n---\n\n')

    // ── Deep linguistic analysis via Claude ──────────────────────────────────
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      system:
        'You are an expert computational linguist and writing style analyst. Analyze the provided writing samples with extreme precision. Return ONLY a valid JSON object with no markdown, no explanation.',
      messages: [
        {
          role: 'user',
          content: `Analyze these writing samples and return a JSON object with EXACTLY these keys.

{
  "vocabulary": {
    "frequent_words": [string],
    "never_used_words": [string],
    "formality_level": "low" | "medium" | "high",
    "contractions_used": boolean,
    "slang_used": boolean,
    "academic_language_used": boolean
  },
  "phrases": {
    "sentence_openers": [string],
    "transition_phrases": [string],
    "argument_introductions": [string],
    "paragraph_endings": [string]
  },
  "punctuation": {
    "uses_em_dashes": boolean,
    "uses_ellipses": boolean,
    "uses_semicolons": boolean,
    "avg_sentence_length_words": number,
    "sentence_rhythm": "short_punchy" | "balanced" | "long_complex",
    "omission_patterns": [string],
    "addition_patterns": [string],
    "overall_style": "sparse" | "standard" | "heavy",
    "specific_deviations": [string]
  },
  "structure": {
    "avg_paragraph_length_sentences": number,
    "one_sentence_paragraph_ratio": number,
    "argument_order_patterns": [string]
  },
  "voice": {
    "first_person_pct": number,
    "second_person_pct": number,
    "third_person_pct": number,
    "active_voice_pct": number,
    "formality_score": number,
    "hedging_frequency": "low" | "medium" | "high",
    "expressiveness_score": number,
    "emotional_vs_clinical": "emotional" | "balanced" | "clinical"
  },
  "never_does": {
    "banned_words": [string],
    "banned_phrases": [string],
    "banned_sentence_starts": [string]
  },
  "unique_fingerprints": [string],
  "sentence_rhythm_ratio": {
    "short_sentence_pct": number,
    "long_sentence_pct": number
  }
}

Writing samples:
${combinedSamples}`,
        },
      ],
    })

    const responseText = extractClaudeFirstText(message.content)

    if (!responseText.trim()) {
      console.error('analyze-style: Claude returned empty content')
      return NextResponse.json({ error: 'Claude returned an empty response.' }, { status: 502 })
    }

    let analysis: StyleAnalysis
    try {
      // Strip optional markdown fences before parsing
      const cleaned = responseText
        .replace(/^```[a-z]*\n?/i, '')
        .replace(/```\s*$/i, '')
        .trim()

      // Be resilient: if Claude prepends/appends text, extract the outer JSON object.
      const start = cleaned.indexOf('{')
      const end = cleaned.lastIndexOf('}')
      const jsonCandidate = start !== -1 && end !== -1 && end > start ? cleaned.slice(start, end + 1) : cleaned

      analysis = JSON.parse(jsonCandidate)
    } catch {
      console.error('analyze-style: Failed to parse Claude JSON', {
        responsePreview: responseText.slice(0, 500),
      })
      return NextResponse.json({ error: 'Failed to parse style analysis' }, { status: 500 })
    }

    const analysisRecord = analysis as unknown as Record<string, unknown>
    const requiredKeys: (keyof StyleAnalysis)[] = [
      'vocabulary',
      'phrases',
      'punctuation',
      'structure',
      'voice',
      'never_does',
      'unique_fingerprints',
      'sentence_rhythm_ratio',
    ]

    for (const key of requiredKeys) {
      const value = analysisRecord[key]
      if (!value) {
        console.error('analyze-style: Invalid trait shape (missing key)', { key })
        return NextResponse.json(
          { error: `Invalid style analysis shape: missing "${String(key)}"` },
          { status: 500 }
        )
      }
    }

    const asRecord = (v: unknown) => (v && typeof v === 'object' ? (v as Record<string, unknown>) : null)
    const ensureArrayStrings = (v: unknown) =>
      Array.isArray(v) && v.every((x) => typeof x === 'string')

    const vocab = asRecord(analysis.vocabulary)
    const phrases = asRecord(analysis.phrases)
    const punctuation = asRecord(analysis.punctuation)
    const structure = asRecord(analysis.structure)
    const voice = asRecord(analysis.voice)
    const neverDoes = asRecord(analysis.never_does)

    if (!vocab || !phrases || !punctuation || !structure || !voice || !neverDoes) {
      console.error('analyze-style: Invalid nested trait objects')
      return NextResponse.json({ error: 'Invalid style analysis shape: nested traits must be objects' }, { status: 500 })
    }

    if (!ensureArrayStrings(vocab.frequent_words) || !ensureArrayStrings(vocab.never_used_words)) {
      return NextResponse.json({ error: 'Invalid style analysis shape: vocabulary lists must be string arrays' }, { status: 500 })
    }
    if (!ensureArrayStrings(phrases.sentence_openers) || !ensureArrayStrings(phrases.transition_phrases)) {
      return NextResponse.json({ error: 'Invalid style analysis shape: phrases lists must be string arrays' }, { status: 500 })
    }
    if (!ensureArrayStrings(neverDoes.banned_words) || !ensureArrayStrings(neverDoes.banned_phrases) || !ensureArrayStrings(neverDoes.banned_sentence_starts)) {
      return NextResponse.json({ error: 'Invalid style analysis shape: never_does lists must be string arrays' }, { status: 500 })
    }
    if (!Array.isArray(analysis.unique_fingerprints) || !analysis.unique_fingerprints.every((x) => typeof x === 'string')) {
      return NextResponse.json(
        { error: 'Invalid style analysis shape: unique_fingerprints must be an array' },
        { status: 500 }
      )
    }

    // Trim lists to keep trait_value compact (helps if trait_value is still VARCHAR(255)).
    const trimmed: StyleAnalysis = {
      ...analysis,
      vocabulary: {
        ...analysis.vocabulary,
        frequent_words: analysis.vocabulary.frequent_words.slice(0, 8),
        never_used_words: analysis.vocabulary.never_used_words.slice(0, 8),
      },
      phrases: {
        ...analysis.phrases,
        sentence_openers: analysis.phrases.sentence_openers.slice(0, 4),
        transition_phrases: analysis.phrases.transition_phrases.slice(0, 4),
        argument_introductions: analysis.phrases.argument_introductions.slice(0, 4),
        paragraph_endings: analysis.phrases.paragraph_endings.slice(0, 4),
      },
      punctuation: {
        ...analysis.punctuation,
        omission_patterns: analysis.punctuation.omission_patterns.slice(0, 3),
        addition_patterns: analysis.punctuation.addition_patterns.slice(0, 3),
        specific_deviations: analysis.punctuation.specific_deviations.slice(0, 4),
      },
      structure: {
        ...analysis.structure,
        argument_order_patterns: analysis.structure.argument_order_patterns.slice(0, 4),
      },
      voice: { ...analysis.voice },
      never_does: {
        ...analysis.never_does,
        banned_words: analysis.never_does.banned_words.slice(0, 12),
        banned_phrases: analysis.never_does.banned_phrases.slice(0, 6),
        banned_sentence_starts: analysis.never_does.banned_sentence_starts.slice(0, 6),
      },
      unique_fingerprints: analysis.unique_fingerprints.slice(0, 8),
      sentence_rhythm_ratio: { ...analysis.sentence_rhythm_ratio },
    }

    // ── Build rows to upsert ─────────────────────────────────────────────────
    const now = new Date().toISOString()

    const categoryTraits = [
      {
        user_id: userId,
        trait_name: 'vocabulary',
        trait_value: JSON.stringify(trimmed.vocabulary),
        score: Math.min(trimmed.vocabulary.frequent_words.length * 10, 100),
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'phrases',
        trait_value: JSON.stringify(trimmed.phrases),
        score: Math.min(trimmed.phrases.sentence_openers.length * 10, 100),
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'punctuation',
        trait_value: JSON.stringify(trimmed.punctuation),
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'structure',
        trait_value: JSON.stringify(trimmed.structure),
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'voice',
        trait_value: JSON.stringify(trimmed.voice),
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'never_does',
        trait_value: JSON.stringify(trimmed.never_does),
        score: 80,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'sentence_rhythm',
        trait_value: JSON.stringify(trimmed.sentence_rhythm_ratio),
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'unique_fingerprints',
        trait_value: JSON.stringify(trimmed.unique_fingerprints),
        score: 80,
        updated_at: now,
      },
    ]

    // ── Persist to Supabase (upsert on user_id + trait_name) ─────────────────
    const supabase = await createClient()

    const { data: upsertedTraits, error: upsertError } = await supabase
      .from('style_traits')
      .upsert(categoryTraits, { onConflict: 'user_id,trait_name' })
      .select()

    if (upsertError) {
      console.error('analyze-style: Upsert style_traits failed', upsertError)
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    return NextResponse.json({
      traits: upsertedTraits,
      profileStrength: 75,
    })
  } catch (error) {
    console.error('Analyze style error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
