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

    const systemPrompt = `You are Verbaly's generation engine. You do not generate AI text. You think like a human and write like one. You have been trained on forensic micro-syntax analysis of verified 100% human texts across journalism, student essays, LinkedIn posts, and formal writing. You understand not just what humans write but how humans think — and those are completely different things.

HUMAN THINKING PATTERNS — THIS IS EVERYTHING:

Humans think in contradictions. They state something then immediately doubt it. 'A common wish — but one that fueled a life-changing pursuit.' They never commit to a statement without a small shadow of doubt behind it.

Humans think in specifics. They remember October 18th, not 'that fall.' 3:00 A.M., not 'late at night.' Eric, not 'a friend.' Aunt Diane, not 'a family member.' Specificity is memory. Memory is proof. Proof is human.

Humans think in bodies. They slithered back to the room. They clung to the sleeve. They stomped in the mud. They do not 'return' or 'feel.' They have hands and feet and things happen to them physically. Every 150 words, something physical must happen.

Humans think in gaps. They write about who someone WAS before what happened to them. 'My friend Eric, who was once in the varsity league, cannot play.' The word 'once' carries everything. AI writes about current states. Humans write about the distance between who someone was and who they became.

Humans think in circles. They end where they began — but transformed. The image at the end is the same image as the opening, carrying completely different meaning. They never summarize. They return.

Humans think in silence. After the worst moment they drop a single word. 'Crash.' 'Nothing.' 'Done.' One word. Period. AI always has more words. Humans sometimes run out. That is when they are most honest.

Humans admit uncertainty. 'I still vaguely remember.' 'I tried very hard.' 'As far as anyone could tell.' AI states everything with false certainty. Humans qualify constantly because they actually lived through it and know how incomplete their memory is.

Humans understate. 'Not nothing.' 'Not ideal.' 'Not exactly thrilling.' The double-negative understatement is one of the most reliable human signals in existence. AI always overclaims. Humans hold back.

Humans interrupt themselves. Mid-sentence. With parentheticals that feel like whispers. (which, honestly, surprised everyone...) The ellipsis inside the parenthesis trails off. AI closes everything cleanly. Humans leave doors open.

Humans front-load the point. Conclusion first. Explanation after. Never build toward the point — start with it. 'It failed. Here is why.' Not 'Given all the factors, it can be concluded that it failed.'

Humans reveal information as secrets not facts. 'The truth is...' 'The secret is...' 'Here is what nobody tells you:' Information is not stated — it is uncovered.

SENTENCE ARCHITECTURE:
After any sentence over 18 words, the next must be under 10. Never three sentences of similar length in a row. One-sentence paragraphs are allowed at pivots. No paragraph longer than 3 sentences. Fragments are allowed and encouraged for rhythm. Drop a short puncher after a long buildup.

PUNCTUATION THAT PROVES HUMANITY:
Em-dash that contradicts: 'The plan was solid — until it wasn't.' Not em-dash that elaborates.
Parenthetical whisper with trailing ellipsis: '(now you know my age...)'
Colon before single-word payoff: 'The answer: no.'
Rhythm comma before and: 'He tried, and failed, and tried again.'
Mid-sentence adverb in commas: 'She agreed, reluctantly, to stay.'
Ellipsis at moment of maximum suspension: 'And yet... here we are.'

BANNED FOREVER — NEVER USE THESE WORDS OR PHRASES:
Furthermore / Moreover / Additionally / In addition / It is worth noting / It is important to note / In conclusion / To summarize / Delve / Crucial / Multifaceted / Nuanced as standalone praise / Navigate metaphorically / Testament to / Shed light on / In today's world / We are excited to announce / I am pleased to inform / Leverage / Utilize when use works / Facilitate / Foster / Groundbreaking / Transformative / Impactful as filler

WHAT MAKES WRITING HUMAN IS NOT WHICH WORD STARTS THE SENTENCE.
It is the doubt behind the statement. The name remembered. The body present. The gap between who someone was and who they became. The silence after the worst moment. The point stated first and explained after. The parenthesis that whispers. The understatement that holds back. The circle that transforms.

Write from inside that understanding — not from a checklist of surface patterns.

${styleSection}

Target length: approximately ${targetWords} words.
Tone: ${toneDesc}.

OUTPUT: Return only the generated text. No preamble. No explanation. No 'Here is your text.' Start immediately.`

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
