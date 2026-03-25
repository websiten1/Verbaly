'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

const JET = "'JetBrains Mono', 'Courier New', monospace"
const CPR = "'Courier Prime', 'Courier New', monospace"

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

function Check({ lime = false }: { lime?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, marginTop: '2px' }}>
      <polyline
        points="2.5 7 5.5 10 11.5 4"
        stroke={lime ? '#CCFF00' : 'rgba(255,255,255,0.4)'}
        strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  )
}

export default function PricingPage() {
  const [annual,        setAnnual]        = useState(false)
  const [currentPlan,   setCurrentPlan]   = useState<string>('free')
  const [userId,        setUserId]        = useState<string | null>(null)
  const [loading,       setLoading]       = useState<string | null>(null)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)
  const [mounted,       setMounted]       = useState(false)

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
      if (!res.ok) { setCheckoutError(data.error || 'Checkout failed. Please try again.'); return }
      if (data.url) window.location.href = data.url
      else setCheckoutError('Checkout failed. Missing redirect URL.')
    } catch (err) {
      console.error('Checkout error:', err)
      setCheckoutError('Checkout failed. Please try again.')
    } finally { setLoading(null) }
  }

  return (
    <div style={{ minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <h1 style={{
          fontFamily: CPR,
          fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: '700',
          color: '#0E0E0E', letterSpacing: '-0.02em',
          textTransform: 'uppercase', marginBottom: '8px',
          opacity: mounted ? 1 : 0, transform: mounted ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 400ms ease, transform 400ms ease',
        }}>
          Simple, honest pricing
        </h1>
        <p style={{
          fontFamily: JET, color: '#888880', fontSize: '11px',
          textTransform: 'uppercase', letterSpacing: '.12em',
          marginBottom: '28px',
          opacity: mounted ? 1 : 0, transition: 'opacity 400ms ease 80ms',
        }}>
          Write like a human. Pay like one too.
        </p>

        {/* Monthly / Annual toggle */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '2px',
          border: '1px solid #E0E0E0', padding: '3px',
        }}>
          {[
            { label: 'Monthly', value: false },
            { label: 'Annual',  value: true,  badge: 'Save 17%' },
          ].map(({ label, value, badge }) => (
            <button
              key={label}
              onClick={() => setAnnual(value)}
              style={{
                padding: '8px 18px', border: 'none', cursor: 'pointer',
                fontFamily: JET, fontSize: '10px', fontWeight: '500',
                textTransform: 'uppercase', letterSpacing: '.12em',
                backgroundColor: annual === value ? '#0E0E0E' : 'transparent',
                color: annual === value ? '#FFFFFF' : '#888880',
                transition: 'all 200ms ease',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}
            >
              {label}
              {badge && (
                <span style={{
                  fontFamily: JET, fontSize: '9px', fontWeight: '500',
                  textTransform: 'uppercase', letterSpacing: '.1em',
                  color: annual === value ? '#CCFF00' : '#7B5CF0',
                  border: `1px solid ${annual === value ? '#CCFF00' : '#7B5CF0'}`,
                  padding: '1px 6px',
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" style={{ maxWidth: '960px', margin: '0 auto' }}>

        {checkoutError && (
          <div style={{
            gridColumn: '1 / -1',
            border: '1px solid #DC2626', padding: '12px 16px',
            fontFamily: JET, color: '#DC2626', fontSize: '11px',
            textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '-4px',
          }}>
            {checkoutError}
          </div>
        )}

        {PLAN_DATA.map((plan, i) => {
          const isCurrent = currentPlan === plan.key
          const price     = annual ? plan.annualMonthlyPrice : plan.monthlyPrice
          const isPopular = plan.popular

          return (
            <div
              key={plan.key}
              style={{
                backgroundColor: isPopular ? '#0A0A0A' : '#FFFFFF',
                border: isPopular ? '1px solid #CCFF00' : '1px solid #E0E0E0',
                borderRadius: '2px',
                padding: '28px',
                position: 'relative',
                opacity:    mounted ? 1 : 0,
                transform:  mounted ? 'translateY(0)' : 'translateY(16px)',
                transition: `opacity 400ms ease ${i * 80}ms, transform 400ms ease ${i * 80}ms`,
              }}
            >
              {isPopular && (
                <div style={{
                  position: 'absolute', top: '-1px', left: '50%', transform: 'translateX(-50%)',
                  backgroundColor: '#CCFF00', color: '#0A0A0A',
                  fontFamily: JET, fontSize: '9px', fontWeight: '700',
                  textTransform: 'uppercase', letterSpacing: '.15em',
                  padding: '4px 14px', whiteSpace: 'nowrap',
                }}>
                  Most popular
                </div>
              )}

              {/* Plan name + dot */}
              <div style={{ marginBottom: '20px', paddingTop: isPopular ? '12px' : '0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{
                    width: '7px', height: '7px', borderRadius: '50%', flexShrink: 0,
                    backgroundColor: isPopular ? '#CCFF00' : plan.key === 'pro' ? '#7B5CF0' : '#E0E0E0',
                  }} />
                  <h3 style={{
                    fontFamily: JET, fontSize: '11px', fontWeight: '500',
                    textTransform: 'uppercase', letterSpacing: '.15em',
                    color: isPopular ? '#FFFFFF' : '#0E0E0E',
                  }}>
                    {plan.name}
                  </h3>
                </div>
                <p style={{
                  fontFamily: JET, fontSize: '11px', lineHeight: '1.6',
                  color: isPopular ? 'rgba(255,255,255,0.4)' : '#888880',
                }}>
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div style={{ marginBottom: '24px' }}>
                {plan.monthlyPrice === 0 ? (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                    <span style={{ fontFamily: CPR, fontSize: '40px', fontWeight: '700', letterSpacing: '-2px', color: isPopular ? '#FFFFFF' : '#0E0E0E' }}>
                      $0
                    </span>
                    <span style={{ fontFamily: JET, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', color: isPopular ? 'rgba(255,255,255,0.3)' : '#888880' }}>
                      / forever
                    </span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                      <span style={{ fontFamily: CPR, fontSize: '40px', fontWeight: '700', letterSpacing: '-2px', color: isPopular ? '#CCFF00' : '#0E0E0E' }}>
                        ${price}
                      </span>
                      <span style={{ fontFamily: JET, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', color: isPopular ? 'rgba(255,255,255,0.3)' : '#888880' }}>
                        / mo
                      </span>
                    </div>
                    {annual && (
                      <p style={{ fontFamily: JET, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '.1em', color: isPopular ? 'rgba(204,255,0,0.7)' : '#7B5CF0', marginTop: '4px' }}>
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
                  width: '100%', padding: '11px 0',
                  border: 'none', borderRadius: '2px',
                  cursor: isCurrent || plan.key === 'free' ? 'default' : 'pointer',
                  fontFamily: JET, fontSize: '11px', fontWeight: '500',
                  textTransform: 'uppercase', letterSpacing: '.12em',
                  marginBottom: '24px',
                  transition: 'all 200ms ease',
                  backgroundColor: isCurrent || plan.key === 'free'
                    ? (isPopular ? 'rgba(255,255,255,0.06)' : '#F5F5F5')
                    : isPopular ? '#CCFF00' : '#0E0E0E',
                  color: isCurrent || plan.key === 'free'
                    ? (isPopular ? 'rgba(255,255,255,0.25)' : '#888880')
                    : isPopular ? '#0A0A0A' : '#FFFFFF',
                  opacity: loading === plan.key ? 0.7 : 1,
                }}
              >
                {loading === plan.key ? 'Redirecting…' : isCurrent ? 'Current plan' : plan.cta}
              </button>

              {/* Features */}
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{
                    display: 'flex', alignItems: 'flex-start', gap: '8px',
                    fontFamily: JET, fontSize: '11px', lineHeight: '1.5',
                    color: isPopular ? 'rgba(255,255,255,0.55)' : '#888880',
                  }}>
                    <Check lime={isPopular} />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      <p style={{
        textAlign: 'center', fontFamily: JET, fontSize: '10px',
        color: '#888880', textTransform: 'uppercase', letterSpacing: '.12em',
        marginTop: '36px',
        opacity: mounted ? 1 : 0, transition: 'opacity 400ms ease 400ms',
      }}>
        Cancel anytime &middot; No hidden fees &middot; Secure payment via Stripe
      </p>
    </div>
  )
}
