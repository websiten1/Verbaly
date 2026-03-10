import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

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

interface StyleTrait {
  trait_name: string
  trait_value: string
  score: number
}

function safeParseJson<T>(value: string): T | null {
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, originalText, intensity } = await request.json()

    if (!userId || !originalText || !intensity) {
      return NextResponse.json(
        { error: 'userId, originalText, and intensity are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch user's style traits
    const { data: traits } = await supabase
      .from('style_traits')
      .select('*')
      .eq('user_id', userId)

    const traitList: StyleTrait[] = traits ?? []

    // Extract deep traits by name and parse their JSON values
    const findTrait = (name: string): StyleTrait | undefined =>
      traitList.find((t) => t.trait_name === name)

    const distinctiveVocabTrait = findTrait('distinctive_vocabulary')
    const punctuationTrait = findTrait('punctuation_patterns')
    const sentenceStructTrait = findTrait('sentence_structure')
    const voiceMarkersTrait = findTrait('voice_markers')

    const dv = distinctiveVocabTrait
      ? safeParseJson<DistinctiveVocabulary>(distinctiveVocabTrait.trait_value)
      : null
    const pp = punctuationTrait
      ? safeParseJson<PunctuationPatterns>(punctuationTrait.trait_value)
      : null
    const ss = sentenceStructTrait
      ? safeParseJson<SentenceStructure>(sentenceStructTrait.trait_value)
      : null
    const vm = voiceMarkersTrait
      ? safeParseJson<VoiceMarkers>(voiceMarkersTrait.trait_value)
      : null

    // ── Build intensity instruction ───────────────────────────────────────────
    const intensityInstruction =
      intensity <= 3
        ? 'Make subtle vocabulary substitutions only, preserve most structure.'
        : intensity <= 6
        ? 'Restructure sentences to match their patterns and substitute vocabulary.'
        : 'Fully transform the text — sentence structure, vocabulary, punctuation patterns, voice, everything.'

    // ── Build the detailed style guide prompt ─────────────────────────────────
    let styleGuide = `Rewrite the following text to match this person's exact writing style. Intensity level: ${intensity}/10 (1=very subtle changes, 10=complete transformation to their voice).

THEIR WRITING STYLE PROFILE:`

    if (dv) {
      styleGuide += `

Distinctive vocabulary - use these characteristic words/phrases naturally where appropriate: ${dv.characteristic_words.join(', ')}
Favorite transitions: ${dv.favorite_transitions.join(', ')}
Authentic non-AI phrases to weave in: ${dv.non_ai_phrases.join(', ')}`
    }

    if (ss) {
      styleGuide += `

Sentence structure: Average ${ss.avg_length} words per sentence. ${ss.short_sentence_pct}% short sentences (<8 words), ${ss.long_sentence_pct}% long. Fragment frequency: ${ss.fragment_frequency}. Common sentence openers: ${ss.common_openers.join(', ')}.`
    }

    if (pp) {
      styleGuide += `

Punctuation style: ${pp.overall_style}. Specific patterns: ${pp.specific_deviations.join('; ')}.`
    }

    if (vm) {
      styleGuide += `

Voice: ${vm.first_person_pct}% first-person. Active voice: ${vm.active_voice_pct}%. Formality: ${vm.formality_score}/100. Hedging: ${vm.hedging_frequency}.`
    }

    styleGuide += `

At intensity ${intensity}/10: ${intensityInstruction}

CRITICAL HUMAN AUTHENTICITY RULES — apply ALL of these without exception:
- Use contractions naturally throughout (don't, can't, it's, I've, they're, we're, wouldn't)
- Occasionally start 1-2 sentences with 'And', 'But', or 'Because' — this is natural, not wrong
- Include 1-2 sentence fragments for rhythm and emphasis. Like this. Or just this.
- Mix sentence lengths dramatically — some very short (3-5 words), some long and flowing with multiple clauses
- Avoid perfectly parallel structure — real humans are slightly inconsistent in how they list things
- If the user's style includes comma splices, use them, this is natural
- NEVER use any of these AI-giveaway words or phrases: delve, crucial, it is worth noting, furthermore, in conclusion, it is important to note, one must consider, plays a crucial role, it can be argued, in today's world, the fact that, in order to, utilize (use 'use' instead), leverage (as a verb), multifaceted, nuanced, landscape (metaphorically), ecosystem (metaphorically), paradigm, synergy, robust, seamlessly, groundbreaking, game-changing, cutting-edge, it's worth mentioning, not only...but also (overused pattern)
- Never start two consecutive sentences the same way
- Add natural filler or transition phrases the user actually uses based on their style traits
- Write as if a real human typed this slightly quickly — authentic, not over-polished

Return ONLY the rewritten text, no explanation.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: `${styleGuide}\n\nText to rewrite:\n\n${originalText}`,
        },
      ],
    })

    const rewrittenText =
      message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    if (!rewrittenText) {
      return NextResponse.json({ error: 'Failed to generate rewrite' }, { status: 500 })
    }

    // ── Calculate match score ─────────────────────────────────────────────────
    const hasTraits = traitList.length > 0
    const baseScore = hasTraits ? 78 : 65
    const intensityBonus = Math.round((intensity / 10) * 12)
    const matchScore = Math.min(95, baseScore + intensityBonus)

    // ── Save to rewrites table ────────────────────────────────────────────────
    const { error: insertError } = await supabase.from('rewrites').insert({
      user_id: userId,
      original_text: originalText,
      rewritten_text: rewrittenText,
      intensity,
      match_score: matchScore,
    })

    if (insertError) {
      console.error('Failed to save rewrite:', insertError)
      // Don't fail the request just because we couldn't save
    }

    return NextResponse.json({
      rewrittenText,
      matchScore,
    })
  } catch (error) {
    console.error('Rewrite error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
