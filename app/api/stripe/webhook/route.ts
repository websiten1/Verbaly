// IMPORTANT: Register this webhook URL in your Stripe dashboard:
// https://useverbaly.com/api/stripe/webhook
// Events to listen for:
//   - checkout.session.completed
//   - customer.subscription.updated
//   - customer.subscription.deleted
// After adding the endpoint, copy the Signing Secret into STRIPE_WEBHOOK_SECRET in your env.

import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient as createBrowserClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-02-25.clover',
})

// Service-role client — bypasses RLS for webhook writes
function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

const STUDENT_PRICE_IDS = new Set([
  'price_1T9rnl1qRl4Kd6hG2HMlbVTP', // Student Monthly
  'price_1T9rno1qRl4Kd6hGKVCzRf3U', // Student Annual
])

const PRO_PRICE_IDS = new Set([
  'price_1T9roF1qRl4Kd6hGP76ZR2bb', // Academic Pro Monthly
  'price_1T9roe1qRl4Kd6hG9J92JG9L', // Academic Pro Annual
])

function getPlanFromPriceId(priceId: string): 'student' | 'pro' | 'free' {
  if (STUDENT_PRICE_IDS.has(priceId)) return 'student'
  if (PRO_PRICE_IDS.has(priceId)) return 'pro'
  return 'free'
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (!userId || !session.subscription) break

        // Retrieve subscription to get the price ID
        const subscription = await stripe.subscriptions.retrieve(
          session.subscription as string
        )
        const priceId = subscription.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)

        await supabase.from('profiles').upsert(
          {
            user_id: userId,
            plan,
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
          },
          { onConflict: 'user_id' }
        )
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price.id
        const plan = getPlanFromPriceId(priceId)

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .maybeSingle()

        if (profile?.user_id) {
          await supabase
            .from('profiles')
            .update({ plan, stripe_subscription_id: subscription.id })
            .eq('user_id', profile.user_id)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription

        const { data: profile } = await supabase
          .from('profiles')
          .select('user_id')
          .eq('stripe_customer_id', subscription.customer as string)
          .maybeSingle()

        if (profile?.user_id) {
          await supabase
            .from('profiles')
            .update({ plan: 'free', stripe_subscription_id: null })
            .eq('user_id', profile.user_id)
        }
        break
      }

      default:
        // Unhandled event type — ignore
        break
    }
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
