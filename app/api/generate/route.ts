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

const PRESET_STYLE_GUIDES: Record<string, string> = {
  'The Academic':
    'Write in a formal academic voice. Use passive constructions where natural. Include hedging language such as "it could be argued", "research suggests", "evidence indicates". Construct long, complex sentences with multiple subordinate clauses. Use discipline-specific vocabulary and formal register. Reference ideas as if citing sources (e.g. "as scholars have noted"). Avoid contractions entirely.',
  'The Casual Student':
    'Write in a conversational, relaxed student voice. Use contractions everywhere — don\'t, can\'t, it\'s, I\'ve. Keep sentences short. Add filler words like "honestly", "pretty much", "like", "basically". Start some sentences with "And" or "But". Write how a real student would dash off an essay draft — not polished, but genuine.',
  'The Creative Writer':
    'Write expressively with rich metaphors and vivid sensory details. Vary sentence rhythm dramatically — short punchy lines. Then something longer, flowing, almost breathless with detail. Use em-dashes — like this — for asides. Use fragments for emphasis. Deliberately. Use unconventional punctuation to create rhythm and voice.',
  'The Professional':
    'Write with clarity and directness. Active voice throughout. No filler words, no hedging. Every sentence earns its place. Short and purposeful. Think in bullet points even when writing prose. Get to the point immediately and stay there.',
}

export async function POST(request: NextRequest) {
  try {
    const body: { userId?: string; prompt?: string; length?: string; tone?: number } =
      await request.json()
    const { userId, prompt, length, tone } = body

    if (!userId || !prompt || !length || tone === undefined) {
      return NextResponse.json(
        { error: 'userId, prompt, length, and tone are required' },
        { status: 400 }
      )
    }

    if (!['short', 'medium', 'long'].includes(length)) {
      return NextResponse.json({ error: 'length must be short, medium, or long' }, { status: 400 })
    }

    const supabase = await createClient()

    // Fetch profile (preset) and style traits in parallel
    const [profileResult, traitsResult] = await Promise.all([
      supabase.from('profiles').select('preset_type').eq('user_id', userId).maybeSingle(),
      supabase.from('style_traits').select('*').eq('user_id', userId),
    ])

    const presetType: string | null = profileResult.data?.preset_type ?? null
    const traitList: StyleTrait[] = traitsResult.data ?? []

    const targetWords =
      length === 'short' ? 150 : length === 'medium' ? 350 : 600

    const toneDesc =
      tone < 33
        ? 'formal and academic'
        : tone < 66
        ? 'semi-formal and balanced'
        : 'casual and conversational'

    let styleSection: string

    if (presetType && PRESET_STYLE_GUIDES[presetType]) {
      styleSection = `WRITING STYLE — use the following preset persona:
${PRESET_STYLE_GUIDES[presetType]}`
    } else if (traitList.length > 0) {
      // Build style guide from deep traits, same pattern as rewrite
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

      styleSection = 'WRITING STYLE — write to match this person\'s exact voice:'

      if (dv) {
        styleSection += `
Characteristic words/phrases to weave in naturally: ${dv.characteristic_words.join(', ')}
Favorite transitions: ${dv.favorite_transitions.join(', ')}
Non-AI phrases to include: ${dv.non_ai_phrases.join(', ')}`
      }

      if (ss) {
        styleSection += `
Sentence structure: Average ${ss.avg_length} words per sentence. ${ss.short_sentence_pct}% short sentences (<8 words), ${ss.long_sentence_pct}% long. Fragment frequency: ${ss.fragment_frequency}. Common sentence openers: ${ss.common_openers.join(', ')}.`
      }

      if (pp) {
        styleSection += `
Punctuation style: ${pp.overall_style}. Patterns: ${pp.specific_deviations.join('; ')}.`
      }

      if (vm) {
        styleSection += `
Voice: ${vm.first_person_pct}% first-person. Active voice: ${vm.active_voice_pct}%. Formality: ${vm.formality_score}/100. Hedging: ${vm.hedging_frequency}.`
      }
    } else {
      styleSection = 'WRITING STYLE — write in a natural, human voice.'
    }

    const systemPrompt = `You are a writing assistant that generates original content in a specific human voice. You do NOT rewrite or summarize — you write original content from scratch based on the prompt.

${styleSection}

Target length: approximately ${targetWords} words.
Tone: ${toneDesc}.

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

Return ONLY the generated text, no preamble, no explanation.`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const generatedText =
      message.content[0].type === 'text' ? message.content[0].text.trim() : ''

    if (!generatedText) {
      return NextResponse.json({ error: 'Failed to generate content' }, { status: 500 })
    }

    return NextResponse.json({ generatedText })
  } catch (error) {
    console.error('Generate error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
