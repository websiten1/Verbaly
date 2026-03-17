import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#F8F9FC', minHeight: '100vh' }}>
      {/* Hero gradient section */}
      <div style={{ background: 'linear-gradient(180deg, #EEF3FF 0%, #F8F9FC 100%)' }}>
        <Navbar />

        {/* Hero */}
        <section className="px-4 md:px-8 py-16 md:py-24" style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center' }}>
          <h1 className="text-3xl md:text-5xl lg:text-6xl" style={{
            fontWeight: '700',
            color: '#1A2340',
            lineHeight: '1.1',
            letterSpacing: '-2px',
            marginBottom: '24px',
            maxWidth: '800px',
            margin: '0 auto 24px',
            fontFamily: 'Instrument Serif, serif',
          }}>
            Write like yourself.{' '}
            <span style={{ color: '#1A6EFF' }}>Every single time.</span>
          </h1>

          <p className="text-base md:text-xl" style={{
            color: '#4A5568',
            lineHeight: '1.7',
            maxWidth: '560px',
            margin: '0 auto 48px',
          }}>
            Upload your writing samples. <span style={{ fontWeight: 700, color: '#1A2340' }}>Verbaly</span> learns your unique voice, rhythm, and style — then transforms any AI-generated text to sound authentically like you.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <Link
              href="/signup"
              className="w-full sm:w-auto text-center"
              style={{
                backgroundColor: '#1A6EFF',
                color: '#FFFFFF',
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '700',
                letterSpacing: '-0.3px',
                display: 'block',
              }}
            >
              Start for free
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto text-center"
              style={{
                backgroundColor: '#FFFFFF',
                color: '#1A2340',
                padding: '14px 32px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '16px',
                fontWeight: '500',
                border: '1px solid #E8ECF4',
                display: 'block',
              }}
            >
              Log in
            </Link>
          </div>

          <p style={{ color: '#8A94A6', fontSize: '13px', marginTop: '24px' }}>
            No credit card required · 3 free rewrites per month
          </p>
        </section>
      </div>

      {/* Demo preview — hidden on mobile to save space */}
      <section className="hidden md:block px-4 md:px-8" style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '80px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid #E8ECF4',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
        }}>
          <div style={{
            backgroundColor: '#F8F9FC',
            padding: '12px 16px',
            borderBottom: '1px solid #E8ECF4',
            display: 'flex',
            gap: '8px',
          }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E8ECF4' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E8ECF4' }}></div>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#E8ECF4' }}></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
            <div style={{ padding: '24px', borderRight: '1px solid #E8ECF4' }}>
              <div style={{ color: '#8A94A6', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>AI Generated</div>
              <p style={{ color: '#4A5568', fontSize: '14px', lineHeight: '1.7' }}>
                In today&apos;s competitive landscape, leveraging cutting-edge artificial intelligence solutions enables organizations to optimize their operational efficiency and maximize stakeholder value through data-driven decision-making processes.
              </p>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ color: '#1A2340', fontSize: '12px', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>Your Voice</span>
                <span style={{
                  backgroundColor: 'rgba(0,229,204,0.12)',
                  color: '#00A890',
                  padding: '2px 8px',
                  borderRadius: '100px',
                  fontSize: '11px',
                  fontWeight: '600',
                }}>87% match</span>
              </div>
              <p style={{ color: '#1A2340', fontSize: '14px', lineHeight: '1.7' }}>
                Here&apos;s the thing — most companies are sitting on AI tools and still wondering why nothing&apos;s getting faster. The data&apos;s there. The decisions aren&apos;t. That gap? That&apos;s the problem worth solving.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="px-4 md:px-8 py-12 md:py-20" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', color: '#1A2340', letterSpacing: '-1px', marginBottom: '16px', fontFamily: 'Instrument Serif, serif' }}>
            How it works
          </h2>
          <p style={{ color: '#4A5568', fontSize: '17px' }}>Three simple steps to writing that&apos;s unmistakably you.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: '01',
              title: 'Upload your samples',
              desc: 'Share blog posts, emails, essays — any writing that reflects how you actually communicate.',
              icon: '↑',
            },
            {
              step: '02',
              title: 'AI learns your style',
              desc: 'Verbaly analyzes sentence structure, vocabulary, tone, rhythm, and dozens of micro-patterns.',
              icon: '◈',
            },
            {
              step: '03',
              title: 'Paste & rewrite',
              desc: 'Drop any AI text in, choose your intensity level, and watch it transform into your voice.',
              icon: '✦',
            },
          ].map((item) => (
            <div
              key={item.step}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8ECF4',
                borderRadius: '12px',
                padding: '32px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
              }}
            >
              <div style={{
                position: 'absolute',
                top: '20px',
                right: '24px',
                color: '#E8ECF4',
                fontSize: '48px',
                fontWeight: '800',
                letterSpacing: '-2px',
              }}>
                {item.step}
              </div>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(26,110,255,0.08)',
                border: '1px solid rgba(26,110,255,0.15)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                color: '#1A6EFF',
                marginBottom: '20px',
              }}>
                {item.icon}
              </div>
              <h3 style={{ color: '#1A2340', fontSize: '20px', fontWeight: '600', marginBottom: '12px', letterSpacing: '-0.3px' }}>
                {item.title}
              </h3>
              <p style={{ color: '#4A5568', fontSize: '15px', lineHeight: '1.65' }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="px-4 md:px-8 py-12 md:py-20" style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '700', color: '#1A2340', letterSpacing: '-1px', marginBottom: '16px', fontFamily: 'Instrument Serif, serif' }}>
            Simple pricing
          </h2>
          <p style={{ color: '#4A5568', fontSize: '17px' }}>Start free. Upgrade when you&apos;re ready.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ maxWidth: '900px', margin: '0 auto' }}>
          {[
            {
              name: 'Free',
              price: '$0',
              period: 'forever',
              features: ['3 rewrites per month', '1 writing sample', 'Basic style analysis', 'Email support'],
              cta: 'Get started',
              highlight: false,
            },
            {
              name: 'Student',
              price: '$7',
              period: 'per month',
              features: ['Unlimited rewrites', '5 writing samples', 'Full style analysis', 'Priority support', 'Rewrite history'],
              cta: 'Start Student',
              highlight: true,
            },
            {
              name: 'Academic Pro',
              price: '$18',
              period: 'per month',
              features: ['Everything in Student', '15 writing samples', 'Advanced profiling', 'Generate from scratch', 'Export history'],
              cta: 'Start Pro',
              highlight: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              style={{
                backgroundColor: '#FFFFFF',
                border: plan.highlight ? '2px solid #1A6EFF' : '1px solid #E8ECF4',
                borderRadius: '12px',
                padding: '32px',
                position: 'relative',
                boxShadow: plan.highlight ? '0 4px 24px rgba(26,110,255,0.15)' : '0 2px 12px rgba(26,110,255,0.08)',
              }}
            >
              {plan.highlight && (
                <div style={{
                  position: 'absolute',
                  top: '-12px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#1A6EFF',
                  color: '#FFFFFF',
                  padding: '4px 16px',
                  borderRadius: '100px',
                  fontSize: '12px',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                }}>
                  Most Popular
                </div>
              )}
              <div style={{ marginBottom: '24px' }}>
                <h3 style={{ color: '#1A2340', fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>{plan.name}</h3>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
                  <span style={{ color: plan.highlight ? '#1A6EFF' : '#1A2340', fontSize: '40px', fontWeight: '700', letterSpacing: '-2px' }}>{plan.price}</span>
                  <span style={{ color: '#8A94A6', fontSize: '14px' }}>/{plan.period}</span>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#4A5568', fontSize: '14px' }}>
                    <span style={{ color: '#1A6EFF', fontSize: '16px' }}>✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                style={{
                  display: 'block',
                  textAlign: 'center',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: '600',
                  backgroundColor: plan.highlight ? '#1A6EFF' : 'transparent',
                  color: plan.highlight ? '#FFFFFF' : '#1A2340',
                  border: plan.highlight ? 'none' : '1px solid #E8ECF4',
                }}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  )
}
