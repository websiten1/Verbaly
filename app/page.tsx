import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WaitlistForm from '@/components/WaitlistForm'

/* ─── Concentric ring decorative background ─────────────── */
function ConcentricRings({ opacity = 1 }: { opacity?: number }) {
  const radii = [68, 148, 244, 356, 484, 628]
  return (
    <div style={{
      position: 'absolute',
      top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '1300px', height: '1300px',
      pointerEvents: 'none',
      opacity,
    }}>
      {radii.map((r, i) => (
        <div
          key={r}
          style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: r * 2, height: r * 2,
            transform: 'translate(-50%, -50%)',
            borderRadius: '50%',
            border: '1px solid rgba(84,242,242,0.18)',
            animation: `ringPulse ${3.5 + i * 0.55}s ease-in-out infinite`,
            animationDelay: `${i * 0.35}s`,
          }}
        />
      ))}
    </div>
  )
}

/* ─── Step number badge ──────────────────────────────────── */
function StepBadge({ n }: { n: string }) {
  return (
    <div style={{
      width: '36px', height: '36px',
      borderRadius: '10px',
      backgroundColor: 'rgba(84,242,242,0.12)',
      border: '1px solid rgba(84,242,242,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '15px', fontWeight: '700',
      color: '#54F2F2', fontFamily: 'DM Sans, sans-serif',
      flexShrink: 0,
    }}>{n}</div>
  )
}

/* ─── Feature card ───────────────────────────────────────── */
function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      border: '1px solid #E8ECF4',
      borderRadius: '12px',
      padding: '28px',
      boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
      transition: 'box-shadow 200ms ease',
    }}>
      <div style={{
        width: '44px', height: '44px',
        backgroundColor: '#F9F8F5',
        border: '1px solid #E5E2D8',
        borderRadius: '12px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: '18px',
      }}>
        {icon}
      </div>
      <h3 style={{ color: '#16150F', fontSize: '16px', fontWeight: '600', marginBottom: '8px', letterSpacing: '-0.2px' }}>
        {title}
      </h3>
      <p style={{ color: '#6B6960', fontSize: '14px', lineHeight: '1.65' }}>
        {body}
      </p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div style={{ backgroundColor: '#F9F8F5' }}>

      {/* ════════════════════════════════════════════════════════
          HERO — dark evergreen
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#061517', position: 'relative', overflow: 'hidden' }}>
        <ConcentricRings />

        <Navbar />

        {/* Hero text */}
        <div style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '96px 24px 72px',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* Eyebrow pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: 'rgba(84,242,242,0.08)',
            border: '1px solid rgba(84,242,242,0.2)',
            borderRadius: '100px',
            padding: '6px 14px',
            marginBottom: '36px',
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#54F2F2' }} />
            <span style={{ color: '#9ECFCF', fontSize: '13px', fontWeight: '500', letterSpacing: '0.02em' }}>
              Style intelligence for the AI era
            </span>
          </div>

          {/* Headline */}
          <h1 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: 'clamp(48px, 7vw, 84px)',
            fontWeight: '400',
            lineHeight: '1.04',
            letterSpacing: '-2px',
            color: '#E4F5F5',
            marginBottom: '28px',
            maxWidth: '840px',
            margin: '0 auto 28px',
          }}>
            Your writing voice,{' '}
            <em style={{ color: '#54F2F2', fontStyle: 'italic' }}>preserved.</em>
          </h1>

          {/* Sub */}
          <p style={{
            color: '#9ECFCF',
            fontSize: 'clamp(16px, 2vw, 19px)',
            lineHeight: '1.65',
            maxWidth: '560px',
            margin: '0 auto 20px',
          }}>
            <span style={{ color: '#E4F5F5', fontWeight: '500' }}>Verbaly</span> analyzes your writing and transforms any AI-generated text into something that sounds unmistakably, authentically like you.
          </p>

          {/* Pre-launch line */}
          <p style={{
            color: '#54F2F2',
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '44px',
            letterSpacing: '0.01em',
          }}>
            Currently in pre-launch. Join the waitlist for free early access.
          </p>

          {/* Waitlist form */}
          <div id="waitlist" style={{ scrollMarginTop: '80px' }}>
            <WaitlistForm />
          </div>

          {/* Below-form trust lines */}
          <p style={{ color: '#5E8E90', fontSize: '13px', marginTop: '16px' }}>
            Free Pro access for the first 500 people. No credit card ever required.
          </p>
          <p style={{ color: '#9ECFCF', fontSize: '14px', marginTop: '10px' }}>
            🙋 247 people already waiting
          </p>
        </div>

        {/* Before / after demo card */}
        <div style={{
          maxWidth: '840px',
          margin: '0 auto',
          padding: '0 24px 80px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            backgroundColor: '#0D2225',
            border: '1px solid #1E3B3F',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(84,242,242,0.06)',
          }}>
            {/* Browser chrome */}
            <div style={{
              backgroundColor: '#061517',
              borderBottom: '1px solid #1E3B3F',
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
            }}>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#FF5F57','#FFBD2E','#28C840'].map((c) => (
                  <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', backgroundColor: c, opacity: 0.7 }} />
                ))}
              </div>
              <div style={{
                flex: 1, height: '24px',
                backgroundColor: 'rgba(255,255,255,0.04)',
                borderRadius: '6px',
                border: '1px solid #1E3B3F',
              }} />
            </div>

            {/* Split panel */}
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* AI text */}
              <div style={{ padding: '28px', borderBottom: '1px solid #1E3B3F', borderRight: '1px solid #1E3B3F' }} className="md:border-b-0">
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  marginBottom: '16px',
                }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#5E8E90' }} />
                  <span style={{ color: '#5E8E90', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    AI Generated
                  </span>
                </div>
                <p style={{ color: '#5E8E90', fontSize: '14px', lineHeight: '1.75' }}>
                  In today&apos;s competitive landscape, leveraging cutting-edge artificial intelligence solutions enables organizations to optimize their operational efficiency and maximize stakeholder value through data-driven decision-making processes.
                </p>
              </div>

              {/* Rewritten */}
              <div style={{ padding: '28px', borderRight: '1px solid #1E3B3F' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#54F2F2' }} />
                  <span style={{ color: '#9ECFCF', fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Your Voice
                  </span>
                  <span style={{
                    marginLeft: 'auto',
                    backgroundColor: 'rgba(84,242,242,0.15)',
                    color: '#54F2F2',
                    fontSize: '11px', fontWeight: '700',
                    padding: '3px 9px', borderRadius: '100px',
                  }}>
                    94% match
                  </span>
                </div>
                <p style={{ color: '#E4F5F5', fontSize: '14px', lineHeight: '1.75' }}>
                  Here&apos;s the thing — most companies are sitting on AI tools and still wondering why nothing&apos;s getting faster. The data&apos;s there. The decisions aren&apos;t. That gap? That&apos;s the problem worth solving.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '72px' }}>
          <p style={{ color: '#54F2F2', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            How it works
          </p>
          <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(34px, 5vw, 52px)', fontWeight: '400', color: '#16150F', letterSpacing: '-1.5px', lineHeight: '1.1' }}>
            Three steps to writing<br/>
            <em style={{ fontStyle: 'italic', color: '#042A2B' }}>that&apos;s unmistakably you.</em>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              n: '01',
              title: 'Upload your samples',
              body: 'Share essays, emails, blog posts — any writing that reflects how you actually communicate. The more authentic, the better.',
            },
            {
              n: '02',
              title: 'Verbaly learns your voice',
              body: 'Our AI analyzes sentence rhythm, vocabulary, punctuation habits, tone, and the micro-patterns that make your writing yours.',
            },
            {
              n: '03',
              title: 'Paste, adjust, transform',
              body: 'Drop in any AI-generated text. Choose your intensity level. Watch it transform into prose that sounds completely like you.',
            },
          ].map((step) => (
            <div
              key={step.n}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8ECF4',
                borderRadius: '12px',
                padding: '36px',
                position: 'relative',
                boxShadow: '0 2px 12px rgba(26,110,255,0.08)',
              }}
            >
              <div style={{
                position: 'absolute', top: '28px', right: '28px',
                fontSize: '40px', fontWeight: '800', color: '#F0EDE4',
                fontFamily: 'DM Sans, sans-serif', letterSpacing: '-2px',
              }}>
                {step.n}
              </div>
              <StepBadge n={step.n} />
              <h3 style={{ color: '#16150F', fontSize: '19px', fontWeight: '600', margin: '20px 0 10px', letterSpacing: '-0.3px' }}>
                {step.title}
              </h3>
              <p style={{ color: '#6B6960', fontSize: '15px', lineHeight: '1.65' }}>
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          WHO IS THIS FOR
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#FFFFFF', borderTop: '1px solid #E5E2D8', borderBottom: '1px solid #E5E2D8' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ color: '#54F2F2', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '40px' }}>
            Who it&apos;s for
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { icon: '✍️', label: 'Bloggers & content creators' },
              { icon: '🎓', label: 'Students & academics' },
              { icon: '💼', label: 'Professionals & marketers' },
            ].map(({ icon, label }) => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '28px 20px',
                  backgroundColor: '#F9F8F5',
                  border: '1px solid #E5E2D8',
                  borderRadius: '12px',
                }}
              >
                <span style={{ fontSize: '28px' }}>{icon}</span>
                <span style={{ color: '#16150F', fontSize: '14px', fontWeight: '600', textAlign: 'center', lineHeight: '1.4' }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════════════════════ */}
      <section style={{ borderBottom: '1px solid #E5E2D8' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: '400', color: '#16150F', letterSpacing: '-1.5px' }}>
              Everything that makes your writing,{' '}
              <em style={{ color: '#54F2F2', fontStyle: 'italic' }}>yours</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a5 5 0 1 0 5 5"/>
                  <path d="M12 12v4"/>
                  <path d="M12 20h.01"/>
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              }
              title="Voice Learning Engine"
              body="Upload samples of your real writing. Verbaly extracts your vocabulary, sentence structure, rhythm, and over 6 style dimensions."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
              }
              title="Rewrite Anything"
              body="Paste any AI-generated text — essays, emails, reports — and get it back sounding like you wrote every single word."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/>
                </svg>
              }
              title="Generate From Scratch"
              body="Give Verbaly a topic and it writes original content using your learned voice — with tone and length controls."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 6h16M4 12h8M4 18h4"/>
                </svg>
              }
              title="10-Level Intensity"
              body="From subtle polish to complete transformation. You decide how deeply Verbaly reshapes the text to match your voice."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9"/>
                  <polyline points="12 7 12 12 15 15"/>
                </svg>
              }
              title="Full Rewrite History"
              body="Every rewrite is saved with a match score. Browse, compare, and copy any past result at any time."
            />
            <FeatureCard
              icon={
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#042A2B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              }
              title="Preset Personas"
              body="Choose from The Academic, Casual Student, Creative Writer, or Professional — perfect profiles to start from."
            />
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          STYLE DNA — dark callout
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#042A2B', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', top: '50%', right: '-200px',
          transform: 'translateY(-50%)',
          width: '700px', height: '700px',
          pointerEvents: 'none',
        }}>
          {[80, 160, 250, 350].map((r, i) => (
            <div key={r} style={{
              position: 'absolute', top: '50%', left: '50%',
              width: r * 2, height: r * 2,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              border: '1px solid rgba(84,242,242,0.1)',
              animation: `ringPulse ${3 + i * 0.6}s ease-in-out infinite`,
              animationDelay: `${i * 0.3}s`,
            }} />
          ))}
        </div>

        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '100px 24px', position: 'relative', zIndex: 1 }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <p style={{ color: '#54F2F2', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '16px' }}>
                Your style DNA
              </p>
              <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(32px, 4.5vw, 50px)', fontWeight: '400', color: '#E4F5F5', letterSpacing: '-1.5px', lineHeight: '1.1', marginBottom: '20px' }}>
                Six dimensions.<br/>
                <em style={{ fontStyle: 'italic', color: '#9ECFCF' }}>One voice.</em>
              </h2>
              <p style={{ color: '#9ECFCF', fontSize: '16px', lineHeight: '1.65', marginBottom: '36px' }}>
                Verbaly doesn&apos;t just swap words. It understands how you actually write — from the vocabulary you reach for to the rhythms you unconsciously create.
              </p>
              <a
                href="#waitlist"
                style={{
                  display: 'inline-flex',
                  backgroundColor: '#54F2F2',
                  color: '#042A2B',
                  padding: '13px 28px',
                  borderRadius: '10px',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: '700',
                }}
              >
                Join the waitlist →
              </a>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { label: 'Vocabulary Fingerprint',  color: '#54F2F2',                  items: ['consequently', 'nuanced', 'pivot'] },
                { label: 'Favorite Phrases',        color: 'rgba(84,242,242,0.7)',     items: ['Here\'s the thing', 'Worth noting'] },
                { label: 'Punctuation Patterns',    color: 'rgba(84,242,242,0.55)',    items: ['Em-dash for emphasis', 'Ellipsis for pause'] },
                { label: 'Sentence Structure',      color: 'rgba(84,242,242,0.4)',     items: ['Short punchy sentences', 'Fragments allowed'] },
                { label: 'Voice Markers',           color: 'rgba(84,242,242,0.3)',     items: ['Conversational but sharp', '1st person direct'] },
                { label: 'Never Does',              color: 'rgba(84,242,242,0.2)',     items: ['Avoids passive voice', 'No jargon stacking'] },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    backgroundColor: 'rgba(84,242,242,0.04)',
                    border: '1px solid rgba(84,242,242,0.1)',
                    borderRadius: '10px',
                    padding: '14px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                >
                  <span style={{
                    fontSize: '11px', fontWeight: '600', letterSpacing: '0.06em',
                    color: row.color, whiteSpace: 'nowrap', minWidth: '160px',
                  }}>
                    {row.label}
                  </span>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {row.items.map((item) => (
                      <span
                        key={item}
                        style={{
                          backgroundColor: 'rgba(84,242,242,0.08)',
                          border: '1px solid rgba(84,242,242,0.15)',
                          borderRadius: '6px',
                          padding: '3px 9px',
                          fontSize: '12px',
                          color: '#9ECFCF',
                        }}
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════════════════ */}
      <section style={{ maxWidth: '700px', margin: '0 auto', padding: '100px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ color: '#54F2F2', fontSize: '13px', fontWeight: '600', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '12px' }}>
            FAQ
          </p>
          <h2 style={{ fontFamily: 'Instrument Serif, serif', fontSize: 'clamp(30px, 4vw, 44px)', fontWeight: '400', color: '#16150F', letterSpacing: '-1.5px' }}>
            Good questions.
          </h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {[
            {
              q: 'Is this just an AI detection bypass tool?',
              a: 'No. Verbaly isn\'t about hiding AI — it\'s about making any text sound like you wrote it. Whether you started with AI or a blank page, the output reflects your voice, your style, your rhythm.',
            },
            {
              q: 'When is Verbaly launching?',
              a: 'Soon. Everyone on the waitlist gets notified first and the first 500 get free Pro access at launch.',
            },
            {
              q: 'Is it really free?',
              a: 'Yes. Joining the waitlist is free, no credit card needed. We\'ll have a free tier at launch too.',
            },
          ].map(({ q, a }) => (
            <div
              key={q}
              style={{
                backgroundColor: '#FFFFFF',
                border: '1px solid #E8ECF4',
                borderRadius: '12px',
                padding: '28px',
                boxShadow: '0 2px 12px rgba(26,110,255,0.06)',
              }}
            >
              <h3 style={{ color: '#16150F', fontSize: '16px', fontWeight: '600', marginBottom: '10px', letterSpacing: '-0.2px' }}>
                {q}
              </h3>
              <p style={{ color: '#6B6960', fontSize: '15px', lineHeight: '1.65', margin: 0 }}>
                {a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════════════════ */}
      <section style={{ backgroundColor: '#061517', position: 'relative', overflow: 'hidden' }}>
        <ConcentricRings opacity={0.6} />
        <div style={{
          maxWidth: '700px', margin: '0 auto',
          padding: '120px 24px',
          textAlign: 'center',
          position: 'relative', zIndex: 1,
        }}>
          <h2 style={{
            fontFamily: 'Instrument Serif, serif',
            fontSize: 'clamp(38px, 5.5vw, 64px)',
            fontWeight: '400',
            color: '#E4F5F5',
            letterSpacing: '-1.5px',
            lineHeight: '1.08',
            marginBottom: '16px',
          }}>
            Be first. Get free Pro access at launch.
          </h2>
          <p style={{ color: '#9ECFCF', fontSize: '15px', marginBottom: '12px' }}>
            Join writers, students, bloggers and marketers who want their voice back.
          </p>
          <p style={{ color: '#5E8E90', fontSize: '13px', marginBottom: '40px' }}>
            Currently in pre-launch · No credit card ever required
          </p>

          <WaitlistForm />

          <p style={{ color: '#5E8E90', fontSize: '13px', marginTop: '16px' }}>
            Free Pro access for the first 500 people.
          </p>
          <p style={{ color: '#9ECFCF', fontSize: '14px', marginTop: '10px' }}>
            🙋 247 people already waiting
          </p>
        </div>
      </section>

      <Footer />
    </div>
  )
}
