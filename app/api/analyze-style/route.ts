import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface PosSummary {
  noun_count: number
  verb_count: number
  adjective_count: number
  adverb_count: number
  pronoun_count: number
  adj_to_noun_ratio: number
  adv_to_verb_ratio: number
  most_common_noun: string
  most_common_verb: string
  most_common_adjective: string
}

interface DistinctiveVocabulary {
  characteristic_words: string[]
  favorite_transitions: string[]
  unusual_expressions: string[]
  non_ai_phrases: string[]
}

interface PunctuationPatterns {
  omission_patterns: string[]
  addition_patterns: string[]
  overall_style: 'sparse' | 'standard' | 'heavy'
  specific_deviations: string[]
}

interface SentenceStructure {
  avg_length: number
  short_sentence_pct: number
  long_sentence_pct: number
  uses_fragments: boolean
  fragment_frequency: 'never' | 'rare' | 'occasional' | 'frequent'
  run_on_tendency: boolean
  parenthetical_frequency: 'never' | 'rare' | 'occasional' | 'frequent'
  common_openers: string[]
}

interface VoiceMarkers {
  first_person_pct: number
  second_person_pct: number
  third_person_pct: number
  active_voice_pct: number
  formality_score: number
  hedging_frequency: 'low' | 'medium' | 'high'
  expressiveness_score: number
}

interface DeepAnalysis {
  pos_summary: PosSummary
  distinctive_vocabulary: DistinctiveVocabulary
  punctuation_patterns: PunctuationPatterns
  sentence_structure: SentenceStructure
  voice_markers: VoiceMarkers
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
          content: `Analyze these writing samples and return a JSON object with exactly this structure:
{
  "pos_summary": {
    "noun_count": number, "verb_count": number, "adjective_count": number,
    "adverb_count": number, "pronoun_count": number,
    "adj_to_noun_ratio": number, "adv_to_verb_ratio": number,
    "most_common_noun": string, "most_common_verb": string, "most_common_adjective": string
  },
  "distinctive_vocabulary": {
    "characteristic_words": string[],
    "favorite_transitions": string[],
    "unusual_expressions": string[],
    "non_ai_phrases": string[]
  },
  "punctuation_patterns": {
    "omission_patterns": string[],
    "addition_patterns": string[],
    "overall_style": "sparse" | "standard" | "heavy",
    "specific_deviations": string[]
  },
  "sentence_structure": {
    "avg_length": number,
    "short_sentence_pct": number,
    "long_sentence_pct": number,
    "uses_fragments": boolean,
    "fragment_frequency": "never" | "rare" | "occasional" | "frequent",
    "run_on_tendency": boolean,
    "parenthetical_frequency": "never" | "rare" | "occasional" | "frequent",
    "common_openers": string[]
  },
  "voice_markers": {
    "first_person_pct": number,
    "second_person_pct": number,
    "third_person_pct": number,
    "active_voice_pct": number,
    "formality_score": number,
    "hedging_frequency": "low" | "medium" | "high",
    "expressiveness_score": number
  }
}

Writing samples:
${combinedSamples}`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let analysis: DeepAnalysis
    try {
      // Strip optional markdown fences before parsing
      const cleaned = responseText.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse style analysis' }, { status: 500 })
    }

    const { pos_summary, distinctive_vocabulary, punctuation_patterns, sentence_structure, voice_markers } = analysis

    // ── Derived scores (per spec) ─────────────────────────────────────────────
    const posSummaryScore = Math.min(
      Math.round((pos_summary.adj_to_noun_ratio + pos_summary.adv_to_verb_ratio) * 50),
      100
    )
    const distinctiveScore = Math.min(distinctive_vocabulary.characteristic_words.length * 6, 100)
    const punctScore =
      punctuation_patterns.overall_style === 'sparse'
        ? 30
        : punctuation_patterns.overall_style === 'standard'
        ? 60
        : 85
    const sentenceStructureScore = Math.min(
      Math.round(
        Math.abs(50 - sentence_structure.short_sentence_pct) +
          Math.abs(50 - sentence_structure.long_sentence_pct)
      ),
      100
    )
    const voiceMarkersScore = voice_markers.expressiveness_score

    // ── Display trait values (per spec) ──────────────────────────────────────
    const vocabularyRichnessValue =
      voice_markers.formality_score > 70
        ? 'Rich, sophisticated vocabulary'
        : voice_markers.formality_score > 40
        ? 'Balanced everyday vocabulary'
        : 'Casual, conversational vocabulary'

    const sentenceVarietyValue =
      sentence_structure.avg_length < 10
        ? 'Short, punchy sentences'
        : sentence_structure.avg_length > 20
        ? 'Long, complex sentences'
        : 'Mixed sentence lengths'

    const toneValue =
      voice_markers.formality_score > 70
        ? 'Formal & academic'
        : voice_markers.formality_score > 40
        ? 'Semi-formal & balanced'
        : 'Casual & conversational'

    const voiceValue =
      voice_markers.first_person_pct > 50
        ? 'Strong first-person voice'
        : voice_markers.third_person_pct > 50
        ? 'Third-person perspective'
        : 'Mixed perspective'

    // ── Build rows to upsert ─────────────────────────────────────────────────
    const now = new Date().toISOString()

    const deepTraits = [
      {
        user_id: userId,
        trait_name: 'pos_summary',
        trait_value: JSON.stringify(pos_summary),
        score: posSummaryScore,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'distinctive_vocabulary',
        trait_value: JSON.stringify(distinctive_vocabulary),
        score: distinctiveScore,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'punctuation_patterns',
        trait_value: JSON.stringify(punctuation_patterns),
        score: punctScore,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'sentence_structure',
        trait_value: JSON.stringify(sentence_structure),
        score: sentenceStructureScore,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'voice_markers',
        trait_value: JSON.stringify(voice_markers),
        score: voiceMarkersScore,
        updated_at: now,
      },
    ]

    const displayTraits = [
      {
        user_id: userId,
        trait_name: 'vocabulary_richness',
        trait_value: vocabularyRichnessValue,
        score: posSummaryScore,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'sentence_variety',
        trait_value: sentenceVarietyValue,
        score: Math.min(
          Math.round(sentence_structure.short_sentence_pct + sentence_structure.long_sentence_pct),
          100
        ),
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'tone',
        trait_value: toneValue,
        score: voice_markers.formality_score,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'voice',
        trait_value: voiceValue,
        score: voice_markers.active_voice_pct,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'punctuation_style',
        trait_value: punctuation_patterns.overall_style,
        score: punctScore,
        updated_at: now,
      },
    ]

    const allTraits = [...deepTraits, ...displayTraits]

    // ── Persist to Supabase (upsert on user_id + trait_name) ─────────────────
    const supabase = await createClient()

    const { data: upsertedTraits, error: upsertError } = await supabase
      .from('style_traits')
      .upsert(allTraits, { onConflict: 'user_id,trait_name' })
      .select()

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 })
    }

    // ── Profile strength = average of display trait scores ───────────────────
    const profileStrength = Math.round(
      displayTraits.reduce((sum, t) => sum + t.score, 0) / displayTraits.length
    )

    return NextResponse.json({
      traits: upsertedTraits,
      profileStrength,
    })
  } catch (error) {
    console.error('Analyze style error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
