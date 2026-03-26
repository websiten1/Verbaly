import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })

  const apiKey = process.env.BEEHIIV_API_KEY ?? 'To5fGt6RRrORgYVUpufOwqf2CE6jBHAG8sUOwQQZ2TruVKs9oppsU5qM7UAOAzMS'

  const res = await fetch(
    'https://api.beehiiv.com/v1/publications/5dbf8d69-9f54-4ee0-9658-260b88b823cb/subscriptions',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: 'website',
        utm_medium: 'organic',
      }),
    }
  )

  const responseText = await res.text()
  console.log('[subscribe] Beehiiv status:', res.status)
  console.log('[subscribe] Beehiiv body:', responseText)

  if (!res.ok) {
    return NextResponse.json({ error: 'Subscription failed', detail: responseText }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
