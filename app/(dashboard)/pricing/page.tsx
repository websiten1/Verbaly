'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const PLANS = {
  student: {
    monthly: 'price_1T9rnl1qRl4Kd6hG2HMlbVTP',
    annual: 'price_1T9rno1qRl4Kd6hGKVCzRf3U',
  },
  pro: {
    monthly: 'price_1T9roF1qRl4Kd6hGP76ZR2bb',
    annual: 'price_1T9roe1qRl4Kd6hG9J92JG9L',
  },
}

interface Plan {
  key: 'free' | 'student' | 'pro'
  name: string
  monthlyPrice: number | null
  annualPrice: number | null
  annualMonthlyPrice: number | null
  color: string
  accent: string
  description: string
  features: string[]
  cta: string
}

const plans: Plan[] = [
  {
    key: 'free',
    name: 'Free',
    monthlyPrice: 0,
    annualPrice: 0,
    annualMonthlyPrice: 0,
    color: '#64748B',
    accent: '#94A3B8',
    description: 'Get started with the basics.',
    features: [
      '3 rewrites per month',
      '1 writing sample upload',
      'Basic style analysis',
      'Email support',
    ],
    cta: 'Current Plan',
  },
  {
    key: 'student',
    name: 'Student',
    monthlyPrice: 7,
    annualPrice: 70,
    annualMonthlyPrice: 5.83,
    color: '#10B981',
    accent: '#34D399',
    description: 'For students who write constantly.',
    features: [
      'Unlimited rewrites',
      '5 writing sample uploads',
      'Full style DNA analysis',
      'All tones and formats',
      'Rewrite history',
      'Priority support',
    ],
    cta: 'Get Student',
  },
  {
    key: 'pro',
    name: 'Academic Pro',
    monthlyPrice: 18,
    annualPrice: 180,
    annualMonthlyPrice: 15,
    color: '#8B5CF6',
    accent: '#A78BFA',
    description: 'For serious academic writers.',
    features: [
      'Everything in Student',
      '15 writing sample uploads',
      'Advanced style profiling',
      'Generate from scratch',
      'All intensity levels',
      'Export history',
      'Dedicated support',
    ],
    cta: 'Get Academic Pro',
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return
      setUserId(user.id)

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan')
        .eq('user_id', user.id)
        .maybeSingle()

      setCurrentPlan(profile?.plan ?? 'free')
    }

    loadUser()
  }, [])

  async function handleSubscribe(plan: Plan) {
    if (!userId) return
    if (plan.key === 'free') return

    const priceId = annual ? PLANS[plan.key].annual : PLANS[plan.key].monthly
    setLoading(plan.key)

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })

      const data = await res.json()

      if (data.url) {
        window.location.href = data.url
      } else {
        console.error('No checkout URL returned:', data.error)
      }
    } catch (err) {
      console.error('Checkout error:', err)
    } finally {
      setLoading(null)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#F8FAFC',
        padding: '40px 24px',
      }}
    >
      {/* Header */}
      <div style={{ maxWidth: 960, margin: '0 auto', textAlign: 'center', marginBottom: 48 }}>
        <h1
          style={{
            fontSize: 36,
            fontWeight: 700,
            color: '#1E3A5F',
            marginBottom: 12,
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 400ms ease, transform 400ms ease',
          }}
        >
          Simple, honest pricing
        </h1>
        <p
          style={{
            fontSize: 16,
            color: '#64748B',
            marginBottom: 32,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 400ms ease 100ms',
          }}
        >
          Write like a human. Pay like one too.
        </p>

        {/* Monthly / Annual toggle */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            backgroundColor: '#E2E8F0',
            borderRadius: 100,
            padding: '4px',
          }}
        >
          <button
            onClick={() => setAnnual(false)}
            style={{
              padding: '8px 20px',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: !annual ? '#1E3A5F' : 'transparent',
              color: !annual ? '#FFFFFF' : '#64748B',
              transition: 'all 200ms ease',
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            style={{
              padding: '8px 20px',
              borderRadius: 100,
              border: 'none',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              backgroundColor: annual ? '#1E3A5F' : 'transparent',
              color: annual ? '#FFFFFF' : '#64748B',
              transition: 'all 200ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            Annual
            <span
              style={{
                backgroundColor: '#10B981',
                color: '#FFFFFF',
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 100,
              }}
            >
              Save 17%
            </span>
          </button>
        </div>
      </div>

      {/* Plan cards */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 24,
        }}
      >
        {plans.map((plan, i) => {
          const isCurrent = currentPlan === plan.key
          const isPopular = plan.key === 'student'
          const price = annual ? plan.annualMonthlyPrice : plan.monthlyPrice

          return (
            <div
              key={plan.key}
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 16,
                padding: 28,
                border: isCurrent
                  ? `2px solid ${plan.color}`
                  : isPopular
                  ? `2px solid ${plan.color}40`
                  : '2px solid #E2E8F0',
                position: 'relative',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 400ms ease ${i * 80}ms, transform 400ms ease ${i * 80}ms`,
                boxShadow: isPopular
                  ? `0 8px 32px ${plan.color}20`
                  : '0 1px 4px rgba(0,0,0,0.06)',
              }}
            >
              {/* Popular badge */}
              {isPopular && (
                <div
                  style={{
                    position: 'absolute',
                    top: -14,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: plan.color,
                    color: '#FFFFFF',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 16px',
                    borderRadius: 100,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Most Popular
                </div>
              )}

              {/* Plan name + color dot */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: plan.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1E3A5F' }}>
                  {plan.name}
                </span>
              </div>

              {/* Description */}
              <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20, lineHeight: 1.5 }}>
                {plan.description}
              </p>

              {/* Price */}
              <div style={{ marginBottom: 24 }}>
                {plan.monthlyPrice === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 40, fontWeight: 800, color: '#1E3A5F' }}>$0</span>
                    <span style={{ fontSize: 14, color: '#94A3B8' }}>/ forever</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                      <span style={{ fontSize: 40, fontWeight: 800, color: '#1E3A5F' }}>
                        ${price}
                      </span>
                      <span style={{ fontSize: 14, color: '#94A3B8' }}>/ mo</span>
                    </div>
                    {annual && (
                      <p style={{ fontSize: 12, color: '#10B981', marginTop: 2, fontWeight: 500 }}>
                        Billed ${plan.annualPrice}/year
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* CTA button */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrent || plan.key === 'free' || loading === plan.key}
                style={{
                  width: '100%',
                  padding: '12px 0',
                  borderRadius: 10,
                  border: 'none',
                  cursor: isCurrent || plan.key === 'free' ? 'default' : 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  marginBottom: 24,
                  transition: 'all 200ms ease',
                  backgroundColor: isCurrent
                    ? `${plan.color}20`
                    : plan.key === 'free'
                    ? '#F1F5F9'
                    : plan.color,
                  color: isCurrent
                    ? plan.color
                    : plan.key === 'free'
                    ? '#94A3B8'
                    : '#FFFFFF',
                  opacity: loading === plan.key ? 0.7 : 1,
                }}
              >
                {loading === plan.key
                  ? 'Redirecting...'
                  : isCurrent
                  ? 'Current Plan'
                  : plan.cta}
              </button>

              {/* Features list */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 13, color: '#475569' }}
                  >
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={plan.color}
                      strokeWidth={2.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0, marginTop: 1 }}
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Footer note */}
      <p
        style={{
          textAlign: 'center',
          fontSize: 13,
          color: '#94A3B8',
          marginTop: 40,
          opacity: mounted ? 1 : 0,
          transition: 'opacity 400ms ease 400ms',
        }}
      >
        Cancel anytime. No hidden fees. Secure payment via Stripe.
      </p>
    </div>
  )
}
