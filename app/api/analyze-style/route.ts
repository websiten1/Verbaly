import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

interface StyleAnalysis {
  vocabulary: string[]
  phrases: string[]
  punctuation: string[]
  structure: string[]
  voice: string[]
  never_does: string[]
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
          content: `Analyze these writing samples and return a JSON object with EXACTLY these 6 keys. Each key must contain an array of specific strings extracted from or derived directly from the text.

{
  "vocabulary": [list of exactly 10 most distinctive/unusual words this person uses — not common words, words specific to their voice],
  "phrases": [list of up to 10 recurring phrases, expressions, or sentence starters this person uses],
  "punctuation": [list of 3-5 specific observations about how they use commas, dashes, ellipses, semicolons — each observation should include a quoted example from the text],
  "structure": [list of 3-5 observations about sentence length and construction — include average length estimate, whether they use fragments, whether sentences are short/punchy or long/flowing — each with a quoted example],
  "voice": [list of 3-5 observations about formality, hedging, first-person use, rhetorical questions, confidence level — each with a specific example from the text],
  "never_does": [list of 5 patterns completely absent from their writing that would be out of character — things like "never uses numbered lists", "never writes in passive voice", "never starts sentences with 'Furthermore'"]
}

Writing samples:
${combinedSamples}`,
        },
      ],
    })

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : ''

    let analysis: StyleAnalysis
    try {
      // Strip optional markdown fences before parsing
      const cleaned = responseText.replace(/^```[a-z]*\n?/i, '').replace(/```$/, '').trim()
      analysis = JSON.parse(cleaned)
    } catch {
      return NextResponse.json({ error: 'Failed to parse style analysis' }, { status: 500 })
    }

    // ── Build rows to upsert ─────────────────────────────────────────────────
    const now = new Date().toISOString()

    const categoryTraits = [
      {
        user_id: userId,
        trait_name: 'vocabulary',
        trait_value: JSON.stringify(analysis.vocabulary),
        score: Math.min(analysis.vocabulary.length * 10, 100),
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'phrases',
        trait_value: JSON.stringify(analysis.phrases),
        score: Math.min(analysis.phrases.length * 10, 100),
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'punctuation',
        trait_value: JSON.stringify(analysis.punctuation),
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'structure',
        trait_value: JSON.stringify(analysis.structure),
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'voice',
        trait_value: JSON.stringify(analysis.voice),
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'never_does',
        trait_value: JSON.stringify(analysis.never_does),
        score: 80,
        updated_at: now,
      },
    ]

    // ── Display traits for backward compatibility ─────────────────────────────
    const displayTraits = [
      {
        user_id: userId,
        trait_name: 'vocabulary_richness',
        trait_value: analysis.vocabulary.slice(0, 3).join(', '),
        score: 80,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'sentence_variety',
        trait_value: analysis.structure[0] || 'Mixed sentence lengths',
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'tone',
        trait_value: analysis.voice[0] || 'Balanced',
        score: 70,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'voice_markers_display',
        trait_value: analysis.voice.find(v => v.toLowerCase().includes('person')) || analysis.voice[0] || 'Mixed',
        score: 75,
        updated_at: now,
      },
      {
        user_id: userId,
        trait_name: 'punctuation_style',
        trait_value: analysis.punctuation[0] || 'Standard',
        score: 70,
        updated_at: now,
      },
    ]

    const allTraits = [...categoryTraits, ...displayTraits]

    // ── Persist to Supabase (upsert on user_id + trait_name) ─────────────────
    const supabase = await createClient()

    const { data: upsertedTraits, error: upsertError } = await supabase
      .from('style_traits')
      .upsert(allTraits, { onConflict: 'user_id,trait_name' })
      .select()

    if (upsertError) {
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
