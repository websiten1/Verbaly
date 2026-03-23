'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const PLANS = {
  student: {
    monthly: 'price_1T9rnl1qRl4Kd6hG2HMlbVTP',
    annual:  'price_1T9rno1qRl4Kd6hGKVCzRf3U',
  },
  pro: {
    monthly: 'price_1T9roF1qRl4Kd6hGP76ZR2bb',
    annual:  'price_1T9roe1qRl4Kd6hG9J92JG9L',
  },
}

interface Plan {
  key:                'free' | 'student' | 'pro'
  name:               string
  monthlyPrice:       number | null
  annualPrice:        number | null
  annualMonthlyPrice: number | null
  description:        string
  features:           string[]
  cta:                string
  popular:            boolean
}

const PLAN_DATA: Plan[] = [
  {
    key: 'free', name: 'Free',
    monthlyPrice: 0, annualPrice: 0, annualMonthlyPrice: 0,
    description: 'Try it out, no strings attached.',
    features: ['3 rewrites per month', '1 writing sample', 'Basic style analysis', 'Email support'],
    cta: 'Current plan', popular: false,
  },
  {
    key: 'student', name: 'Student',
    monthlyPrice: 7, annualPrice: 70, annualMonthlyPrice: 5.83,
    description: 'For students who write constantly.',
    features: ['Unlimited rewrites', '5 writing samples', 'Full style DNA analysis', 'All tones & formats', 'Rewrite history', 'Priority support'],
    cta: 'Get Student', popular: true,
  },
  {
    key: 'pro', name: 'Academic Pro',
    monthlyPrice: 18, annualPrice: 180, annualMonthlyPrice: 15,
    description: 'For serious academic writers.',
    features: ['Everything in Student', '15 writing samples', 'Advanced style profiling', 'Generate from scratch', 'All intensity levels', 'Export history', 'Dedicated support'],
    cta: 'Get Academic Pro', popular: false,
  },
]

function Check({ cyan = false }: { cyan?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: '1px' }}>
      <circle cx="8" cy="8" r="7.5" fill={cyan ? 'rgba(84,242,242,0.18)' : 'rgba(4,42,43,0.07)'}/>
      <polyline points="4.5 8 7 10.5 11.5 5.5" stroke={cyan ? '#54F2F2' : '#042A2B'} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export default function PricingPage() {
  const [annual,      setAnnual]      = useState(false)
  const [currentPlan, setCurrentPlan] = useState<string>('free')
  const [userId,      setUserId]      = useState<string | null>(null)
  const [loading,     setLoading]     = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [mounted,     setMounted]     = useState(false)

  useEffect(() => {
    setMounted(true)
    const supabase = createClient()

    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setUserId(user.id)
      const { data: profile } = await supabase
        .from('profiles').select('plan').eq('user_id', user.id).maybeSingle()
      setCurrentPlan(profile?.plan ?? 'free')
    }
    loadUser()
  }, [])

  async function handleSubscribe(plan: Plan) {
    if (!userId || plan.key === 'free') return
    const priceId = annual ? PLANS[plan.key].annual : PLANS[plan.key].monthly
    setCheckoutError(null)
    setLoading(plan.key)
    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, userId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCheckoutError(data.error || 'Checkout failed. Please try again.')
        return
      }
      if (data.url) window.location.href = data.url
      else setCheckoutError('Checkout failed. Missing redirect URL.')
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutError('Checkout failed. Please try again.')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '52px' }}>
        <h1 style={{
          fontFamily: 'Instrument Serif, serif',
          fontSize: 'clamp(30px, 4vw, 44px)',
          fontWeight: '400', color: '#16150F',
          letterSpacing: '-1px', marginBottom: '10px',
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 400ms ease, transform 400ms ease',
        }}>
          Simple, honest pricing
        </h1>
        <p style={{ color: '#6B6960', fontSize: '16px', marginBottom: '32px', opacity: mounted ? 1 : 0, transition: 'opacity 400ms ease 80ms' }}>
          Write like a human. Pay like one too.
        </p>

        {/* Monthly / Annual toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '4px',
          backgroundColor: '#FFFFFF', border: '1px solid #E5E2D8',
          borderRadius: '100px', padding: '4px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}>
          {[
            { label: 'Monthly', value: false },
            { label: 'Annual',  value: true,  badge: 'Save 17%' },
          ].map(({ label, value, badge }) => (
            <button
              key={label}
              onClick={() => setAnnual(value)}
              style={{
                padding: '8px 20px', borderRadius: '100px', border: 'none',
                cursor: 'pointer', fontSize: '14px', fontWeight: '500',
                backgroundColor: annual === value ? '#042A2B' : 'transparent',
                color: annual === value ? '#FFFFFF' : '#6B6960',
                transition: 'all 200ms ease', fontFamily: 'DM Sans, sans-serif',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {label}
              {badge && (
                <span style={{
                  backgroundColor: annual === value ? 'rgba(84,242,242,0.2)' : 'rgba(84,242,242,0.15)',
                  color: annual === value ? '#54F2F2' : '#042A2B',
                  fontSize: '11px', fontWeight: '700', padding: '1px 7px', borderRadius: '100px',
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: '960px', margin: '0 auto' }}>
        {checkoutError && (
          <div style={{
            gridColumn: '1 / -1',
            backgroundColor: 'rgba(220,38,38,0.05)',
            border: '1px solid rgba(220,38,38,0.18)',
            borderRadius: '10px',
            padding: '12px 16px',
            color: '#DC2626',
            fontSize: '14px',
            marginBottom: '-6px',
          }}>
            {checkoutError}
          </div>
        )}
        {PLAN_DATA.map((plan, i) => {
          const isCurrent = currentPlan === plan.key
          const price     = annual ? plan.annualMonthlyPrice : plan.monthlyPrice
          const isDark    = plan.popular

          return (
            <div
              key={plan.key}
              style={{
                backgroundColor: isDark ? '#042A2B' : '#FFFFFF',
                border: '1px solid #E8ECF4',
                borderRadius: '12px',
                padding: '32px',
                position: 'relative',
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 400ms ease ${i * 80}ms, transform 400ms ease ${i * 80}ms`,
                boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
              }}
            >
              {plan.popular && (
                <div style={{
                  position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: '#54F2F2', color: '#042A2B',
                  fontSize: '12px', fontWeight: '700',
                  padding: '4px 16px', borderRadius: '100px', whiteSpace: 'nowrap',
                }}>
                  Most popular
                </div>
              )}

              {/* Plan name + desc */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: plan.popular ? '#54F2F2' : plan.key === 'pro' ? '#9ECFCF' : '#E5E2D8',
                  }} />
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: isDark ? '#E4F5F5' : '#16150F', fontFamily: 'DM Sans, sans-serif' }}>
                    {plan.name}
                  </h3>
                </div>
                <p style={{ fontSize: '13px', color: isDark ? '#5E8E90' : '#6B6960', lineHeight: '1.5' }}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '28px' }}>
                {plan.monthlyPrice === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '42px', fontWeight: '800', letterSpacing: '-2px', color: isDark ? '#E4F5F5' : '#16150F' }}>
                      $0
                    </span>
                    <span style={{ fontSize: '14px', color: isDark ? '#5E8E90' : '#A09D95' }}>/ forever</span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: '42px', fontWeight: '800', letterSpacing: '-2px', color: plan.popular ? '#54F2F2' : '#16150F' }}>
                        ${price}
                      </span>
                      <span style={{ fontSize: '14px', color: isDark ? '#5E8E90' : '#A09D95' }}>/ mo</span>
                    </div>
                    {annual && (
                      <p style={{ fontSize: '12px', color: isDark ? '#54F2F2' : '#042A2B', marginTop: '3px', fontWeight: '500' }}>
                        Billed ${plan.annualPrice}/year
                      </p>
                    )}
                  </>
                )}
              </div>

              {/* CTA */}
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={isCurrent || plan.key === 'free' || loading === plan.key}
                style={{
                  width: '100%', padding: '12px 0',
                  borderRadius: '10px', border: 'none',
                  cursor: isCurrent || plan.key === 'free' ? 'default' : 'pointer',
                  fontSize: '14px', fontWeight: '600',
                  marginBottom: '28px',
                  transition: 'all 200ms ease',
                  backgroundColor: isCurrent || plan.key === 'free'
                    ? (isDark ? 'rgba(255,255,255,0.05)' : '#F9F8F5')
                    : isDark ? '#54F2F2' : '#042A2B',
                  color: isCurrent || plan.key === 'free'
                    ? (isDark ? '#5E8E90' : '#A09D95')
                    : isDark ? '#042A2B' : '#FFFFFF',
                  opacity: loading === plan.key ? 0.7 : 1,
                  fontFamily: 'DM Sans, sans-serif',
                }}
              >
                {loading === plan.key ? 'Redirecting…' : isCurrent ? 'Current plan' : plan.cta}
              </button>

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', color: isDark ? '#9ECFCF' : '#6B6960' }}>
                    <Check cyan={isDark} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <p style={{
        textAlign: 'center', fontSize: '13px', color: '#A09D95',
        marginTop: '40px',
        opacity: mounted ? 1 : 0, transition: 'opacity 400ms ease 400ms',
      }}>
        Cancel anytime · No hidden fees · Secure payment via Stripe
      </p>
    </div>
  )
}
